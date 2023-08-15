import classNames from 'classnames/bind';
import styles from './Navigation.module.scss';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import images from '~/assets/img';

const cx = classNames.bind(styles);

function Header({ title, to }) {
    return (
        <header className={cx('header')}>
            {/* <div className={cx('back-btn')} onClick={onBack}>
                <img src={images.back} alt="" className={cx('header-img')}></img>
            </div> */}
            <Link to={to} className={cx('header-title')}>
                {title}
            </Link>
        </header>
    );
}

Header.propTypes = {
    title: PropTypes.string.isRequired,
};
export default Header;
