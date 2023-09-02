import classNames from 'classnames/bind';
import styles from './Playlist.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import PlaylistItem from './PlaylistItem/PlaylistItem';
import { setPlaylist } from '~/slices/songSlice';

const cx = classNames.bind(styles);
function Playlist() {
    const songState = useSelector((state) => state.song);
    const [shouldRender, setRender] = useState(false);

    useEffect(() => {
        if (songState.playlist) {
            setRender(true);
        }
    }, [songState.playlist]);

    const handleonAnimationEnd = () => {
        if (!songState.playlist) setRender(false);
    };
    const dispatch = useDispatch();

    return (
        <div>
            {shouldRender && (
                <div
                    className={cx('model')}
                    onClick={() => {
                        dispatch(setPlaylist(false));
                        document.body.style.overflow = '';
                    }}
                >
                    <div
                        className={cx('wrapper')}
                        style={{ animation: `${songState.playlist ? 'fadeIn' : 'fadeOut'} 0.2s ease-in forwards` }}
                        onAnimationEnd={handleonAnimationEnd}
                    >
                        <div className={cx('header')}>
                            <span className={cx('title')}>Danh sách đang phát</span>
                        </div>
                        <div className={cx('content')}>
                            <div className={cx('content-header')}>
                                <p className={cx('content-header-text')}>
                                    Từ Playlist
                                    <span className={cx('text-album')}>
                                        {songState.albumPlaying && songState.albumPlaying.title}
                                    </span>
                                </p>
                            </div>

                            {songState.albumPlaying && (
                                <PlaylistItem
                                    songList={songState.albumPlaying.playlist}
                                    title={songState.albumPlaying.title}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Playlist;
