import styles from './SongItem.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import { TbMicrophone2 } from 'react-icons/tb';
import { useEffect, useState } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useDispatch, useSelector } from 'react-redux';
import {
    loadSong,
    play,
    pause,
    setSongLyric,
    setLink,
    setAlbumPlaying,
    setVipSong,
    setLyricPage,
    setPopup,
    addSongPlaylist,
    deleteSongMyPlaylist,
} from '~/slices/songSlice';
import { addSongLibrary, removeSongLibrary } from '~/slices/authSlice';
import { TfiMusicAlt } from 'react-icons/tfi';
import { AiOutlineHeart, AiFillHeart, AiOutlineDelete } from 'react-icons/ai';
import musicApi from '~/api/music/musicApi';
import React from 'react';
import axios from 'axios';
import { addToast } from '~/slices/toastSlice';
import { Wrapper as PopperWrapper } from '~/components/Popper';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import { TfiComment } from 'react-icons/tfi';
import { RiShareForwardLine } from 'react-icons/ri';
import { BsDownload } from 'react-icons/bs';
import useViewport from '~/hooks/useViewport';

const cx = classNames.bind(styles);

function SongItem({ songList, title, myPlaylist, myMusic }) {
    const viewPort = useViewport();
    const dispatch = useDispatch();
    const songState = useSelector((state) => state.song);
    const authState = useSelector((state) => state.auth);
    const toastState = useSelector((state) => state.toast);

    // function
    const calculateTime = (secs) => {
        const minutes = Math.floor(secs / 60);
        const returnedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
        const seconds = Math.floor(secs % 60);
        const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
        return `${returnedMinutes}:${returnedSeconds}`;
    };

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
                            const array1 = array.forEach((line) => {
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

    const handlePlayWithLyric = async (item) => {
        try {
            await handleSelectSong(item);
            dispatch(setLyricPage(true));
        } catch (error) {
            console.log(error);
        }
    };
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
        if (songState.song) {
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
            }
        } catch (error) {
            console.log(error);
        }
    };
    // popper
    const renderItems = (item) => {
        return (
            <div className={cx('menu-body')}>
                <div className={cx('menu-item')}>
                    <AiOutlinePlusCircle className={cx('menu-item-icon')} />
                    <div className={cx('menu-item-text')}>Thêm vào Playlist</div>
                    <div className={cx('playlist-wraper')}>
                        <PopperWrapper className={cx('playlist-content')}>
                            <div className={cx('playlist-title')}>
                                <AiOutlinePlusCircle className={cx('playlist-title-icon')} />
                                <div className={cx('playlist-title-text')}>Tạo playlist mới</div>
                            </div>
                            {songState?.myPlaylist?.album.length > 0 &&
                                songState.myPlaylist.album.map((playlist, index) => (
                                    <div
                                        className={cx('playlist-item')}
                                        key={index}
                                        onClick={() => handleAddSongPlaylist({ song: item, playlistId: playlist._id })}
                                    >
                                        {playlist.name}
                                    </div>
                                ))}
                        </PopperWrapper>
                    </div>
                </div>
                <div className={cx('menu-item')}>
                    <TfiComment className={cx('menu-item-icon')} />
                    <div className={cx('menu-item-text')}>Bình luận</div>
                </div>
                <div className={cx('menu-item')}>
                    <BsDownload className={cx('menu-item-icon')} />
                    <div className={cx('menu-item-text')}>Tải xuống</div>
                </div>
                <div className={cx('menu-item')}>
                    <RiShareForwardLine className={cx('menu-item-icon')} />
                    <div className={cx('menu-item-text')}>Chia sẻ</div>
                </div>
                {myPlaylist && (
                    <div
                        className={cx('menu-item')}
                        onClick={() => handleDeleteSongPlaylist({ song: item, slug: songState.singleMyPlaylist.slug })}
                    >
                        <AiOutlineDelete className={cx('menu-item-icon')} />
                        <div className={cx('menu-item-text')}>Xóa bài hát khỏi playlist</div>
                    </div>
                )}
            </div>
        );
    };

    const [id, setId] = useState(null);

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
                            )}
                            ref={refs[item.encodeId]}
                        >
                            <div className={cx('song')}>
                                <TfiMusicAlt className={cx('icon')} />
                                <TfiMusicAlt className={cx('input')} />

                                <div className={cx('info')}>
                                    <div
                                        className={cx('info-img')}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                        }}
                                    >
                                        <img className={cx('img')} alt="" src={item.thumbnail}></img>
                                        {songState.song &&
                                        songState.song.encodeId === item.encodeId &&
                                        songState.isPlay ? (
                                            <div
                                                className={cx('img-play')}
                                                onClick={() => {
                                                    dispatch(pause());
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faPause} className={cx('img-play-icon')} />
                                            </div>
                                        ) : (
                                            <div
                                                className={cx('img-play')}
                                                onClick={() => {
                                                    if (songState.song && songState.song.encodeId === item.encodeId) {
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
                            <div className={cx('album', viewPort.width < 740 && 'mobile')}>
                                <p className={cx('title')}> {item.album && item.album.title}</p>
                                <div className={cx('action')}>
                                    <Tippy content="Phát cùng lời bài hát">
                                        <div className={cx('action-wrapper')} onClick={() => handlePlayWithLyric(item)}>
                                            <TbMicrophone2 className={cx('icon-lyric')} />
                                        </div>
                                    </Tippy>
                                    {authState?.library?.find((song) => song.encodeId === item.encodeId) ? (
                                        <Tippy content="Xóa bài hát khỏi thư viện">
                                            <div
                                                className={cx('action-wrapper')}
                                                onClick={() => handleRemoveLibrary(item)}
                                            >
                                                <AiFillHeart className={cx('icon-heart')} />
                                            </div>
                                        </Tippy>
                                    ) : (
                                        <Tippy content="Thêm vào thư viện">
                                            <div
                                                className={cx('action-wrapper')}
                                                onClick={() => handleAddLibrary(item)}
                                            >
                                                <AiOutlineHeart className={cx('icon-heart')} />
                                            </div>
                                        </Tippy>
                                    )}

                                    <Tippy content="Khác">
                                        <div className={cx('action-wrapper')}>
                                            <FontAwesomeIcon
                                                className={cx('action-item')}
                                                icon={faEllipsis}
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    const value = !songState.popup;
                                                    dispatch(setPopup(value));
                                                    setId(item.encodeId);
                                                }}
                                            />
                                        </div>
                                    </Tippy>
                                </div>
                                {songState && songState.popup && id === item.encodeId && (
                                    <div className={cx('menu-list')}>
                                        <PopperWrapper className={cx('menu-popper')}>{renderItems(item)}</PopperWrapper>
                                    </div>
                                )}
                                <p className={cx('duration')}>{calculateTime(item.duration)}</p>
                            </div>
                        </div>
                    );
                })}
        </div>
    );
}

export default SongItem;
