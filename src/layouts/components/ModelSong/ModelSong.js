import styles from './ModelSong.module.scss';
import classNames from 'classnames/bind';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    deleteSongMyPlaylist,
    setSongValueModel,
    setModelSong,
    setModelPlaylist,
    addNextSongToAlbumPlaying,
    removeNextSongFromAlbumPlaying,
} from '~/slices/songSlice';
import { addSongLibrary, removeSongLibrary } from '~/slices/authSlice';
import { AiOutlineCloudDownload, AiOutlineDelete, AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { TbPlaylistAdd } from 'react-icons/tb';
import { RxTrackNext } from 'react-icons/rx';
import musicApi from '~/api/music/musicApi';
import React from 'react';
import { addToast } from '~/slices/toastSlice';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import { BsTrash } from 'react-icons/bs';
import { useLocation, useNavigate } from 'react-router-dom';
import config from '~/config';

const cx = classNames.bind(styles);
function ModelSong() {
    const dispatch = useDispatch();
    const songState = useSelector((state) => state.song);
    const location = useLocation();

    const song = songState.songValueModel;
    const authState = useSelector((state) => state.auth);
    const toastState = useSelector((state) => state.toast);
    const navigate = useNavigate();

    const handleAddLibrary = async (item) => {
        if (!authState.isAuthenticated) {
            navigate(config.routes.login);
            dispatch(setModelSong(false));
            dispatch(setSongValueModel(null));
            return;
        } else {
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

    const handelAddNextSongToPlaylist = () => {
        if (songState.song) {
            let indexSongPlaying;
            songState.albumPlaying.playlist.forEach((item, index) => {
                if (item.encodeId === songState.song.encodeId) {
                    return (indexSongPlaying = index);
                }
            });

            dispatch(
                addNextSongToAlbumPlaying({
                    idSong: indexSongPlaying + 1,
                    song: { ...song, nextSongId: songState.albumPlaying.nextSongId },
                }),
            );
        } else {
            return;
        }
    };

    const handelRemoveNextSongFromPlaylist = () => {
        const idSong = songState.albumPlaying.playlist.findIndex((item) => item.encodeId === song.encodeId);
        dispatch(removeNextSongFromAlbumPlaying({ idSong, song }));
        setTimeout(() => {
            setAnimate(false);
            dispatch(setModelSong(false));
            dispatch(setSongValueModel(null));
        }, [300]);
    };

    // model
    const [animate, setAnimate] = useState(false);

    return (
        <div
            className={cx('model')}
            onClick={(e) => {
                setAnimate(true);
                e.stopPropagation();
                setTimeout(() => {
                    setAnimate(false);
                    dispatch(setModelSong(false));
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
                        <img className={cx('img')} alt="" src={song?.thumbnail}></img>
                    </div>
                    <div className={cx('info-list')}>
                        <p className={cx('name')}>{song?.title}</p>
                        <p className={cx('author')}>{song?.artistsNames}</p>
                    </div>
                </div>
                <ul className={cx('model-content')}>
                    {location?.pathname?.search('music/mymusic/playlist/') > 0 && (
                        <li
                            className={cx('content-item')}
                            onClick={() => {
                                handleDeleteSongPlaylist({
                                    song: song,
                                    slug: songState.singleMyPlaylist.slug,
                                });
                                setTimeout(() => {
                                    setAnimate(false);
                                    dispatch(setModelSong(false));
                                    dispatch(setSongValueModel(null));
                                }, [300]);
                            }}
                        >
                            <AiOutlineDelete className={cx('item-icon')} />
                            <p className={cx('item-text')}>Xóa bài hát khỏi playlist</p>
                        </li>
                    )}
                    {/* <li className={cx('content-item')}>
                        <AiOutlineCloudDownload className={cx('item-icon')}></AiOutlineCloudDownload>
                        <p className={cx('item-text')}>Tải về</p>
                    </li> */}
                    {authState?.library?.find((item) => item.encodeId === song.encodeId) ? (
                        <li
                            className={cx('content-item')}
                            onClick={() => {
                                handleRemoveLibrary(song);
                                dispatch(setModelSong(false));
                                dispatch(setSongValueModel(null));
                            }}
                        >
                            <AiFillHeart className={cx('item-icon', 'heart')}></AiFillHeart>
                            <p className={cx('item-text')}>Xóa khỏi thư viện</p>
                        </li>
                    ) : (
                        <li className={cx('content-item')} onClick={() => handleAddLibrary(song)}>
                            <AiOutlineHeart className={cx('item-icon')}></AiOutlineHeart>
                            <p className={cx('item-text')}>Thêm vào thư viện</p>
                        </li>
                    )}
                    <li
                        className={cx('content-item')}
                        onClick={() => {
                            if (authState.isAuthenticated) {
                                dispatch(setModelSong(false));
                                dispatch(setModelPlaylist(true));
                            } else {
                                setTimeout(() => {
                                    setAnimate(false);
                                    dispatch(setModelSong(false));
                                    dispatch(setSongValueModel(null));
                                }, [300]);
                                navigate(config.routes.login);
                            }
                        }}
                    >
                        <AiOutlinePlusCircle className={cx('item-icon')}></AiOutlinePlusCircle>
                        <p className={cx('item-text')}>Thêm vào playlist</p>
                    </li>
                    <li className={cx('content-item')}>
                        <TbPlaylistAdd className={cx('item-icon')}></TbPlaylistAdd>
                        <p className={cx('item-text')}>Thêm vào danh sách phát</p>
                    </li>
                    <li className={cx('content-item')} onClick={handelAddNextSongToPlaylist}>
                        <RxTrackNext className={cx('item-icon')}></RxTrackNext>
                        <p className={cx('item-text')}>Phát kế tiếp</p>
                    </li>

                    {songState.albumPlaying.storeNextSong.length > 0 &&
                        songState.albumPlaying.storeNextSong.forEach((item, index) => {
                            if (item.encodeId === song.encodeId && song.nextSongId === item.nextSongId) {
                                return (
                                    <li
                                        key={index}
                                        className={cx('content-item')}
                                        onClick={handelRemoveNextSongFromPlaylist}
                                    >
                                        <BsTrash className={cx('item-icon')}></BsTrash>
                                        <p className={cx('item-text')}>Xóa khỏi danh sách phát kế tiếp</p>
                                    </li>
                                );
                            }
                        })}
                </ul>
            </div>
        </div>
    );
}

export default ModelSong;
