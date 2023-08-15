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

const cx = classNames.bind(styles);
function AudioSong() {
    // get store redux
    const songState = useSelector((state) => state.song);
    const toastState = useSelector((state) => state.toast);

    const dispatch = useDispatch();

    // state
    const [small, setSmall] = useState(true);
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

    const [tab, setTab] = useState(2);

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

    // const handleClose = () => {
    //     dispatch(pause());
    //     dispatch(setPlaylist(false));
    //     dispatch(mounted());
    // };

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

    if (small) {
        document.body.classList.remove('model');
    } else {
        document.body.classList.add('model');
    }

    const [hide, setHide] = useState(false);
    const trackRunable = (progressBar?.current?.value / songState?.song?.duration) * 100;

    // touch
    const initialX = useRef();
    const currentX = useRef();

    const handleTouchStart = (e) => {
        if (e.type === 'touchstart') {
            initialX.current = e.touches[0].clientX;
        } else {
            initialX.current = e.clientX;
        }
    };

    const [translate, setTranslate] = useState(null);

    const handleTouchMove = (e) => {
        if (e.type === 'touchmove') {
            currentX.current = e.touches[0].clientX - initialX.current;
        } else {
            currentX.current = e.clientX - initialX.current;
        }

        console.log(currentX.current);

        setTranslate(`${currentX.current}px`);
        // if (currentX.current < -100) {
        //     setTranslate('-50%');
        //     return;
        // }
    };

    return (
        <div className={cx(!songState.mounted && 'show')}>
            <div className={cx('wrapper', small && 'small', hide && 'hide')}>
                <audio id="audio" src={songState.link} ref={audioPlayer} preload={'metadata'}></audio>
                <div className={cx('body')}>
                    <div className={cx('header')}>
                        <div className={cx('header-tab')}>
                            <p className={cx('header-item', tab === 1 && 'active')} onClick={() => setTab(1)}>
                                Playlist
                            </p>
                            <p className={cx('header-item', tab === 2 && 'active')} onClick={() => setTab(2)}>
                                Bài hát
                            </p>
                            <p className={cx('header-item', tab === 3 && 'active')} onClick={() => setTab(3)}>
                                Lời bài hát
                            </p>
                        </div>
                        <div
                            className={cx('header-icon')}
                            onClick={() => {
                                setHide(true);
                                setTimeout(() => {
                                    setSmall(true);
                                }, 200);
                            }}
                        >
                            <FontAwesomeIcon icon={faChevronDown} />
                        </div>
                    </div>

                    <div className={cx('slider-container')}>
                        <div
                            className={cx('slider')}
                            style={{ transform: translate && `translateX(${translate})` }}
                            onTouchStart={(e) => handleTouchStart(e)}
                            onTouchMove={(e) => handleTouchMove(e)}
                        >
                            <div className={cx('slider-item')}>
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
                                        {songState.albumPlaying && (
                                            <SongItemMobile songList={songState.albumPlaying.playlist} />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className={cx('slider-item')}>
                                <img
                                    ref={imgRef}
                                    className={cx('song-img')}
                                    src={songState.song.thumbnailM.replace('w240_r1x1_jpeg', 'w480_r1x1_webp')}
                                    alt=""
                                ></img>
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
                                    <SongLyric currentTime={audioPlayer?.current?.currentTime} loading={loading} />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* <div className={cx('body-img')}>
                        <img
                            ref={imgRef}
                            className={cx('song-img', tab === 2 && 'active')}
                            src={songState.song.thumbnailM.replace('w240_r1x1_jpeg', 'w480_r1x1_webp')}
                            alt=""
                        ></img>
                    </div>

                    {tab === 2 ? (
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
                    ) : tab === 1 ? (
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
                                {songState.albumPlaying && (
                                    <SongItemMobile songList={songState.albumPlaying.playlist} primary={true} />
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className={cx('lyric')}>
                            <SongLyric currentTime={audioPlayer?.current?.currentTime} loading={loading} />
                        </div>
                    )} */}

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
            </div>

            <div
                className={cx('small-audio', small && 'show')}
                // ref={smallAudioRef}
                onClick={() => {
                    dispatch(setPlaylist(false));
                    setSmall(false);
                    setHide(false);
                }}
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
                        {/* <div
                                className={cx('button-close')}
                                onClick={() => {
                                    dispatch(setPlaylist(false));
                                    setSmall(false);
                                }}
                            >
                                <img className={cx('responsive-icon')} src={images.enlarge} alt=""></img>
                            </div> */}
                        {/* <div
                                className={cx('button-close')}
                                onClick={() => {
                                    handleClose();
                                }}
                            >
                                <CloseIcon className={cx('responsive-icon')} />
                            </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AudioSong;
