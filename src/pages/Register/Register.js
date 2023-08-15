import classNames from 'classnames/bind';
import styles from './Register.module.scss';
import config from '~/config';
import { useState } from 'react';
import images from '~/assets/img';
import { Link, useNavigate } from 'react-router-dom';
import Button from '~/components/Button';
import { validation, setOnFocus } from '~/utils/validation';
import authApi from '~/api/auth/auth';
import { LOCAL_STORAGE_TOKEN_NAME } from '~/api/constants';
import setAuthToken from '~/api/setAuthToken';
import { useDispatch, useSelector } from 'react-redux';
import { setAuth } from '~/slices/authSlice';
import routes from '~/config/routes';
import { addToast } from '~/slices/toastSlice';
import useViewport from '~/hooks/useViewport';

const cx = classNames.bind(styles);

function Register() {
    const viewPort = useViewport();

    const [formValue, setFormValue] = useState({
        username: '',
        password: '',
        fullName: '',
        passwordConfirm: '',
    });
    const [show, setShow] = useState({
        type: 'password',
    });

    const { username, fullName, password, passwordConfirm } = formValue;

    const onClickIcon = () => {
        if (show.type === 'password') {
            setShow({ type: 'text' });
        } else {
            setShow({ type: 'password' });
        }
    };

    // validate
    const [formValid, setFormValid] = useState({
        usernameBlur: null,
        fullNameBlur: null,
        passwordBlur: null,
        passwordConfirmBlur: null,
        fullNameValid: null,
        passwordConfirmValid: null,
        usernameValid: null,
        passwordValid: null,
        formErrors: { username: '', fullName: '', password: '', passwordConfirm: '' },
    });

    const {
        formErrors,
        usernameValid,
        usernameBlur,
        passwordBlur,
        fullNameBlur,
        passwordConfirmBlur,
        fullNameValid,
        passwordConfirmValid,
        passwordValid,
    } = formValid;

    const setOnBlur = (event) => {
        switch (event.target.name) {
            case 'username':
                setFormValid({
                    ...formValid,
                    usernameBlur: true,
                });

                break;

            case 'fullName':
                setFormValid({
                    ...formValid,
                    fullNameBlur: true,
                });
                break;
            case 'password':
                setFormValid({
                    ...formValid,
                    passwordBlur: true,
                });
                break;

            case 'passwordConfirm':
                setFormValid({
                    ...formValid,
                    passwordConfirmBlur: true,
                });
                break;
            default:
                break;
        }
    };

    const onChangeForm = (event) => {
        setFormValue({
            ...formValue,
            [event.target.name]: event.target.value,
        });
        validation(event.target.name, event.target.value, setFormValid, formValid, password);
    };

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const toastState = useSelector((state) => state.toast);

    const register = async (event) => {
        event.preventDefault();
        try {
            const response = await authApi.register(formValue);
            if (response.success) {
                if (response.success) {
                    localStorage.setItem(LOCAL_STORAGE_TOKEN_NAME, response.accessToken);
                    setAuthToken(response.accessToken);
                    const res = await authApi.loadUser();
                    if (res.success) {
                        dispatch(setAuth(res.user));
                        navigate(routes.home);
                        dispatch(
                            addToast({
                                id: toastState.toastList.length + 1,
                                content: response.message,
                                type: 'success',
                            }),
                        );
                    }
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
                        <p className={cx('logo-text')}>Đăng ký</p>
                    </div>
                </div>
            </div>

            <div className={cx('content', viewPort.width < 740 && 'mobile')}>
                <div className={cx('form')}>
                    <div className={cx('title')}>
                        <h3> Đăng ký </h3>
                    </div>
                    <form className={cx('form-content')} id="form-register" onSubmit={register} name="form-register">
                        <div className={cx('form-group')}>
                            <input
                                onFocus={(event) => setOnFocus(event, setFormValid, formValid, password)}
                                onBlur={setOnBlur}
                                spellCheck={false}
                                value={username}
                                type={'text'}
                                id="username"
                                className={cx('input', usernameBlur && formErrors.username && 'error')}
                                name={'username'}
                                onChange={onChangeForm}
                                placeholder="Tên đăng nhập"
                            ></input>
                            <span className={cx('form-message')}>{usernameBlur && formErrors.username}</span>
                        </div>
                        <div className={cx('form-group')}>
                            <input
                                onFocus={(event) => setOnFocus(event, setFormValid, formValid, password)}
                                onBlur={setOnBlur}
                                value={fullName}
                                spellCheck={false}
                                type={'text'}
                                id="fullName"
                                className={cx('input', fullNameBlur && formErrors.fullName && 'error')}
                                name={'fullName'}
                                onChange={onChangeForm}
                                placeholder="Họ tên"
                            ></input>
                            <span className={cx('form-message')}>{fullNameBlur && formErrors.fullName}</span>
                        </div>

                        <div className={cx('form-group')}>
                            <div className={cx('form-password')}>
                                <input
                                    onFocus={(event) => setOnFocus(event, setFormValid, formValid, password)}
                                    onBlur={setOnBlur}
                                    className={cx('password', passwordBlur && !passwordValid && 'error')}
                                    value={password}
                                    type={show.type}
                                    id="password"
                                    name={'password'}
                                    placeholder="Nhập mật khẩu"
                                    onChange={onChangeForm}
                                    autoComplete="true"
                                ></input>

                                <input
                                    onFocus={(event) => setOnFocus(event, setFormValid, formValid, password)}
                                    onBlur={setOnBlur}
                                    className={cx('password', passwordConfirmBlur && !passwordConfirmValid && 'error')}
                                    value={passwordConfirm}
                                    type={show.type}
                                    id="passwordConfirm"
                                    name={'passwordConfirm'}
                                    placeholder="Nhập lại mật khẩu"
                                    onChange={onChangeForm}
                                    autoComplete="true"
                                ></input>
                            </div>
                            <div className={cx('form-action')}>
                                <div>
                                    <span className={cx('form-message')}>{passwordBlur && formErrors.password}</span>
                                    <span className={cx('form-message')}>
                                        {passwordConfirmBlur && formErrors.passwordConfirm}
                                    </span>
                                </div>
                                <div className={cx('show-password')}>
                                    <span>Hiện mật khẩu</span>
                                    <input name="switch" type={'checkbox'} onClick={onClickIcon}></input>
                                </div>
                            </div>
                        </div>

                        <div className={cx('button', viewPort.width < 740 && 'mobile')}>
                            <Button
                                to={config.routes.login}
                                className={cx('btn-back', viewPort.width < 740 && 'mobile')}
                                primary
                            >
                                Quay lại
                            </Button>
                            {usernameValid && fullNameValid && passwordValid && passwordConfirmValid ? (
                                <Button
                                    type="submit"
                                    primary
                                    className={cx('btn-back', viewPort.width < 740 && 'mobile')}
                                >
                                    Đăng ký
                                </Button>
                            ) : (
                                <Button
                                    primary
                                    disable
                                    className={cx('btn-register', viewPort.width < 740 && 'mobile')}
                                >
                                    Đăng ký
                                </Button>
                            )}
                        </div>

                        <div>
                            <p className={cx('or')}>HOẶC ĐĂNG NHẬP VỚI</p>
                        </div>
                        <div className={cx('social')}>
                            <div className={cx('social-list')}>
                                <img className={cx('social-icon')} src={images.google} alt="" />
                                <span>Google</span>
                            </div>
                            <div className={cx('social-list')}>
                                <img className={cx('social-icon')} src={images.facebook} alt="" />
                                <span>Facebook</span>
                            </div>
                        </div>
                        <div className={cx('change')}>
                            <p className={cx('change-text')}>Bạn đã có tài khoản?</p>
                            <Button to={config.routes.login} primary>
                                Đăng nhập
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;
