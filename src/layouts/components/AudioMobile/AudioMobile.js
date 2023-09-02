import classNames from 'classnames/bind';
import styles from './AudioMobile.module.scss';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faEllipsis, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    play,
    pause,
    loop,
    random,
    loadSong,
    setPlaylist,
    setSongLyric,
    setLink,
    setVipSong,
} from '~/slices/songSlice';
import { RxTrackNext, RxTrackPrevious, RxPause, RxPlay, RxShuffle, RxLoop } from 'react-icons/rx';
import { FaSpinner } from 'react-icons/fa';
import musicApi from '~/api/music/musicApi';
import SongLyric from '~/layouts/components/SongLyric';
import { addToast } from '~/slices/toastSlice';
import axios from 'axios';
import SongItemMobile from '~/layouts/components/SongItemMobile';
import { useLocation } from 'react-router-dom';
import { setShow } from '~/slices/navigateSlice';

const cx = classNames.bind(styles);
function AudioSong() {
    // get store redux
    const songState = useSelector((state) => state.song);
    const toastState = useSelector((state) => state.toast);
    const { pathname } = useLocation();

    const dispatch = useDispatch();

    // state

    const [currentTime, setCurrentTime] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [loading, setLoading] = useState(false);
    // references
    const audioPlayer = useRef(); // reference our audio component
    const progressBar = useRef(); // reference our progress bar
    const animationRef = useRef(); // reference the animation currenttime
    const progressRef = useRef(); // reference the animation progress
    const imgRef = useRef();
    const imgSmallRef = useRef();
    const imgAnimate = useRef();
    const imgSmallAnimate = useRef();

    // setting step
    const step = 1;

    // useEffect
    // play and pause
    useEffect(() => {
        if (songState.link.link === null) return;
        if (songState.isPlay === false) {
            audioPlayer.current.pause();
            cancelAnimationFrame(progressRef.current);
            cancelAnimationFrame(animationRef.current);
            if (imgAnimate.current) imgAnimate.current.pause();
            if (imgSmallAnimate.current) imgSmallAnimate.current.pause();
            return;
        }
        if (songState.isPlay) {
            const playPromise = audioPlayer.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then((_) => {
                        animationRef.current = requestAnimationFrame(whilePlaying);
                        progressRef.current = requestAnimationFrame(whileSeeking);
                        if (imgAnimate.current) imgAnimate.current.play();
                        if (imgSmallAnimate.current) imgSmallAnimate.current.play();
                        audioPlayer.current.onended = () => {
                            handleOnEnded();
                        };
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            }
        }
        // eslint-disable-next-line
    }, [songState.isPlay]);

    // change song
    useEffect(() => {
        if (songState.link.link === null || songState.song.encodeId !== songState.link.songId) return;
        if (songState.song.encodeId === songState.link.songId)
            if (songState.isPlay && audioPlayer?.current?.paused === false) {
                audioPlayer.current.pause();
                if (songState.song.encodeId === songState.link.songId) {
                    audioPlayer.current = new Audio(songState.link.link);
                    setLoading(false);
                    const playPromise = audioPlayer.current.play();
                    if (playPromise !== undefined) {
                        playPromise
                            .then((_) => {
                                animationRef.current = requestAnimationFrame(whilePlaying);
                                progressRef.current = requestAnimationFrame(whileSeeking);
                                if (imgAnimate.current) imgAnimate.current.play();
                                if (imgSmallAnimate.current) imgSmallAnimate.current.play();
                                audioPlayer.current.onended = () => {
                                    handleOnEnded();
                                };
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                    }
                }
            } else if (songState.isPlay && audioPlayer?.current?.paused === true) {
                if (songState.song.encodeId === songState.link.songId) {
                    audioPlayer.current = new Audio(songState.link.link);
                    setLoading(false);
                    const playPromise = audioPlayer.current.play();
                    if (playPromise !== undefined) {
                        playPromise
                            .then((_) => {
                                animationRef.current = requestAnimationFrame(whilePlaying);
                                progressRef.current = requestAnimationFrame(whileSeeking);
                                if (imgAnimate.current) imgAnimate.current.play();
                                if (imgSmallAnimate.current) imgSmallAnimate.current.play();
                                audioPlayer.current.onended = () => {
                                    handleOnEnded();
                                };
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                    }
                }
            } else if (songState.isPlay === false) {
                audioPlayer.current = new Audio(songState.link.link);
                setLoading(false);
            }
        // eslint-disable-next-line
    }, [songState.link]);

    // set current time and progress
    useEffect(() => {
        if (audioPlayer?.current?.paused === false) {
            progressBar.current.max = songState.song.duration * step;
            setLoading(true);
            audioPlayer.current.pause();
            audioPlayer.current.currentTime = 0;
        } else {
            progressBar.current.max = songState.song.duration * step;
            audioPlayer.current.currentTime = 0;
            setLoading(true);
        }
        // eslint-disable-next-line
    }, [songState.song]);

    // function
    const calculateTime = (secs) => {
        const minutes = Math.floor(secs / 60);
        const returnedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
        const seconds = Math.floor(secs % 60);
        const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
        return `${returnedMinutes}:${returnedSeconds}`;
    };

    const whilePlaying = () => {
        setCurrentTime(progressBar?.current?.value / step);
        animationRef.current = requestAnimationFrame(whilePlaying);
    };

    const whileSeeking = () => {
        progressBar.current.value = audioPlayer?.current?.currentTime * step;
        progressRef.current = requestAnimationFrame(whileSeeking);
    };

    useEffect(() => {
        changeRange();
        // eslint-disable-next-line
    }, [seeking]);

    const changeRange = () => {
        if (seeking) {
            cancelAnimationFrame(progressRef.current);
        } else {
            audioPlayer.current.currentTime = progressBar.current.value / step;
            progressRef.current = requestAnimationFrame(whileSeeking);
            setCurrentTime(progressBar.current.value / step);
        }
    };

    // volume
    useEffect(() => {
        if (songState.muted) {
            audioPlayer.current.volume = 0.0;
        } else {
            audioPlayer.current.volume = songState.volume;
        }
        // eslint-disable-next-line
    }, [songState.isPlay, songState.volume, songState.muted]);

    useEffect(() => {
        if (songState.vipSong) {
            handleNextSong();
        }
        // eslint-disable-next-line
    }, [songState.vipSong, toastState.toastList]);

    // loop
    useEffect(() => {
        if (songState.loop) {
            audioPlayer.current.loop = true;
        } else {
            audioPlayer.current.loop = false;
        }
        // eslint-disable-next-line
    }, [songState.loop]);

    const handleRepeat = () => {
        if (songState.loop) {
            dispatch(loop(false));
        } else {
            dispatch(loop(true));
        }
    };

    const handleRandom = () => {
        if (songState.random) {
            dispatch(random(false));
        } else {
            dispatch(random(true));
        }
    };

    const convertTimeToNumber = (string) => {
        const minutes = string.slice(1, 2);
        const seconds = string.slice(3, 9);
        const value = Math.round(Number(minutes) * 60 * 1000 + Math.round(Number(seconds) * 1000));
        return value;
    };

    const handleAsyncFunctionSong = (songId) => {
        const linkPromise = musicApi.getSong(songState.albumPlaying.playlist[songId].encodeId);
        const fileLyricPromise = musicApi.getLyricSong(songState.albumPlaying.playlist[songId].encodeId);

        Promise.all([linkPromise, fileLyricPromise])
            .then((response) => {
                if (response[0].success) {
                    dispatch(
                        setLink({
                            link: response[0].data['128'],
                            songId: response[0].info.encodeId,
                        }),
                    );
                    dispatch(setVipSong(false));
                } else {
                    dispatch(
                        addToast({
                            id: toastState.toastList.length + 1,
                            content: response[0].message,
                            type: 'warning',
                        }),
                    );
                    dispatch(setVipSong(true));
                }
                if (response[1].lyric.file && response[0].success) {
                    const lyricPromise = axios.get(response[1].lyric.file, {
                        headers: {
                            'content-type': 'application/octet-stream',
                        },
                    });

                    lyricPromise
                        .then((lyric) => {
                            const array = lyric.data.split('\n');
                            const array1 = array.map((line) => {
                                return {
                                    startTime: convertTimeToNumber(line.slice(1, 9)),
                                    words: line.slice(10, line.length),
                                };
                            });
                            dispatch(
                                setSongLyric({ lyric: array1, songId: response[0].info.encodeId, noLyric: false }),
                            );
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                } else {
                    dispatch(
                        setSongLyric({
                            lyric: null,
                            songId: null,
                            noLyric: true,
                        }),
                    );
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const handleShuffleSong = async () => {
        try {
            const randomId = Math.floor(Math.random() * songState.albumPlaying.playlist.length);
            dispatch(loadSong(songState.albumPlaying.playlist[randomId]));
            handleAsyncFunctionSong(randomId);
        } catch (error) {
            console.log(error);
        }
    };

    const index = songState?.albumPlaying?.playlist?.findIndex((song) => song.encodeId === songState.song.encodeId);
    const handleNextSong = async () => {
        if (songState.random) {
            handleShuffleSong();
        } else {
            try {
                if (index === songState.albumPlaying.playlist.length - 1) {
                    dispatch(loadSong(songState.albumPlaying.playlist[0]));
                    handleAsyncFunctionSong(0);
                } else {
                    const songId = index + 1;
                    dispatch(loadSong(songState.albumPlaying.playlist[songId]));
                    handleAsyncFunctionSong(songId);
                }
            } catch (error) {
                console.log(error);
            }
        }
    };

    const handlePreSong = async () => {
        if (songState.random) {
            handleShuffleSong();
        } else {
            try {
                if (index === 0) {
                    const songId = songState.albumPlaying.playlist.length - 1;
                    dispatch(loadSong(songState.albumPlaying.playlist[songId]));
                    handleAsyncFunctionSong(songId);
                } else {
                    const songId = index - 1;
                    dispatch(loadSong(songState.albumPlaying.playlist[songId]));
                    handleAsyncFunctionSong(songId);
                }
            } catch (error) {
                console.log(error);
            }
        }
    };

    const handleLoopSong = () => {
        dispatch(pause());
        dispatch(play());
    };

    // next song
    const handleOnEnded = () => {
        if (songState.loop) {
            handleLoopSong();
        } else if (songState.random) {
            handleShuffleSong();
        } else {
            handleNextSong();
        }
    };

    // rotate cd
    useEffect(() => {
        if (imgRef.current) {
            imgAnimate.current = imgRef.current.animate(
                [
                    {
                        transform: 'rotate(0)',
                    },
                    {
                        transform: 'rotate(359deg)',
                    },
                ],
                {
                    duration: 30000,
                    iterations: Infinity,
                },
            );
        }
        if (imgAnimate.current) imgAnimate.current.pause();
        // eslint-disable-next-line
    }, [imgRef.current, songState.song]);

    useEffect(() => {
        if (imgSmallRef.current) {
            imgSmallAnimate.current = imgSmallRef.current.animate(
                [
                    {
                        transform: 'rotate(0)',
                    },
                    {
                        transform: 'rotate(359deg)',
                    },
                ],
                {
                    duration: 30000,
                    iterations: Infinity,
                },
            );
        }
        if (imgSmallAnimate.current) imgSmallAnimate.current.pause();
        // eslint-disable-next-line
    }, [imgSmallRef.current, songState.song]);

    const [hide, setHide] = useState(false);
    const [small, setSmall] = useState(true);
    const trackRunable = (progressBar?.current?.value / songState?.song?.duration) * 100;

    // slider
    const initialX = useRef();
    const currentX = useRef();
    const initialY = useRef();
    const currentY = useRef();
    const [active, setActive] = useState(1);
    const sliderItemRef = useRef();
    const [tranformValue, setTranformValue] = useState(0);
    const sensitivity = 70;

    const [counter, setCounter] = useState(0);
    useEffect(() => {
        if (counter === 0) setTranformValue(-sliderItemRef?.current?.offsetWidth);
        // eslint-disable-next-line
    }, [sliderItemRef, small]);

    const handleTouchStart = (event) => {
        initialX.current = event.touches[0].clientX;
        initialY.current = event.touches[0].clientY;
    };

    const condition = useRef();
    const handleTouchMove = (event) => {
        currentX.current = event.touches[0].clientX;
        currentY.current = event.touches[0].clientY;

        if (currentX.current - initialX.current < 0 && Math.abs(currentX.current - initialX.current) > sensitivity) {
            condition.current = 'next';
        }

        if (currentX.current - initialX.current > 0 && currentX.current - initialX.current > sensitivity) {
            condition.current = 'previous';
        }

        const x = currentX.current - initialX.current;
        const y = currentY.current - initialY.current;
        const tan = Math.abs(y / x);

        const position = currentX.current - initialX.current;
        if (tan < 1) {
            if ((condition.current === 'previous' && active === 0) || (condition.current === 'next' && active === 2)) {
                if (Math.abs(position) === sensitivity) {
                    setTranformValue(-(active * sliderItemRef?.current?.offsetWidth) + position);
                }
                return;
            } else {
                setTranformValue(-(active * sliderItemRef?.current?.offsetWidth) + position);
            }
        }
    };

    const handleTouchEnd = (event) => {
        if (condition.current === 'next' && active < 2) {
            setTranformValue(-((active + 1) * sliderItemRef?.current?.offsetWidth));
            const pre = active + 1;
            setActive(pre);
            return;
        } else if (condition.current === 'previous' && active > 0) {
            setTranformValue(-((active - 1) * sliderItemRef?.current?.offsetWidth));
            const pre = active - 1;
            setActive(pre);
        } else {
            const x = currentX.current - initialX.current;
            const y = currentY.current - initialY.current;
            const tan = Math.abs(y / x);
            if (tan < 1) {
                setTranformValue(-(active * sliderItemRef?.current?.offsetWidth));
            }
        }
    };

    const [transition, setTransition] = useState(false);
    const [background, setBackground] = useState(false);
    const handleScroll = () => {
        document.body.style.overflow = 'auto';
    };

    return (
        <div className={cx(background && 'container', pathname === ('/login' || '/register') && 'hiden')}>
            <div className={cx('wrapper', !small && 'show', hide && 'hide')}>
                <audio id="audio" src={songState.link} ref={audioPlayer} preload={'metadata'}></audio>
                <div className={cx('body')}>
                    <div className={cx('header')}>
                        <div
                            className={cx('header-tab')}
                            onMouseDown={() => {
                                setTransition(true);
                            }}
                        >
                            <p
                                className={cx('header-item', active === 0 && 'active')}
                                onClick={() => {
                                    setTranformValue(0);
                                    setActive(0);
                                    setCounter((pre) => pre + 1);
                                }}
                            >
                                Playlist
                            </p>
                            <p
                                className={cx('header-item', active === 1 && 'active')}
                                onClick={() => {
                                    setTranformValue(-sliderItemRef?.current?.offsetWidth);
                                    setActive(1);
                                    setCounter((pre) => pre + 1);
                                }}
                            >
                                Bài hát
                            </p>
                            <p
                                className={cx('header-item', active === 2 && 'active')}
                                onClick={() => {
                                    setTranformValue(-sliderItemRef?.current?.offsetWidth * 2);
                                    setActive(2);
                                    setCounter((pre) => pre + 1);
                                }}
                            >
                                Lời bài hát
                            </p>
                        </div>
                        <div
                            className={cx('header-icon')}
                            onClick={() => {
                                setCounter((pre) => pre + 1);
                                setHide(true);
                                dispatch(setShow(true));
                                setBackground(false);
                                setTimeout(() => {
                                    setSmall(true);
                                    setHide(false);
                                }, 200);
                                handleScroll();
                            }}
                        >
                            <FontAwesomeIcon icon={faChevronDown} />
                        </div>
                    </div>

                    <div className={cx('slider')}>
                        <div
                            className={cx('slider-container')}
                            onTouchStart={(event) => {
                                handleTouchStart(event);
                                setTransition(false);
                            }}
                            onTouchMove={(event) => handleTouchMove(event)}
                            onTouchEnd={(event) => {
                                setTransition(true);
                                handleTouchEnd(event);
                                condition.current = '';
                            }}
                            onMouseDown={() => setTransition(false)}
                            onMouseUp={() => setTransition(true)}
                            style={{
                                transform: `translateX(${tranformValue}px)`,
                                transitionProperty: `transform`,
                                transitionTimingFunction: 'ease-in',
                                transitionDuration: transition ? '0.1s' : '0s',
                            }}
                        >
                            <div className={cx('slider-item')} ref={sliderItemRef}>
                                <div className={cx('playlist')}>
                                    <div className={cx('playlist-header')}>
                                        <p>
                                            Đang phát từ playlist:{' '}
                                            <span className={cx('text-album')}>
                                                {songState.albumPlaying && songState.albumPlaying.title}
                                            </span>
                                        </p>
                                    </div>
                                    <div className={cx('playlist-body')}>
                                        {songState.albumPlaying.playlist && (
                                            <SongItemMobile
                                                songList={songState.albumPlaying.playlist}
                                                active={active}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className={cx('slider-item')}>
                                <div className={cx('img')}>
                                    <img
                                        ref={imgRef}
                                        className={cx('song-img')}
                                        src={songState.song.thumbnailM.replace('w240_r1x1_jpeg', 'w480_r1x1_webp')}
                                        alt=""
                                    ></img>
                                </div>
                                <div className={cx('song')}>
                                    <div className={cx('song-info')}>
                                        <div className={cx('info-icon')}>
                                            <FontAwesomeIcon icon={faEllipsis} />
                                        </div>
                                        <div className={cx('info-song')}>
                                            <p>{songState.song && songState.song.title}</p>
                                            <p>{songState.song && songState.song.artistNames}</p>
                                        </div>
                                        <div className={cx('info-icon')}>
                                            <FontAwesomeIcon icon={faHeart} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={cx('slider-item')}>
                                <div className={cx('lyric')}>
                                    <SongLyric
                                        currentTime={audioPlayer?.current?.currentTime}
                                        loading={loading}
                                        activeTab={active}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={cx('footer')}>
                        <div className={cx('range')}>
                            <span>{calculateTime(currentTime)}</span>
                            <div className={cx('input-container')}>
                                <input
                                    name="range"
                                    ref={progressBar}
                                    className={cx('progressBar')}
                                    type={'range'}
                                    defaultValue={0}
                                    onChange={changeRange}
                                    onTouchStart={() => setSeeking(true)}
                                    onTouchEnd={() => setSeeking(false)}
                                ></input>
                                <div
                                    className={cx('input-track')}
                                    style={{
                                        width: trackRunable < 50 ? trackRunable + 1 + '%' : trackRunable - 1 + '%',
                                    }}
                                ></div>
                            </div>

                            <span>{songState.song && calculateTime(songState.song.duration)}</span>
                        </div>
                        <div className={cx('action', 'large')}>
                            <div className={cx('button')}>
                                <Tippy content="Bật phát ngẫu nhiên">
                                    <div
                                        className={cx('button-list', songState.random && 'active')}
                                        onClick={handleRandom}
                                    >
                                        <RxShuffle className={cx('button-icon')} />
                                    </div>
                                </Tippy>
                                <div className={cx('button-list')} onClick={handlePreSong}>
                                    <RxTrackPrevious className={cx('button-icon')} />
                                </div>

                                {loading === true ? (
                                    <div className={cx('button-list-play')} onClick={() => dispatch(play())}>
                                        <FaSpinner className={cx('button-icon-load')} />
                                    </div>
                                ) : songState.isPlay === false ? (
                                    <div className={cx('button-list-play')} onClick={() => dispatch(play())}>
                                        <RxPlay className={cx('button-icon-play')} />
                                    </div>
                                ) : (
                                    <div className={cx('button-list-pause')} onClick={() => dispatch(pause())}>
                                        <RxPause className={cx('button-icon-pause')} />
                                    </div>
                                )}

                                <div
                                    className={cx('button-list')}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        handleNextSong();
                                    }}
                                >
                                    <RxTrackNext className={cx('button-icon')} />
                                </div>
                                <Tippy content="Lặp lại bài hát">
                                    <div
                                        className={cx('button-list', songState.loop && 'active')}
                                        onClick={handleRepeat}
                                    >
                                        <RxLoop className={cx('button-icon')} />
                                    </div>
                                </Tippy>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={cx('img-position')}>
                    <img alt="" src={songState?.song?.thumbnailM}></img>
                </div>
                <div className={cx('div-position')}></div>
            </div>

            <div
                className={cx('small-audio', small && 'show', pathname === '/login' && 'hiden')}
                onClick={() => {
                    dispatch(setPlaylist(false));
                    setSmall(false);
                    dispatch(setShow(false));
                    setTimeout(() => {
                        setBackground(true);
                        document.body.style.overflow = 'hidden';
                    }, [200]);
                }}
                style={{ display: pathname === '/register' && 'none' }}
            >
                <div className="slidecontainer">
                    <input
                        name="small-range"
                        className="slider"
                        type="range"
                        value={progressBar?.current?.value || 0}
                        max={songState?.song?.duration}
                        onChange={changeRange}
                    ></input>
                    <div
                        className="slider-track"
                        style={{ width: (progressBar?.current?.value / songState?.song?.duration) * 100 + '%' }}
                    ></div>
                </div>
                <div className={cx('small-info')}>
                    <img
                        src={songState.song.thumbnailM.replace('w240_r1x1_jpeg', 'w480_r1x1_webp')}
                        alt=""
                        ref={imgSmallRef}
                    ></img>
                    <div className={cx('small-info-song')}>
                        <p>{songState.song && songState.song.title}</p>
                        <p>{songState.song && songState.song.artistsNames}</p>
                    </div>
                </div>
                <div className={cx('small-button')}>
                    {!songState.isPlay ? (
                        <div
                            className={cx('button-list-play')}
                            onClick={(e) => {
                                e.stopPropagation();
                                dispatch(play());
                            }}
                        >
                            <RxPlay className={cx('button-icon-play')} />
                        </div>
                    ) : (
                        <div
                            className={cx('button-list-pause')}
                            onClick={(e) => {
                                e.stopPropagation();
                                dispatch(pause());
                            }}
                        >
                            <RxPause className={cx('button-icon-pause')} />
                        </div>
                    )}
                    <div className={cx('responsive-small')}>
                        <div
                            className={cx('button-list')}
                            onClick={(event) => {
                                event.stopPropagation();
                                handleNextSong();
                            }}
                        >
                            <RxTrackNext className={cx('button-icon')} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AudioSong;
