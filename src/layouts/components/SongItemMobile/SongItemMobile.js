import styles from './SongItemMobile.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    loadSong,
    play,
    pause,
    setSongLyric,
    setLink,
    setAlbumPlaying,
    setVipSong,
    addSongPlaylist,
    deleteSongMyPlaylist,
} from '~/slices/songSlice';
import { addSongLibrary, removeSongLibrary } from '~/slices/authSlice';
import { AiOutlineCloudDownload, AiOutlineDelete, AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { TbPlaylistAdd } from 'react-icons/tb';
import { RxTrackNext } from 'react-icons/rx';
import musicApi from '~/api/music/musicApi';
import React from 'react';
import axios from 'axios';
import { addToast } from '~/slices/toastSlice';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import useViewport from '~/hooks/useViewport';
import images from '~/assets/img';
import { setMyPlaylist } from '~/slices/songSlice';

const cx = classNames.bind(styles);

function SongItemMobile({ songList, title, myPlaylist, myMusic, removeModel, primary, noScroll }) {
    const viewPort = useViewport();
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

    // const handlePlayWithLyric = async (item) => {
    //     try {
    //         await handleSelectSong(item);
    //         dispatch(setLyricPage(true));
    //     } catch (error) {
    //         console.log(error);
    //     }
    // };
    // scroll

    const refs = songList.reduce((song, value) => {
        song[value.encodeId] = React.createRef();
        return song;
    }, {});

    const handleClickScroll = (id) => {
        refs[id]?.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    };

    useEffect(() => {
        if (songState.song && noScroll) {
            return;
        } else if (songState.song) {
            handleClickScroll(songState.song.encodeId);
        }
        // eslint-disable-next-line
    }, [songState?.song?.encodeId]);

    const handleAddLibrary = async (item) => {
        dispatch(addSongLibrary(item));
        try {
            const response = await musicApi.addSongLibrary(item);
            dispatch(
                addToast({
                    id: toastState.toastList.length + 1,
                    content: response.message,
                    type: 'success',
                }),
            );
        } catch (error) {
            console.log(error);
        }
    };

    const handleRemoveLibrary = async (item) => {
        dispatch(removeSongLibrary(item.encodeId));
        try {
            const response = await musicApi.removeSongLibrary({ id: item.encodeId });
            dispatch(
                addToast({
                    id: toastState.toastList.length + 1,
                    content: response.message,
                    type: 'success',
                }),
            );
        } catch (error) {
            console.log(error);
        }
    };

    const handleAddSongPlaylist = async ({ song, playlistId }) => {
        try {
            const response = await musicApi.addSongPlaylist({ song, playlistId });
            if (response.success) {
                dispatch(addSongPlaylist({ song, playlistId }));
                dispatch(
                    addToast({
                        id: toastState.toastList.length + 1,
                        content: response.message,
                        type: 'success',
                    }),
                );
            } else {
                dispatch(
                    addToast({
                        id: toastState.toastList.length + 1,
                        content: response.message,
                        type: 'error',
                    }),
                );
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleDeleteSongPlaylist = async (data) => {
        try {
            const response = await musicApi.deleteSongMyPlaylist(data);
            if (response.success) {
                dispatch(deleteSongMyPlaylist(data));
                dispatch(
                    addToast({
                        id: toastState.toastList.length + 1,
                        content: response.message,
                        type: 'success',
                    }),
                );
            }
        } catch (error) {
            console.log(error);
        }
    };
    // model
    const [model, setModel] = useState(false);
    const [modelAddPlaylist, setModelAddPlaylist] = useState(false);
    const [song, setSong] = useState(null);
    const [animate, setAnimate] = useState(false);

    return (
        <div className={cx('content', viewPort.width < 740 && 'mobile')}>
            {songList &&
                songList.map((item, index) => {
                    if (myMusic && authState?.library.find((song) => song.encodeId === item.encodeId))
                        return <div key={index}></div>;
                    return (
                        <div
                            key={index}
                            className={cx(
                                'wrapper',
                                songState.song && songState.song.encodeId === item.encodeId && 'active',
                                primary && 'primary',
                            )}
                            onClick={() => {
                                if (songState.song && songState.song.encodeId === item.encodeId) {
                                    return;
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
                            <div className={cx('more')}>
                                <div className={cx('action')}>
                                    <div className={cx('action-wrapper')}>
                                        <FontAwesomeIcon
                                            className={cx('action-item')}
                                            icon={faEllipsis}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setModel(true);
                                                setSong(item);
                                            }}
                                        />
                                    </div>
                                </div>

                                {model && song.encodeId === item.encodeId && (
                                    <div
                                        className={cx('model')}
                                        onClick={(e) => {
                                            setAnimate(true);
                                            e.stopPropagation();
                                            setTimeout(() => {
                                                setAnimate(false);
                                                setModel(false);
                                            }, [300]);
                                        }}
                                    >
                                        <div
                                            className={cx('body')}
                                            style={{ animation: animate && `fadeDown 0.3s ease-in forwards` }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                        >
                                            <div className={cx('header')}>
                                                <div className={cx('info-img')}>
                                                    <img className={cx('img')} alt="" src={song.thumbnail}></img>
                                                </div>
                                                <div className={cx('info-list')}>
                                                    <p className={cx('name')}>{song.title}</p>
                                                    <p className={cx('author')}>{song.artistsNames}</p>
                                                </div>
                                            </div>
                                            <ul className={cx('model-content')}>
                                                {myPlaylist && (
                                                    <li
                                                        className={cx('content-item')}
                                                        onClick={() => {
                                                            handleDeleteSongPlaylist({
                                                                song: song,
                                                                slug: songState.singleMyPlaylist.slug,
                                                            });
                                                            setTimeout(() => {
                                                                setAnimate(false);
                                                                setModel(false);
                                                            }, [300]);
                                                        }}
                                                    >
                                                        <AiOutlineDelete className={cx('item-icon')} />
                                                        <p className={cx('item-text')}>Xóa bài hát khỏi playlist</p>
                                                    </li>
                                                )}
                                                <li className={cx('content-item')}>
                                                    <AiOutlineCloudDownload
                                                        className={cx('item-icon')}
                                                    ></AiOutlineCloudDownload>
                                                    <p className={cx('item-text')}>Tải về</p>
                                                </li>
                                                {authState?.library?.find((item) => item.encodeId === song.encodeId) ? (
                                                    <li
                                                        className={cx('content-item')}
                                                        onClick={() => {
                                                            handleRemoveLibrary(song);
                                                            if (removeModel) {
                                                                setModel(false);
                                                                setSong(null);
                                                            }
                                                        }}
                                                    >
                                                        <AiFillHeart className={cx('item-icon')}></AiFillHeart>
                                                        <p className={cx('item-text')}>Xóa khỏi thư viện</p>
                                                    </li>
                                                ) : (
                                                    <li
                                                        className={cx('content-item')}
                                                        onClick={() => handleAddLibrary(song)}
                                                    >
                                                        <AiOutlineHeart className={cx('item-icon')}></AiOutlineHeart>
                                                        <p className={cx('item-text')}>Thêm vào thư viện</p>
                                                    </li>
                                                )}
                                                <li
                                                    className={cx('content-item')}
                                                    onClick={() => {
                                                        setModel(false);
                                                        setModelAddPlaylist(true);
                                                    }}
                                                >
                                                    <AiOutlinePlusCircle
                                                        className={cx('item-icon')}
                                                    ></AiOutlinePlusCircle>
                                                    <p className={cx('item-text')}>Thêm vào playlist</p>
                                                </li>
                                                <li className={cx('content-item')}>
                                                    <TbPlaylistAdd className={cx('item-icon')}></TbPlaylistAdd>
                                                    <p className={cx('item-text')}>Thêm vào danh sách phát</p>
                                                </li>
                                                <li className={cx('content-item')}>
                                                    <RxTrackNext className={cx('item-icon')}></RxTrackNext>
                                                    <p className={cx('item-text')}>Phát kế tiếp</p>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {modelAddPlaylist && song.encodeId === item.encodeId && (
                                    <div
                                        className={cx('model')}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setModelAddPlaylist(false);
                                        }}
                                    >
                                        <div
                                            className={cx('body')}
                                            style={{ animation: animate && `fadeDown 0.3s ease-in forwards` }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                        >
                                            <div className={cx('playlist-header')}>
                                                <p className={cx('header-title')}>Thêm bài hát vào playlist</p>
                                            </div>
                                            <ul className={cx('model-content')}>
                                                <li className={cx('content-item')}>
                                                    <AiOutlinePlusCircle className={cx('playlist-title-icon')} />
                                                    <p className={cx('item-text')}> Tạo playlist mới</p>
                                                </li>
                                                {songState?.myPlaylist?.album.length > 0 &&
                                                    songState.myPlaylist.album.map((playlist, index) => (
                                                        <li
                                                            key={index}
                                                            className={cx('content-item-playlist')}
                                                            onClick={() =>
                                                                handleAddSongPlaylist({
                                                                    song: song,
                                                                    playlistId: playlist._id,
                                                                })
                                                            }
                                                        >
                                                            <img
                                                                alt=""
                                                                src={images.song}
                                                                className={cx('item-playlist-img')}
                                                            ></img>
                                                            <div className={cx('playlist-info')}>
                                                                <p className={cx('item-text-playlist')}>
                                                                    {playlist.name}
                                                                </p>
                                                                <p className={cx('item-text-playlist')}>
                                                                    {playlist.username}
                                                                </p>
                                                            </div>
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
        </div>
    );
}

export default SongItemMobile;
