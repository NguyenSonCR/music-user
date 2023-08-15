import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import config from '~/config';
import styles from './NaviMobi.module.scss';
import { ReactComponent as IconKinds } from '~/assets/icon/kinds.svg';
import { CiStar, CiMusicNote1, CiUser } from 'react-icons/ci';

const cx = classNames.bind(styles);
function NaviMobi() {
    const { pathname } = useLocation();
    const [active, setActive] = useState(config.routes.music);
    const handleClick = (data) => {
        setActive(data);
    };

    useEffect(() => {
        if (pathname === '/') {
            handleClick(config.routes.music);
        }
        if (pathname === '/music/mymusic') {
            handleClick(config.routes.myMusic);
        }
    }, [pathname]);

    return (
        <div className={cx('wrapper')}>
            <Link
                to={config.routes.genresMusic}
                className={cx('list', active === config.routes.genresMusic && 'active')}
                onClick={() => {
                    handleClick(config.routes.genresMusic);
                }}
            >
                <IconKinds className={cx('navigate-img', 'genres')} />
                <p className={cx('navigate-text')}>Thể loại</p>
            </Link>

            <Link
                to={config.routes.music}
                className={cx('list', active === config.routes.music && 'active')}
                onClick={() => {
                    handleClick(config.routes.music);
                }}
            >
                <CiMusicNote1 className={cx('navigate-img')} />
                <p className={cx('navigate-text')}>Khám phá</p>
            </Link>
            <Link
                to={config.routes.top100}
                className={cx('list', active === config.routes.top100 && 'active')}
                onClick={() => {
                    handleClick(config.routes.top100);
                }}
            >
                <CiStar className={cx('navigate-img')} />
                {/* <img src={images.star} alt="" className={cx('navigate-img')}></img> */}
                <p className={cx('navigate-text')}>Top 100</p>
            </Link>
            <Link
                to={config.routes.myMusic}
                className={cx('list', active === config.routes.myMusic && 'active')}
                onClick={() => {
                    handleClick(config.routes.myMusic);
                }}
            >
                <CiUser className={cx('navigate-img', 'text')} />
                {/* <img src={images.musicUser} alt="" className={cx('navigate-img')}></img> */}
                <p className={cx('navigate-text')}>Cá nhân</p>
            </Link>
        </div>
    );
}

export default NaviMobi;
