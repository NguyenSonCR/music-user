import classNames from 'classnames/bind';
import styles from './Model.module.scss';
import { TfiClose } from 'react-icons/tfi';

const cx = classNames.bind(styles);
function Model({ children, setModel }) {
    return (
        <div
            className={cx('model')}
            onClick={() => {
                setModel(false);
            }}
        >
            <div className={cx('container')} onClick={(e) => e.stopPropagation()}>
                <div
                    className={cx('btn-close')}
                    onClick={() => {
                        setModel(false);
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
