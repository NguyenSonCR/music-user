import classNames from 'classnames/bind';
import styles from './Model.module.scss';
import { TfiClose } from 'react-icons/tfi';

const cx = classNames.bind(styles);
function Model({ children, setModel }) {
    document.body.style.overflow = 'hidden';
    return (
        <div
            className={cx('model')}
            onClick={() => {
                setModel(false);
                document.body.style.overflow = '';
            }}
        >
            <div className={cx('container')} onClick={(e) => e.stopPropagation()}>
                <div
                    className={cx('btn-close')}
                    onClick={() => {
                        setModel(false);
                        document.body.style.overflow = '';
                    }}
                >
                    <TfiClose className={cx('icon')} />
                </div>
                {children}
            </div>
        </div>
    );
}

export default Model;
