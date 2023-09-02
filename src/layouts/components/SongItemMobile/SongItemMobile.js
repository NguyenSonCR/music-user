import styles from './SongItemMobile.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    loadSong,
    play,
    pause,
    setSongLyric,
    setLink,
    setAlbumPlaying,
    setVipSong,
    setSongValueModel,
    setModelSong,
} from '~/slices/songSlice';
import musicApi from '~/api/music/musicApi';
import React from 'react';
import axios from 'axios';
import { addToast } from '~/slices/toastSlice';
import { setMyPlaylist } from '~/slices/songSlice';

const cx = classNames.bind(styles);

function SongItemMobile({ songList, title, myMusic, primary, noScroll, active }) {
    const dispatch = useDispatch();
    const songState = useSelector((state) => state.song);
    const authState = useSelector((state) => state.auth);
    const toastState = useSelector((state) => state.toast);

    // function
    // const calculateTime = (secs) => {
    //     const minutes = Math.floor(secs / 60);
    //     const returnedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    //     const seconds = Math.floor(secs % 60);
    //     const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    //     return `${returnedMinutes}:${returnedSeconds}`;
    // };

    useEffect(() => {
        if (songState.myPlaylist.loading) {
            musicApi
                .getAllMyPlaylist()
                .then((res) => {
                    dispatch(setMyPlaylist(res.playlist));
                })
                .catch((error) => console.log(error));
        }

        // eslint-disable-next-line
    }, [songState.myPlaylist.loading]);

    const convertTimeToNumber = (string) => {
        const minutes = string.slice(1, 2);
        const seconds = string.slice(3, 9);
        const value = Math.round(Number(minutes) * 60 * 1000 + Math.round(Number(seconds) * 1000));
        return value;
    };

    const handleSelectSong = (item) => {
        dispatch(setAlbumPlaying({ playlist: songList, title }));
        dispatch(play());
        dispatch(loadSong(item));
        const linkPromise = musicApi.getSong(item.encodeId);
        const fileLyricPromise = musicApi.getLyricSong(item.encodeId);

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

    // scroll
    const refs = songList.reduce((song, value) => {
        song[value.encodeId] = React.createRef();
        return song;
    }, {});

    const handleClickScroll = (id) => {
        refs[id]?.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
        });
    };

    useEffect(() => {
        if ((songState.song && noScroll) || (songState.song && active)) {
            return;
        } else if (songState.song) {
            handleClickScroll(songState.song.encodeId);
        }
        // eslint-disable-next-line
    }, [songState?.song?.encodeId]);

    return (
        <div className={cx('content', 'mobile')}>
            {songList &&
                songList.map((item, index) => {
                    if (myMusic && authState?.library.find((song) => song.encodeId === item.encodeId))
                        return <div key={index}></div>;
                    return (
                        <div
                            key={index}
                            className={cx(
                                'wrapper',
                                songState.song &&
                                    songState.song.encodeId === item.encodeId &&
                                    songState.song.nextSongId === item.nextSongId &&
                                    'active',
                                primary && 'primary',
                            )}
                            onClick={(e) => {
                                if (
                                    songState.song &&
                                    songState.song.encodeId === item.encodeId &&
                                    songState.song.nextSongId === item.nextSongId
                                ) {
                                    return e;
                                } else {
                                    handleSelectSong(item);
                                }
                            }}
                            ref={refs[item.encodeId]}
                        >
                            <div className={cx('song')}>
                                <div className={cx('info')}>
                                    <div className={cx('info-img')}>
                                        <img className={cx('img')} alt="" src={item.thumbnail}></img>
                                        {songState.song &&
                                            songState.song.encodeId === item.encodeId &&
                                            songState.song?.nextSongId === item?.nextSongId &&
                                            songState.isPlay && (
                                                <div
                                                    className={cx('img-play')}
                                                    onClick={() => {
                                                        dispatch(pause());
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faPause} className={cx('img-play-icon')} />
                                                </div>
                                            )}
                                        {songState.song &&
                                            songState.song.encodeId === item.encodeId &&
                                            !songState.isPlay && (
                                                <div
                                                    className={cx('img-play')}
                                                    onClick={() => {
                                                        if (
                                                            songState.song &&
                                                            songState.song.encodeId === item.encodeId
                                                        ) {
                                                            dispatch(play());
                                                        } else {
                                                            handleSelectSong(item);
                                                        }
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faPlay} className={cx('img-play-icon')} />
                                                </div>
                                            )}
                                    </div>
                                    <div className={cx('info-list')}>
                                        <p className={cx('name')}>{item.title}</p>
                                        <p className={cx('author')}>{item.artistsNames}</p>
                                    </div>
                                </div>
                            </div>
                            <div
                                className={cx('more')}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    dispatch(setSongValueModel(item));
                                    dispatch(setModelSong(true));
                                }}
                            >
                                <div className={cx('action')}>
                                    <div className={cx('action-wrapper')}>
                                        <FontAwesomeIcon className={cx('action-item')} icon={faEllipsis} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
        </div>
    );
}

export default SongItemMobile;
