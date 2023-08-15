import PlaylistItem from '~/pages/musics/playlist/PlaylistItem/PlaylistItem';
import SongItemMobile from '~/layouts/components/SongItemMobile';
import styles from './NewSongRelease.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import useViewport from '~/hooks/useViewport';
import { HiOutlineChevronRight } from 'react-icons/hi';

const cx = classNames.bind(styles);
function NewSongRelease({ concept, link, all }) {
    const viewPort = useViewport();
    const isMobile = viewPort.width < 740;

    let body = null;
    if (isMobile) {
        body = (
            <div className={cx('mobile')}>
                <div className={cx('content')}>
                    <Link to={link} className={cx('header-title')}>
                        <p className={cx('header-title-text')}>Mới phát hành</p>
                        <HiOutlineChevronRight className={cx('icon')} />
                    </Link>
                    <div>
                        <div className={cx(['row', 'sm-gutter'], 'container')}>
                            <div className={cx(['col', 'l-12', 'c-12'])}>
                                <SongItemMobile noScroll={true} songList={concept.items} title={'Mới phát hành'} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!isMobile) {
        body = (
            <div className={cx('content')}>
                <div className={cx('content-header')}>
                    <p className={cx('content-header-text')}>{concept.title}</p>
                    {all === true && (
                        <Link to={link} className={cx('content-header-all')}>
                            <p>Tất cả</p>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </Link>
                    )}
                </div>
                <div>
                    <div className={cx(['row', 'sm-gutter'], 'container')}>
                        <div className={cx(['col', 'l-12', 'c-12'])}>
                            <PlaylistItem songList={concept.items} playlist={concept.items} scroll={true} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return body;
}

export default NewSongRelease;
