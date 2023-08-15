import musicApi from '~/api/music/musicApi';
import styles from './NewRelease.module.scss';
import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import SongConcept from '~/layouts/components/SongConcept';
import SongItemMobile from '~/layouts/components/SongItemMobile';
import 'react-loading-skeleton/dist/skeleton.css';
import Loading from '~/layouts/components/Loading';

const cx = classNames.bind(styles);

function NewRelease() {
    useEffect(() => {
        if (!data) {
            musicApi
                .getNewRelease()
                .then((data) => setData(data.data))
                .catch((error) => console.log(error));
        }
        // eslint-disable-next-line
    }, []);
    const [data, setData] = useState();
    const [active, setActive] = useState(1);
    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <p className={cx('header-title')}>Mới phát hành</p>
                <div className={cx('header-action')}>
                    <ul className={cx('tab')}>
                        <li className={cx('tab-item', active === 1 && 'active')} onClick={() => setActive(1)}>
                            Bài hát
                        </li>
                        <li className={cx('tab-item', active === 2 && 'active')} onClick={() => setActive(2)}>
                            Album
                        </li>
                    </ul>
                </div>
            </div>
            <div className={cx('container')}>
                {!data && (
                    <div className={cx('loading')}>
                        <Loading single={true} />
                        <Loading single={true} />
                        <Loading single={true} />
                        <Loading single={true} />
                        <Loading single={true} />
                        <Loading single={true} />
                        <Loading single={true} />
                        <Loading single={true} />
                        <Loading single={true} />
                    </div>
                )}
                {active === 1 && data && <SongItemMobile songList={data.song} />}
                {active === 2 && data && (
                    <div>
                        <SongConcept data={data.album} title={''} all={false} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default NewRelease;
