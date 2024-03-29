import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import config from '~/config';
import styles from './NaviMobi.module.scss';
import { ReactComponent as IconKinds } from '~/assets/icon/kinds.svg';
import { ReactComponent as IconMusic } from '~/assets/icon/music.svg';
import { CiStar, CiUser } from 'react-icons/ci';
import { useSelector } from 'react-redux';

const cx = classNames.bind(styles);
function NaviMobi() {
    const { pathname } = useLocation();
    const [active, setActive] = useState(config.routes.music);
    const handleClick = (data) => {
        setActive(data);
    };

    const navigateState = useSelector((state) => state.navigation);

    useEffect(() => {
        if (pathname === '/') {
            setActive(config.routes.music);
        }
        if (pathname.search('/music/mymusic') >= 0) {
            setActive(config.routes.myMusic);
        } else if (pathname.search('/music/top100') >= 0) {
            setActive(config.routes.top100);
        } else if (pathname.search('/music/genres') >= 0) {
            setActive(config.routes.genresMusic);
        } else if (pathname.search('/music') >= 0) {
            setActive(config.routes.music);
        }
    }, [pathname]);

    return (
        <div className={cx('wrapper', navigateState.display && 'show')}>
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
                <IconMusic className={cx('navigate-img')} />
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
