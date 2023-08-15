import { useSelector } from 'react-redux';
import { useState } from 'react';
import SongItemMobile from '~/layouts/components/SongItemMobile';
import classNames from 'classnames/bind';
import styles from './Search.module.scss';
import SongConcept from '~/layouts/components/SongConcept';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

function SearchMusic() {
    const songState = useSelector((state) => state.song);
    const [tab, setTab] = useState(1);

    const tab1 = (
        <div className={cx('tab1')}>
            <p className={cx('tab1-text')}>Bài hát</p>
            {songState.searchResult && <SongItemMobile songList={songState.searchResult.songs} />}
        </div>
    );

    const tab2 = (
        <div className={cx('tab2')}>
            {songState.searchResult && <SongConcept title="Album/Playlist" data={songState.searchResult.playlists} />}
        </div>
    );

    const tab3 = (
        <div className={cx('tab3')}>
            <div className={cx('title')}>Nghệ sĩ</div>
            <div className={cx(['row'], 'tab3-content')}>
                {songState?.searchResult?.artists.map((item, index) => (
                    <Link
                        key={index}
                        className={cx('tab2-item', ['col', 'l-2-4', 'm-4', 'c-6'])}
                        to={`/music/artist/${item.alias}`}
                    >
                        <div className={cx('album-img')}>
                            <img className={cx('item-img')} src={item.thumbnailM} alt=""></img>
                        </div>
                        <p className={cx('item-name')}>{item.name}</p>
                    </Link>
                ))}
            </div>
        </div>
    );

    const tab4 = (
        <div className={cx('tab4')}>
            <p className={cx('tab4-text')}>Mình đang xử lý video nhé...</p>
        </div>
    );

    return (
        <div className={cx('wrapper')}>
            <div className={cx('tab')}>
                <div className={cx('item')} onClick={() => setTab(1)}>
                    <p className={cx('text', tab === 1 && 'active')}>Bài hát</p>
                </div>
                <div className={cx('item')} onClick={() => setTab(2)}>
                    <p className={cx('text', tab === 2 && 'active')}>Album/Playlist</p>
                </div>
                <div className={cx('item')} onClick={() => setTab(3)}>
                    <p className={cx('text', tab === 3 && 'active')}>Nghệ sĩ</p>
                </div>
                <div className={cx('item')} onClick={() => setTab(4)}>
                    <p className={cx('text', tab === 4 && 'active')}>MV</p>
                </div>
            </div>
            <div className={cx('content')}>{tab === 1 ? tab1 : tab === 2 ? tab2 : tab === 3 ? tab3 : tab4}</div>
        </div>
    );
}

export default SearchMusic;
