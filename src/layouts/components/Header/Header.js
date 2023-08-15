import classNames from 'classnames/bind';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.scss';
import images from '~/assets/img';
import config from '~/config';
import Search from '../Search';
import Menu from '~/components/Popper/Menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOut } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import authApi from '~/api/auth/auth';
import { setAuth } from '~/slices/authSlice';
import { LOCAL_STORAGE_TOKEN_NAME } from '~/api/constants';
import useViewport from '~/hooks/useViewport';
import { BsChevronLeft } from 'react-icons/bs';
import { useLocation } from 'react-router-dom';

const cx = classNames.bind(styles);
function Header() {
    const viewPort = useViewport();
    const isMobile = viewPort.width < 740;
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const userMenu = [
        {
            icon: <FontAwesomeIcon icon={faUser} />,
            title: 'Tài khoản',
            to: config.routes.profile,
        },

        {
            icon: <FontAwesomeIcon icon={faSignOut} />,
            title: 'Đăng xuất',
            separate: true,
            code: 'logout',
        },
    ];

    const dispatch = useDispatch();
    useEffect(() => {
        authApi
            .loadUser()
            .then((data) => {
                if (data.success) {
                    dispatch(setAuth({ user: data.user, isAuthenticated: true }));
                }
            })
            .catch((error) => {
                console.log(error);
                localStorage.removeItem(LOCAL_STORAGE_TOKEN_NAME);
                dispatch(setAuth({ user: null, isAuthenticated: false }));
            });
        // eslint-disable-next-line
    }, []);

    const userState = useSelector((state) => state.auth);

    let body = null;
    if (isMobile) {
        body = (
            <div className={cx('wrapper', 'mobile')}>
                <div className={cx('header')}>
                    <div className={cx('logo')}>
                        <Link className={cx('logo-link')} to={config.routes.home}>
                            <img src={images.logo} alt="logo" className={cx('logo-img')}></img>
                        </Link>
                    </div>
                    <div className={cx('search')}>
                        <Search />
                    </div>
                    <div className={cx('action')}>
                        <div className={cx('notify')}></div>
                        {userState.isAuthenticated ? (
                            <Menu items={userMenu}>
                                <div className={cx('user')}>
                                    {userState.user.img ? (
                                        <img src={userState.user.img} alt="user" className={cx('user-img')}></img>
                                    ) : (
                                        <div className={cx('user-img-clone')}>
                                            <span className={cx('user-text')}>
                                                {userState.user.username.slice(0, 1).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <span className={cx('user-name')}>{userState.user.username}</span>
                                </div>
                            </Menu>
                        ) : (
                            <div className={cx('authentication')}>
                                <Link className={cx('mobile-login')} to={config.routes.login}>
                                    Đăng nhập
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (!isMobile) {
        body = (
            <div className={cx('wrapper')}>
                <div className={cx('header')}>
                    <div className={cx('logo')}>
                        <Link className={cx('logo-link')} to={config.routes.home}>
                            <img src={images.logo} alt="logo" className={cx('logo-img')}></img>
                        </Link>
                        {pathname === '/' ? (
                            <Link to={config.routes.home} className={cx('logo-text')}>
                                Nơi vươn tầm ước mơ
                            </Link>
                        ) : (
                            <div className={cx('navigate')} onClick={() => navigate(-1)}>
                                <BsChevronLeft className={cx('back-icon')} />
                                <p className={cx('navigate-text')}>Quay lại</p>
                            </div>
                        )}
                    </div>
                    <div className={cx('search')}>
                        <Search />
                    </div>
                    <div className={cx('action')}>
                        <div className={cx('notify')}></div>
                        {userState.isAuthenticated ? (
                            <Menu items={userMenu} offset={[0, 0]}>
                                <div className={cx('user')}>
                                    {userState.user.img ? (
                                        <img src={userState.user.img} alt="user" className={cx('user-img')}></img>
                                    ) : (
                                        <div className={cx('user-img-clone')}>
                                            <span className={cx('user-text')}>
                                                {userState.user.username.slice(0, 1).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <span className={cx('user-name')}>{userState.user.username}</span>
                                </div>
                            </Menu>
                        ) : (
                            <div className={cx('authentication-web')}>
                                <Link to={config.routes.register} className={cx('register')}>
                                    Đăng ký
                                </Link>
                                <Link to={config.routes.login}>Đăng nhập</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return body;
}

export default Header;
