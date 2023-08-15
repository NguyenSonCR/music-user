import classNames from 'classnames/bind';
import styles from './Login.module.scss';
import config from '~/config';
import { useState } from 'react';
import { RxEyeClosed, RxEyeOpen } from 'react-icons/rx';
import images from '~/assets/img';
import { Link } from 'react-router-dom';
import Button from '~/components/Button';
import authApi from '~/api/auth/auth';
import { LOCAL_STORAGE_TOKEN_NAME } from '~/api/constants';
import setAuthToken from '~/api/setAuthToken';
import { setAuth } from '~/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import routes from '~/config/routes';
import { addToast } from '~/slices/toastSlice';
import useViewport from '~/hooks/useViewport';

const cx = classNames.bind(styles);
function Login() {
    const viewPort = useViewport();

    const [formValue, setFormValue] = useState({
        username: '',
        password: '',
    });

    const dispatch = useDispatch();

    const [formValid, setFormValid] = useState({
        usernameBlur: null,
        passwordBlur: null,
        usernameValid: null,
        passwordValid: null,
        formErrors: { username: '', password: '' },
    });

    const { formErrors, usernameValid, usernameBlur, passwordBlur, passwordValid } = formValid;

    const validate = (fieldName, value) => {
        switch (fieldName) {
            case 'username':
                if (value.length === 0) {
                    setFormValid({
                        ...formValid,
                        usernameBlur: false,
                        usernameValid: false,
                        formErrors: { username: 'Bạn chưa nhập tên tài khoản', password: formErrors.password },
                    });
                } else {
                    setFormValid({
                        ...formValid,
                        usernameBlur: false,
                        usernameValid: true,
                        formErrors: { username: '', password: formErrors.password },
                    });
                }
                break;
            case 'password':
                if (value.length === 0) {
                    setFormValid({
                        ...formValid,
                        passwordBlur: false,
                        passwordValid: false,
                        formErrors: { username: formErrors.username, password: 'Bạn chưa nhập mật khẩu' },
                    });
                } else {
                    setFormValid({
                        ...formValid,
                        passwordBlur: false,
                        passwordValid: true,
                        formErrors: { username: formErrors.username, password: '' },
                    });
                }
                break;

            default:
                break;
        }
    };

    const [show, setShow] = useState({
        type: 'password',
    });

    const { username, password } = formValue;
    const onClickIcon = () => {
        if (show.type === 'password') {
            setShow({ type: 'text' });
        } else {
            setShow({ type: 'password' });
        }
    };

    const onChangeForm = (event) => {
        setFormValue({
            ...formValue,
            [event.target.name]: event.target.value,
        });
        validate(event.target.name, event.target.value);
    };

    const setOnBlur = (event) => {
        switch (event.target.name) {
            case 'username':
                setFormValid({
                    ...formValid,
                    usernameBlur: true,
                });

                break;
            case 'password':
                setFormValid({
                    ...formValid,
                    passwordBlur: true,
                });
                break;
            default:
                break;
        }
    };

    const setOnFocus = (event) => {
        switch (event.target.name) {
            case 'username':
                validate(event.target.name, username);
                break;
            case 'password':
                validate(event.target.name, password);
                break;
            default:
                break;
        }
    };

    const navigate = useNavigate();
    const toastState = useSelector((state) => state.toast);
    const login = async (event) => {
        event.preventDefault();
        try {
            const response = await authApi.login(formValue);
            if (response.success) {
                localStorage.setItem(LOCAL_STORAGE_TOKEN_NAME, response.accessToken);
                setAuthToken(response.accessToken);
                const res = await authApi.loadUser();
                if (res.success) {
                    dispatch(setAuth({ user: res.user, isAuthenticated: true }));
                    navigate(routes.myMusic, { replace: true });
                    dispatch(
                        addToast({
                            id: toastState.toastList.length + 1,
                            content: response.message,
                            type: 'success',
                        }),
                    );
                }
            } else {
                dispatch(
                    addToast({
                        id: toastState.toastList.length + 1,
                        content: response.message,
                        type: 'error',
                    }),
                );
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className={cx('wrapper', ['grid'])}>
            <div className={cx('header')}>
                <div className={cx('inner')}>
                    <div className={cx('logo-wrapper', viewPort.width < 740 && 'mobile')}>
                        <div className={cx('logo-wrapper-link')}>
                            <Link className={cx('logo')} to={config.routes.home}>
                                <img src={images.logo} alt="logo" className={cx('logo-img')}></img>
                            </Link>
                            <Link to={config.routes.home} className={cx('logo-text-title')}>
                                Noloce
                            </Link>
                        </div>
                        <p className={cx('logo-text')}>Đăng nhập</p>
                    </div>
                </div>
            </div>
            <div className={cx('content', viewPort.width < 740 && 'mobile')}>
                <div className={cx('form')}>
                    <div className={cx('title')}>
                        <h3 className={cx('title-text')}> Chào mừng bạn đến với Noloce </h3>
                    </div>
                    <form className={cx('form-content')} onSubmit={login} name="form-login">
                        <div className={cx('form-group')}>
                            <input
                                autoComplete={'off'}
                                value={username}
                                type={'text'}
                                spellCheck={false}
                                id="username"
                                onFocus={setOnFocus}
                                onBlur={setOnBlur}
                                className={cx('input', usernameBlur && !usernameValid && 'error')}
                                name={'username'}
                                onChange={onChangeForm}
                                placeholder="Tên đăng nhập"
                            ></input>
                            <span className={cx('form-error')}>{usernameBlur && formErrors.username}</span>
                        </div>
                        <div className={cx('form-group')}>
                            <div className={cx('form-group-password')}>
                                <input
                                    autoComplete={'off'}
                                    className={cx('password', passwordBlur && !passwordValid && 'error')}
                                    value={password}
                                    type={show.type}
                                    onFocus={setOnFocus}
                                    onBlur={setOnBlur}
                                    id="password"
                                    name={'password'}
                                    placeholder="Mật khẩu"
                                    onChange={onChangeForm}
                                />
                                <div className={cx('password-icon')}>
                                    {show.type === 'password' ? (
                                        <RxEyeClosed className={cx('icon')} onClick={onClickIcon} />
                                    ) : (
                                        <RxEyeOpen onClick={onClickIcon} className={cx('icon')} />
                                    )}
                                </div>
                            </div>

                            <span className={cx('form-error')}>{passwordBlur && formErrors.password}</span>
                        </div>
                        <div className={cx('button')}>
                            <Button to={config.routes.home} primary className={cx('btn-back')}>
                                Quay lại
                            </Button>
                            {usernameValid && passwordValid ? (
                                <Button type="submit" primary>
                                    Đăng nhập
                                </Button>
                            ) : (
                                <Button primary disable>
                                    Đăng nhập
                                </Button>
                            )}
                        </div>
                    </form>
                    <div className={cx('footer')}>
                        <div className={cx('help')}>
                            <p className={cx('help-text')}>Quên mật khẩu</p>
                            <p className={cx('help-text')}>Đăng nhập với SMS</p>
                        </div>
                        <div>
                            <p className={cx('or')}>HOẶC ĐĂNG NHẬP VỚI</p>
                        </div>
                        <div className={cx('social')}>
                            <div className={cx('social-list')}>
                                <img className={cx('social-icon')} src={images.google} alt="" />
                                <span> Google</span>
                            </div>
                            <div className={cx('social-list')}>
                                <img className={cx('social-icon')} src={images.facebook} alt="" />
                                <span> Facebook</span>
                            </div>
                        </div>
                        <div className={cx('change')}>
                            <p className={cx('change-text')}>Bạn mới biết đến Noloce?</p>
                            <Button to={config.routes.register} primary className={cx('change-btn')}>
                                <span className={cx('change-btn-span')}>Đăng ký</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
