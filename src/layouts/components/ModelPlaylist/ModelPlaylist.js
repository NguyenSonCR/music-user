import styles from './ModelPlaylist.module.scss';
import classNames from 'classnames/bind';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addSongPlaylist, setModelPlaylist } from '~/slices/songSlice';
import musicApi from '~/api/music/musicApi';
import React from 'react';
import { addToast } from '~/slices/toastSlice';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import images from '~/assets/img';
import NewPlaylistModel from '../NewPlaylistModel/NewPlaylistModel';

const cx = classNames.bind(styles);
function ModelPlaylist() {
    const dispatch = useDispatch();
    const songState = useSelector((state) => state.song);

    const song = songState.songValueModel;
    const toastState = useSelector((state) => state.toast);

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
                setTimeout(() => {
                    dispatch(setModelPlaylist(false));
                    setAnimate(false);
                }, [300]);
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

    // model
    const [animate, setAnimate] = useState(false);
    const [modelAddNewPlaylist, setModelAddNewPlaylist] = useState(false);

    return (
        <div
            className={cx('model')}
            onClick={(e) => {
                setAnimate(true);
                e.stopPropagation();
                setTimeout(() => {
                    dispatch(setModelPlaylist(false));
                    setAnimate(false);
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
                <div className={cx('playlist-header')}>
                    <p className={cx('header-title')}>Thêm bài hát vào playlist</p>
                </div>
                <ul className={cx('model-content')}>
                    <li
                        className={cx('content-item')}
                        onClick={() => {
                            setModelAddNewPlaylist(true);
                        }}
                    >
                        <AiOutlinePlusCircle className={cx('playlist-title-icon')} />
                        <p className={cx('item-text')}> Tạo playlist mới</p>
                    </li>

                    {songState?.myPlaylist?.album.length > 0 &&
                        songState.myPlaylist.album.map((playlist, index) => (
                            <li
                                key={index}
                                className={cx('content-item-playlist')}
                                onClick={() => {
                                    handleAddSongPlaylist({
                                        song: song,
                                        playlistId: playlist._id,
                                    });
                                    setAnimate(true);
                                }}
                            >
                                <img alt="" src={images.song} className={cx('item-playlist-img')}></img>
                                <div className={cx('playlist-info')}>
                                    <p className={cx('item-text-playlist')}>{playlist.name}</p>
                                    <p className={cx('item-text-playlist')}>{playlist.username}</p>
                                </div>
                            </li>
                        ))}
                </ul>
            </div>
            {modelAddNewPlaylist && <NewPlaylistModel setModel={setModelAddNewPlaylist} myMusic={false} />}
        </div>
    );
}

export default ModelPlaylist;
