import styles from './NewSongConcept.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import PlaylistItem from '~/pages/musics/playlist/PlaylistItem';
import SongItemMobile from '~/layouts/components/SongItemMobile';
import { Link } from 'react-router-dom';
import useViewport from '~/hooks/useViewport';
import { HiOutlineChevronRight } from 'react-icons/hi';

const cx = classNames.bind(styles);
function NewSongConcept({ link }) {
    const viewPort = useViewport();
    const isMobile = viewPort.width < 740;

    const songState = useSelector((state) => state.song);
    const [songs, setSongs] = useState(songState?.homeMusic?.find((item) => item.title === 'Mới phát hành').items.all);
    const [active, setActive] = useState(1);

    const onChangeTab = (id) => {
        if (id === 1) {
            setSongs(songState?.homeMusic?.find((item) => item.title === 'Mới phát hành').items.all);
            setActive(1);
        } else if (id === 2) {
            setSongs(songState?.homeMusic?.find((item) => item.title === 'Mới phát hành').items.vPop);
            setActive(2);
        } else {
            setSongs(songState?.homeMusic?.find((item) => item.title === 'Mới phát hành').items.others);
            setActive(3);
        }
    };

    let body = null;

    if (isMobile) {
        body = (
            <div className={cx('mobile')}>
                <div className={cx('wrapper')}>
                    <div className={cx('header')}>
                        <Link to={link} className={cx('header-title')}>
                            <p className={cx('header-title-text')}>Mới phát hành</p>
                            <HiOutlineChevronRight className={cx('icon')} />
                        </Link>
                        <div className={cx('header-action')}>
                            <ul className={cx('tab')}>
                                <li className={cx('tab-item', active === 1 && 'active')} onClick={() => onChangeTab(1)}>
                                    Tất cả
                                </li>
                                <li className={cx('tab-item', active === 2 && 'active')} onClick={() => onChangeTab(2)}>
                                    Việt Nam
                                </li>
                                <li className={cx('tab-item', active === 3 && 'active')} onClick={() => onChangeTab(3)}>
                                    Quốc tế
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className={cx('container')}>
                        <div className={cx(['col', 'l-4', 'm-6', 'c-12'])}>
                            <SongItemMobile
                                noScroll={true}
                                songList={songs.slice(0, 4)}
                                playlist={songs}
                                title={'Mới phát hành'}
                            />
                            {/* <PlaylistItem
                                songList={songs.slice(0, 4)}
                                playlist={songs}
                                scroll={true}
                                title={'Mới phát hành'}
                            /> */}
                        </div>
                        <div className={cx(['col', 'l-4', 'm-6', 'c-12'])}>
                            <SongItemMobile noScroll={true} songList={songs.slice(4, 8)} playlist={songs} />
                            {/* <PlaylistItem songList={songs.slice(4, 8)} playlist={songs} scroll={true} /> */}
                        </div>
                        <div className={cx(['col', 'l-4', 'm-6', 'c-12'])}>
                            <SongItemMobile noScroll={true} songList={songs.slice(8, 12)} playlist={songs} />
                            {/* <PlaylistItem songList={songs.slice(8, 12)} playlist={songs} scroll={true} /> */}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!isMobile) {
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <p className={cx('header-title')}>Mới phát hành</p>
                <div className={cx('header-action')}>
                    <ul className={cx('tab')}>
                        <li className={cx('tab-item', active === 1 && 'active')} onClick={() => onChangeTab(1)}>
                            Tất cả
                        </li>
                        <li className={cx('tab-item', active === 2 && 'active')} onClick={() => onChangeTab(2)}>
                            Việt Nam
                        </li>
                        <li className={cx('tab-item', active === 3 && 'active')} onClick={() => onChangeTab(3)}>
                            Quốc tế
                        </li>
                    </ul>
                    <Link to={link} className={cx('header-all')}>
                        <p>Tất cả</p>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </Link>
                </div>
            </div>
            <div className={cx(['row', 'sm-gutter'], 'container')}>
                <div className={cx(['col', 'l-4', 'm-6', 'c-12'])}>
                    <PlaylistItem songList={songs.slice(0, 4)} playlist={songs} scroll={true} />
                </div>
                <div className={cx(['col', 'l-4', 'm-6', 'c-12'])}>
                    <PlaylistItem songList={songs.slice(4, 8)} playlist={songs} scroll={true} />
                </div>
                <div className={cx(['col', 'l-4', 'm-6', 'c-12'])}>
                    <PlaylistItem songList={songs.slice(8, 12)} playlist={songs} scroll={true} />
                </div>
            </div>
        </div>;
    }
    return body;
}

export default NewSongConcept;
