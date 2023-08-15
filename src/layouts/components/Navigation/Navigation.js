import classNames from 'classnames/bind';
import styles from './Navigation.module.scss';
import config from '~/config';
import NavItem from './NavItem';
import { ReactComponent as IconKinds } from '~/assets/icon/kinds.svg';
import images from '~/assets/img';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const cx = classNames.bind(styles);

function Navigation() {
    const NAV_MENU = [
        {
            icon: <img src={images.musicUser} alt=""></img>,
            title: 'Cá nhân',
            code: 'mymusic',
            to: config.routes.myMusic,
        },
        {
            icon: <img src={images.cd} alt=""></img>,
            title: 'Khám phá',
            code: 'home',
            to: config.routes.music,
        },
        {
            icon: <img src={images.star} alt=""></img>,
            title: 'Top 100',
            code: 'top',
            to: config.routes.top100,
        },
        {
            icon: <IconKinds />,
            title: 'Thể loại',
            code: 'genres',
            to: config.routes.genresMusic,
        },
    ];

    const [active, setActive] = useState('home');
    const { pathname } = useLocation();
    useEffect(() => {
        if (pathname.includes('mymusic')) {
            setActive('mymusic');
        } else if (pathname.includes('top100')) {
            setActive('top');
        } else if (pathname.includes('genres')) {
            setActive('genres');
        } else {
            setActive('home');
        }
    }, [pathname]);

    const renderItems = () => {
        return NAV_MENU.map((item, index) => {
            return (
                <NavItem
                    key={index}
                    data={item}
                    active={active}
                    onClick={() => {
                        setActive(item.code);
                    }}
                />
            );
        });
    };
    return <nav className={cx('wrapper')}>{renderItems()}</nav>;
}

export default Navigation;
