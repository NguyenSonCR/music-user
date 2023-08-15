import classNames from 'classnames/bind';
import styles from './Audio.module.scss';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faEllipsis, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import { ReactComponent as CloseIcon } from '~/assets/icon/close.svg';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    play,
    pause,
    volume,
    muted,
    loop,
    random,
    mounted,
    loadSong,
    setPlaylist,
    setSongLyric,
    setLyricPage,
    setLink,
    setVipSong,
} from '~/slices/songSlice';
import images from '~/assets/img';
import { TbMicrophone2 } from 'react-icons/tb';
import { BsVolumeUp, BsVolumeMute } from 'react-icons/bs';
import { RxTrackNext, RxTrackPrevious, RxPause, RxPlay, RxShuffle, RxLoop, RxListBullet } from 'react-icons/rx';
import { FaSpinner } from 'react-icons/fa';
import musicApi from '~/api/music/musicApi';
import SongLyric from '~/layouts/components/SongLyric';
import { addToast } from '~/slices/toastSlice';
import axios from 'axios';

const cx = classNames.bind(styles);
function AudioSong({ container }) {
    // get store redux
    const songState = useSelector((state) => state.song);
    const toastState = useSelector((state) => state.toast);

    const dispatch = useDispatch();

    // state
    const [small, setSmall] = useState(false);
    const pageLyrics = songState.lyricPage;
    const [currentTime, setCurrentTime] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [loading, setLoading] = useState(false);
    // references
    const audioPlayer = useRef(); // reference our audio component
    const progressBar = useRef(); // reference our progress bar
    const animationRef = useRef(); // reference the animation currenttime
    const progressRef = useRef(); // reference the animation progress

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
            return;
        }
        if (songState.isPlay) {
            const playPromise = audioPlayer.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then((_) => {
                        animationRef.current = requestAnimationFrame(whilePlaying);
                        progressRef.current = requestAnimationFrame(whileSeeking);
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

    // handle duration and progress

    const handleMuted = () => {
        dispatch(muted(true));
    };

    const handleChangeVolume = (event) => {
        dispatch(volume(event.target.value / 100));
    };

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

    const handleClose = () => {
        dispatch(pause());
        dispatch(setPlaylist(false));
        dispatch(mounted());
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

    // playlist
    const onChangePlaylist = () => {
        if (songState.playlist) {
            dispatch(setPlaylist(false));
        } else {
            dispatch(setPlaylist(true));
        }
    };

    // drag
    const smallAudioRef = useRef();

    var active = false;
    var currentX;
    var currentY;
    var initialX;
    var initialY;
    const xOffset = useRef();
    const yOffset = useRef();

    useEffect(() => {
        xOffset.current = 0;
        yOffset.current = 0;
    }, [small]);

    container?.addEventListener('touchstart', dragStart, {
        passive: false,
    });
    container?.addEventListener('touchend', dragEnd, {
        passive: false,
    });
    container?.addEventListener('touchend', dragEnd, {
        passive: false,
    });
    container?.addEventListener('touchmove', drag, {
        passive: false,
    });

    container?.addEventListener('mousedown', dragStart, {
        passive: false,
    });
    container?.addEventListener('mouseup', dragEnd, {
        passive: false,
    });
    container?.addEventListener('mousemove', drag, {
        passive: false,
    });

    function dragStart(e) {
        if (e.type === 'touchstart') {
            initialX = e.touches[0].clientX - xOffset.current;
            initialY = e.touches[0].clientY - yOffset.current;
        } else {
            initialX = e.clientX - xOffset.current;
            initialY = e.clientY - yOffset.current;
        }

        if (smallAudioRef?.current?.contains(e.target)) {
            active = true;
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        active = false;
    }

    function drag(e) {
        if (active) {
            e.preventDefault();

            if (e.type === 'touchmove') {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }

            xOffset.current = currentX;
            yOffset.current = currentY;

            setTranslate(currentX, currentY, smallAudioRef.current);
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = 'translate3d(' + xPos + 'px, ' + yPos + 'px, 0)';
    }

    return (
        <div className={cx(!songState.mounted && 'show')}>
            <div className={cx('wrapper', pageLyrics && 'page_lyrics', small && 'small')}>
                {songState.song && (
                    <audio
                        id="audio"
                        src={songState.link}
                        ref={audioPlayer}
                        preload={'metadata'}
                        onEnded={() => {
                            console.log('end song');
                        }}
                    ></audio>
                )}
                {!pageLyrics && (
                    <div className={cx('responsive')}>
                        <div
                            className={cx('button-close')}
                            onClick={() => {
                                if (songState.playlist) {
                                    dispatch(setPlaylist(false));
                                }
                                setSmall(true);
                            }}
                        >
                            <img alt="" className={cx('responsive-icon')} src={images.shrink}></img>
                        </div>
                        <div className={cx('button-close')}>
                            <CloseIcon
                                className={cx('responsive-icon')}
                                onClick={() => {
                                    handleClose();
                                }}
                            />
                        </div>
                    </div>
                )}
                {!pageLyrics && (
                    <div className={cx('info')}>
                        <img alt="" className={cx('info-img')} src={songState.song && songState.song.thumbnailM}></img>

                        <div className={cx('info-song')}>
                            {songState.song.title.length > 13 ? (
                                <div className={cx('info-song__marquee')}>
                                    <span
                                        className={cx('info-song__marquee-text')}
                                        style={
                                            songState.isPlay
                                                ? {
                                                      animation: `marquee ${songState.song.title.length}s linear 2s infinite`,
                                                  }
                                                : {}
                                        }
                                    >
                                        {songState.song && songState.song.title}
                                    </span>
                                    <span
                                        className={cx('info-song__marquee-text')}
                                        style={
                                            songState.isPlay
                                                ? {
                                                      animation: `marquee ${songState.song.title.length}s linear 2s infinite`,
                                                  }
                                                : {}
                                        }
                                    >
                                        {songState.song && songState.song.title}
                                    </span>
                                </div>
                            ) : (
                                <p className={cx('info-song__text')}>{songState.song && songState.song.title}</p>
                            )}

                            <p className={cx('info-song__text')}>{songState.song && songState.song.artistNames}</p>
                        </div>
                        <div className={cx('info-icon')}>
                            <FontAwesomeIcon icon={faHeart} />
                        </div>
                        <div className={cx('info-icon')}>
                            <FontAwesomeIcon icon={faEllipsis} />
                        </div>
                    </div>
                )}
                {pageLyrics && (
                    <div className={cx('lyrics')}>
                        <div className={cx('lyrics-header')}>
                            <div className={cx('lyrics-logo')}></div>
                            <div className={cx('lyrics-title')}>
                                <p>Lời bài hát</p>
                            </div>
                            <div className={cx('lyrics-icon')} onClick={() => dispatch(setLyricPage(false))}>
                                <div className={cx('button-list')}>
                                    <FontAwesomeIcon icon={faChevronDown} />
                                </div>
                            </div>
                        </div>
                        <div className={cx('lyrics-content')}>
                            <img
                                className={cx('lyrics-content-img')}
                                src={songState.song.thumbnailM.replace('w240_r1x1_jpeg', 'w480_r1x1_webp')}
                                alt=""
                            ></img>
                            <div className={cx('lyrics-content-text')}>
                                <SongLyric currentTime={audioPlayer.current.currentTime} loading={loading} />
                            </div>
                        </div>
                    </div>
                )}

                <div className={cx(!pageLyrics && 'action', pageLyrics && 'page_lyrics-action')}>
                    <div className={cx('button')}>
                        <Tippy content="Bật phát ngẫu nhiên">
                            <div className={cx('button-list', songState.random && 'active')} onClick={handleRandom}>
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
                            <div className={cx('button-list', songState.loop && 'active')} onClick={handleRepeat}>
                                <RxLoop className={cx('button-icon')} />
                            </div>
                        </Tippy>
                    </div>
                    <div className={cx('range')}>
                        <span>{calculateTime(currentTime)}</span>
                        <input
                            name="range"
                            ref={progressBar}
                            className={cx('progressBar')}
                            type={'range'}
                            defaultValue={0}
                            onChange={changeRange}
                            onMouseDown={() => setSeeking(true)}
                            onMouseUp={() => setSeeking(false)}
                        ></input>
                        <span>{songState.song && calculateTime(songState.song.duration)}</span>
                    </div>
                </div>
                {!pageLyrics && (
                    <div className={cx('more')}>
                        <div
                            className={cx('more-wrapper')}
                            onClick={() => {
                                dispatch(setPlaylist(false));
                                dispatch(setLyricPage(true));
                            }}
                        >
                            <TbMicrophone2 className={cx('more-icon')} />
                        </div>

                        {songState.muted === true || songState.volume === 0 ? (
                            <div
                                className={cx('more-wrapper')}
                                onClick={() => {
                                    dispatch(muted(false));
                                }}
                            >
                                <BsVolumeMute className={cx('more-icon')} />
                            </div>
                        ) : (
                            <div className={cx('more-wrapper')} onClick={handleMuted}>
                                <BsVolumeUp className={cx('more-icon')} />
                            </div>
                        )}
                        <div className={cx('more-volume')}>
                            <input
                                type={'range'}
                                className={cx('volume')}
                                min={0}
                                max={100}
                                step={1}
                                onChange={handleChangeVolume}
                                value={songState.volume * 100}
                            ></input>
                        </div>
                        <div className={cx('split')}></div>
                        <div className={cx('more-list')} onClick={onChangePlaylist}>
                            <RxListBullet className={cx('more-icon')} />
                        </div>
                    </div>
                )}
            </div>

            {small && (
                <div className={cx('small-audio')} ref={smallAudioRef}>
                    {!songState.isPlay ? (
                        <div
                            className={cx('button-list-play')}
                            onClick={() => {
                                dispatch(play());
                            }}
                        >
                            <RxPlay className={cx('button-icon-play')} />
                        </div>
                    ) : (
                        <div
                            className={cx('button-list-pause')}
                            onClick={() => {
                                dispatch(pause());
                            }}
                        >
                            <RxPause className={cx('button-icon-pause')} />
                        </div>
                    )}
                    <div className={cx('responsive-small')}>
                        <div
                            className={cx('button-close')}
                            onClick={() => {
                                dispatch(setPlaylist(false));
                                setSmall(false);
                            }}
                        >
                            <img className={cx('responsive-icon')} src={images.enlarge} alt=""></img>
                        </div>
                        <div
                            className={cx('button-close')}
                            onClick={() => {
                                handleClose();
                            }}
                        >
                            <CloseIcon className={cx('responsive-icon')} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AudioSong;
