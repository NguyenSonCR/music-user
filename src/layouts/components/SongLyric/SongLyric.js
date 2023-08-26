import styles from './SongLyric.module.scss';
import classNames from 'classnames/bind';
import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import useViewport from '~/hooks/useViewport';

const cx = classNames.bind(styles);
function SongLyric({ currentTime, loading, activeTab, laptop }) {
    const [active, setActive] = useState(null);
    const songState = useSelector((state) => state.song);
    const [touch, setTouch] = useState(false);
    const width = useViewport().width;
    // // scroll
    const refs = useRef([]);
    const handleClickScroll = (active) => {
        refs?.current?.[active]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    };

    useEffect(() => {
        if (activeTab === 2 || laptop) {
            if (songState.songLyric.lyric && !touch && active !== null) {
                handleClickScroll(active);
            } else {
                handleClickScroll(0);
            }
        }

        // eslint-disable-next-line
    }, [active]);

    useEffect(() => {
        if (songState.songLyric.lyric) {
            let array = [];
            songState.songLyric.lyric.forEach((line) => {
                if (currentTime * 1000 >= line.startTime - 100) {
                    array = [...array, true];
                } else {
                    array = [...array, false];
                }
            });
            const index = array.lastIndexOf(true);
            setActive(index);
        }

        // eslint-disable-next-line
    }, [currentTime]);

    const [lyricArray, setLyricArray] = useState(null);

    useEffect(() => {
        if (songState.songLyric.lyric && songState?.songLyric?.songId === songState.song.encodeId) {
            setLyricArray(songState.songLyric.lyric);
        }
        // eslint-disable-next-line
    }, [songState?.songLyric?.lyric]);

    return (
        <div className={cx('wrapper')} onMouseDown={() => setTouch(true)} onMouseUp={() => setTouch(false)}>
            {loading ? (
                <div className={cx('loading')}>
                    <div className={cx('item')} style={{ animation: 'loading 2s infinite' }}></div>
                    <div className={cx('item')} style={{ animation: 'loading 2s infinite' }}></div>
                    <div className={cx('item')} style={{ animation: 'loading 2s infinite' }}></div>
                    <div className={cx('item')} style={{ animation: 'loading 2s infinite' }}></div>
                    <div className={cx('item')} style={{ animation: 'loading 2s infinite' }}></div>
                    <div className={cx('item')} style={{ animation: 'loading 2s infinite' }}></div>
                    <div className={cx('item')} style={{ animation: 'loading 2s infinite' }}></div>
                    <div className={cx('item')} style={{ animation: 'loading 2s infinite' }}></div>
                    <div className={cx('item')} style={{ animation: 'loading 2s infinite' }}></div>
                    <div className={cx('item')} style={{ animation: 'loading 2s infinite' }}></div>
                    <div className={cx('item')} style={{ animation: 'loading 2s infinite' }}></div>
                    <div className={cx('item')} style={{ animation: 'loading 2s infinite' }}></div>
                </div>
            ) : lyricArray ? (
                <div className={cx('lyric')}>
                    {lyricArray?.map((line, index) => (
                        <p
                            key={index}
                            ref={(element) => {
                                refs.current[index] = element;
                            }}
                            className={cx('line-text', active === index && 'active', width < 740 && 'mobile')}
                        >
                            {line.words}
                        </p>
                    ))}
                </div>
            ) : (
                <div className={cx('no-lyric')}>
                    <p>Mình đang cập nhật lời bài hát này nhé...</p>
                </div>
            )}
        </div>
    );
}

export default SongLyric;
