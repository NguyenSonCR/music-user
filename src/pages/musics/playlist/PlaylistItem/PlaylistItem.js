import styles from './PlaylistItem.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import { useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import { useDispatch, useSelector } from 'react-redux';
import { loadSong, play, pause, setLink, setSongLyric, setAlbumPlaying } from '~/slices/songSlice';
import { TfiMusicAlt } from 'react-icons/tfi';
import musicApi from '~/api/music/musicApi';
import React from 'react';
import axios from 'axios';

const cx = classNames.bind(styles);

function PlaylistItem({ songList, playlist, title, scroll }) {
    const dispatch = useDispatch();
    const songState = useSelector((state) => state.song);

    const convertTimeToNumber = (string) => {
        const minutes = string.slice(1, 2);
        const seconds = string.slice(3, 9);
        const value = Math.round(Number(minutes) * 60 * 1000 + Math.round(Number(seconds) * 1000));
        return value;
    };

    const handleSelectSong = (item) => {
        if (playlist) {
            dispatch(setAlbumPlaying({ playlist: playlist, title }));
        } else {
            dispatch(setAlbumPlaying({ playlist: songList, title }));
        }

        dispatch(play());
        dispatch(loadSong(item));
        const linkPromise = musicApi.getSong(item.encodeId);
        const fileLyricPromise = musicApi.getLyricSong(item.encodeId);

        Promise.all([linkPromise, fileLyricPromise])
            .then((response) => {
                dispatch(
                    setLink({
                        link: response[0].data['128'],
                        songId: response[0].info.encodeId,
                    }),
                );
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
                        dispatch(setSongLyric({ lyric: array1, songId: response[0].info.encodeId }));
                    })
                    .catch((error) => console.log(error));
            })
            .catch((error) => {
                console.log(error);
            });
    };

    // scroll

    const refs = songList?.reduce((song, value) => {
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
        if (songState.song) {
            if (!scroll) handleClickScroll(songState.song.encodeId);
        }
        // eslint-disable-next-line
    }, [songState?.song?.encodeId]);

    return (
        <div className={cx('body')}>
            {songList &&
                songList.length > 0 &&
                songList.map((item, index) => (
                    <div
                        key={index}
                        className={cx(
                            'wrapper',
                            songState.song && songState.song.encodeId === item.encodeId && 'active',
                        )}
                        onClick={() => {
                            handleSelectSong(item);
                        }}
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
                                    {songState.song && songState.song.encodeId === item.encodeId && songState.isPlay ? (
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
                    </div>
                ))}
        </div>
    );
}

export default PlaylistItem;
