import styles from './Album.module.scss';
import classNames from 'classnames/bind';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import SongItem from '~/layouts/components/SongItem';
import SongItemMobile from '~/layouts/components/SongItemMobile';
import { setAlbum } from '~/slices/songSlice';
import musicApi from '~/api/music/musicApi';
import useViewport from '~/hooks/useViewport';
import axios from 'axios';
import { addToast } from '~/slices/toastSlice';

import { loadSong, play, setSongLyric, setLink, setVipSong, pause } from '~/slices/songSlice';

const cx = classNames.bind(styles);

function Album() {
    const viewPort = useViewport();
    const isMobile = viewPort.width < 740;

    const dispatch = useDispatch();
    const songState = useSelector((state) => state.song);
    const toastState = useSelector((state) => state.toast);

    const { id } = useParams();
    let condition;
    if (id === songState?.album?.encodeId) {
        condition = false;
    } else {
        condition = true;
    }
    const [loading, setLoading] = useState(condition);

    // scroll to top page
    useEffect(() => {
        window.scrollTo(0, 0);
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (loading) {
            musicApi.getAlbumZing(id).then((response) => {
                dispatch(setAlbum(response.data));
                setLoading(false);
            });
        }

        // eslint-disable-next-line
    }, [songState?.album?.encodeId]);

    // function

    const convertTimeToNumber = (string) => {
        const minutes = string.slice(1, 2);
        const seconds = string.slice(3, 9);
        const value = Math.round(Number(minutes) * 60 * 1000 + Math.round(Number(seconds) * 1000));
        return value;
    };

    const handleSelectSong = (item) => {
        console.log(1);
        // dispatch(setAlbumPlaying({ playlist: songState.album.song.items, title: songState.album.title }));
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

    let body = null;

    // console.log(songState.album.song.items[0]);

    if (loading) {
        body = (
            <div className={cx(['row'], 'wrapper-loading', isMobile && 'mobile')}>
                {!isMobile ? (
                    <div className={cx(['col', 'l-4', 'm-6', 'c-12'])}>
                        <div className={cx('center')}>
                            <div className={cx('loading-img')} style={{ animation: 'loading 2s infinite' }}></div>
                            <p className={cx('single-loading')} style={{ animation: 'loading 2s infinite' }}></p>
                            <p className={cx('single-loading')} style={{ animation: 'loading 2s infinite' }}></p>
                        </div>
                    </div>
                ) : (
                    <div className={cx('mobile-loading')}>
                        <div className={cx('loading-img')} style={{ animation: 'loading 2s infinite' }}></div>
                        <p className={cx('single-loading')} style={{ animation: 'loading 2s infinite' }}></p>
                        <p className={cx('single-loading')} style={{ animation: 'loading 2s infinite' }}></p>
                    </div>
                )}
                <div className={cx(['col', 'l-8', 'm-6', 'c-12'])}>
                    <p className={cx('single-loading-100')} style={{ animation: 'loading 2s infinite' }}></p>
                    <p className={cx('single-loading-100')} style={{ animation: 'loading 2s infinite' }}></p>
                    <div className={cx('loading-song')}>
                        <div className={cx('loading-song-img')}></div>
                        <div className={cx('loading-song-content')}>
                            <p className={cx('single-loading-song')} style={{ animation: 'loading 2s infinite' }}></p>
                            <p className={cx('single-loading-song')} style={{ animation: 'loading 2s infinite' }}></p>
                        </div>
                    </div>
                    <div className={cx('loading-song')}>
                        <div className={cx('loading-song-img')}></div>
                        <div className={cx('loading-song-content')}>
                            <p className={cx('single-loading-song')} style={{ animation: 'loading 2s infinite' }}></p>
                            <p className={cx('single-loading-song')} style={{ animation: 'loading 2s infinite' }}></p>
                        </div>
                    </div>
                    <div className={cx('loading-song')}>
                        <div className={cx('loading-song-img')}></div>
                        <div className={cx('loading-song-content')}>
                            <p className={cx('single-loading-song')} style={{ animation: 'loading 2s infinite' }}></p>
                            <p className={cx('single-loading-song')} style={{ animation: 'loading 2s infinite' }}></p>
                        </div>
                    </div>
                    <div className={cx('loading-song')}>
                        <div className={cx('loading-song-img')}></div>
                        <div className={cx('loading-song-content')}>
                            <p className={cx('single-loading-song')} style={{ animation: 'loading 2s infinite' }}></p>
                            <p className={cx('single-loading-song')} style={{ animation: 'loading 2s infinite' }}></p>
                        </div>
                    </div>
                    <div className={cx('loading-song')}>
                        <div className={cx('loading-song-img')}></div>
                        <div className={cx('loading-song-content')}>
                            <p className={cx('single-loading-song')} style={{ animation: 'loading 2s infinite' }}></p>
                            <p className={cx('single-loading-song')} style={{ animation: 'loading 2s infinite' }}></p>
                        </div>
                    </div>
                    <div className={cx('loading-song')}>
                        <div className={cx('loading-song-img')}></div>
                        <div className={cx('loading-song-content')}>
                            <p className={cx('single-loading-song')} style={{ animation: 'loading 2s infinite' }}></p>
                            <p className={cx('single-loading-song')} style={{ animation: 'loading 2s infinite' }}></p>
                        </div>
                    </div>
                    <div className={cx('loading-song')}>
                        <div className={cx('loading-song-img')}></div>
                        <div className={cx('loading-song-content')}>
                            <p className={cx('single-loading-song')} style={{ animation: 'loading 2s infinite' }}></p>
                            <p className={cx('single-loading-song')} style={{ animation: 'loading 2s infinite' }}></p>
                        </div>
                    </div>
                    <div className={cx('loading-song')}>
                        <div className={cx('loading-song-img')}></div>
                        <div className={cx('loading-song-content')}>
                            <p className={cx('single-loading-song')} style={{ animation: 'loading 2s infinite' }}></p>
                            <p className={cx('single-loading-song')} style={{ animation: 'loading 2s infinite' }}></p>
                        </div>
                    </div>
                    <div className={cx('loading-song')}>
                        <div className={cx('loading-song-img')}></div>
                        <div className={cx('loading-song-content')}>
                            <p className={cx('single-loading-song')} style={{ animation: 'loading 2s infinite' }}></p>
                            <p className={cx('single-loading-song')} style={{ animation: 'loading 2s infinite' }}></p>
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        if (isMobile) {
            body = (
                <div className={cx('mobile')}>
                    <div className={cx('wrapper')}>
                        <div className={cx('song-list')}>
                            <div className={cx('song-img')}>
                                <img
                                    alt=""
                                    src={songState.album.thumbnailM || songState.album.thumbnail}
                                    className={cx('img-content')}
                                ></img>
                                <div className={cx('overlay')}>
                                    <div className={cx('overplay-wrapper')}>
                                        {!songState.isPlay ? (
                                            <FontAwesomeIcon
                                                className={cx('overlay-icon')}
                                                icon={faPlay}
                                                onClick={() => {
                                                    if (songState.song) {
                                                        dispatch(play());
                                                    } else {
                                                        handleSelectSong(songState.album.song.items[0]);
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div
                                                className={cx('overplay-wrapper')}
                                                onClick={() => {
                                                    dispatch(pause());
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faPause} className={cx('overlay-icon')} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <p className={cx('song-name')}>{songState.album.title}</p>

                            <p className={cx('list-author')}>
                                {songState.album.artists.map((artist, index) => {
                                    if (index < songState.album.artists.length - 1) {
                                        return <span key={index}>{artist.name}, </span>;
                                    } else {
                                        return <span key={index}>{artist.name}</span>;
                                    }
                                })}
                            </p>
                        </div>
                        <div className={cx('content', ['col', 'l-9', 'm-6', 'c-12'])}>
                            <ul className={cx('content-header')}>
                                <li className={cx('content-header-item')}>
                                    <span>Lời tựa: </span>
                                    {songState.album.description}
                                </li>
                            </ul>
                            <ul className={cx('content-body')}>
                                <div className={cx('content-body__title')}>
                                    <p className={cx('content-body__item')}>Bài hát</p>
                                    {/* <div className={cx('album')}>
                                        <p className={cx('album__item')}>Album</p>
                                        <p className={cx('album__item')}>Thời gian</p>
                                    </div> */}
                                </div>
                                <div className={cx('content-body-song')}>
                                    <SongItemMobile
                                        songList={songState.album.song.items}
                                        title={songState.album.title}
                                    />
                                </div>
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }
        if (!isMobile) {
            body = (
                <div className={cx('body')}>
                    <div className={cx('song-list')}>
                        <div className={cx('song-img')}>
                            <img
                                alt=""
                                src={songState.album.thumbnailM || songState.album.thumbnail}
                                className={cx('img-content')}
                            ></img>
                            <div className={cx('overlay')}>
                                <div className={cx('overplay-wrapper')}>
                                    {!songState.isPlay ? (
                                        <FontAwesomeIcon
                                            className={cx('overlay-icon')}
                                            icon={faPlay}
                                            onClick={() => {
                                                if (
                                                    songState.song
                                                    // songState.song.encodeId === songState.album.song.items[0].encodeId
                                                ) {
                                                    dispatch(play());
                                                } else {
                                                    handleSelectSong(songState.album.song.items[0]);
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className={cx('overplay-wrapper')}
                                            onClick={() => {
                                                dispatch(pause());
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faPause} className={cx('overlay-icon')} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <p className={cx('song-name')}>{songState.album.title}</p>

                        <p className={cx('list-author')}>
                            {songState.album.artists.map((artist, index) => {
                                if (index < songState.album.artists.length - 1) {
                                    return <span key={index}>{artist.name}, </span>;
                                } else {
                                    return <span key={index}>{artist.name}</span>;
                                }
                            })}
                        </p>
                    </div>
                    <div className={cx('content')}>
                        <ul className={cx('content-header')}>
                            <li className={cx('content-header-item')}>
                                <span>Lời tựa: </span>
                                {songState.album.description}
                            </li>
                        </ul>
                        <ul className={cx('content-body')}>
                            <div className={cx('content-body__title')}>
                                <p className={cx('content-body__item')}>Bài hát</p>
                                <div className={cx('album')}>
                                    <p className={cx('album__item')}>Album</p>
                                    <p className={cx('album__item')}>Thời gian</p>
                                </div>
                            </div>
                            <div className={cx('content-body-song')}>
                                <SongItem songList={songState.album.song.items} title={songState.album.title} />
                            </div>
                        </ul>
                    </div>
                </div>
            );
        }
    }

    return body;
}

export default Album;
