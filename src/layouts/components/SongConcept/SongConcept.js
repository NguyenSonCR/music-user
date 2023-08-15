import styles from './SongConcept.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faPlay } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import useViewport from '~/hooks/useViewport';

const cx = classNames.bind(styles);
function SongConcept({ title, data, details, all, link }) {
    const viewPort = useViewport();
    const isMobile = viewPort.width < 740;

    const navigate = useNavigate();
    const handleOnclick = (id) => {
        navigate(`/music/album/${id}`);
    };

    let list = null;
    if (data.items) {
        list = data.items;
    } else {
        list = data;
    }

    let body = null;
    if (isMobile) {
        body = (
            <div className={cx('mobile')}>
                <div className={cx('content')}>
                    {!details && (
                        <div className={cx('content-header')}>
                            <p>{title}</p>
                            {all === false ? (
                                <div></div>
                            ) : (
                                <Link to={link} className={cx('content-header-all')}>
                                    <p>Tất cả</p>
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </Link>
                            )}
                        </div>
                    )}
                    <div className={cx('content-song')}>
                        <div className={cx(['row', 'sm-gutter'])}>
                            {list &&
                                Array.isArray(list) &&
                                list.map((item, index) => (
                                    <div className="col l-2-4 m-4 c-6" key={index}>
                                        <div className={cx('song-list')} onClick={() => handleOnclick(item.encodeId)}>
                                            <div className={cx('song-img')}>
                                                <img
                                                    alt=""
                                                    src={item.thumbnailM || item.thumbnail}
                                                    className={cx('img-content')}
                                                ></img>
                                                <div className={cx('overlay')}>
                                                    <div className={cx('overplay-wrapper')}>
                                                        <FontAwesomeIcon className={cx('overlay-icon')} icon={faPlay} />
                                                    </div>
                                                </div>
                                            </div>

                                            <p className={cx('song-name')}>{item.title}</p>
                                            <p className={cx('song-author')}></p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!isMobile) {
        body = (
            <div className={cx('content')}>
                {!details && (
                    <div className={cx('content-header')}>
                        <p>{title}</p>
                        {all === false ? (
                            <div></div>
                        ) : (
                            <Link to={link} className={cx('content-header-all')}>
                                <p>Tất cả</p>
                                <FontAwesomeIcon icon={faChevronRight} />
                            </Link>
                        )}
                    </div>
                )}
                <div className={cx('content-song')}>
                    <div className={cx(['row', 'sm-gutter'])}>
                        {list &&
                            Array.isArray(list) &&
                            list.map((item, index) => (
                                <div className="col l-2-4 m-4" key={index}>
                                    <div className={cx('song-list')} onClick={() => handleOnclick(item.encodeId)}>
                                        <div className={cx('song-img')}>
                                            <img
                                                alt=""
                                                src={item.thumbnailM || item.thumbnail}
                                                className={cx('img-content')}
                                            ></img>
                                            <div className={cx('overlay')}>
                                                <div className={cx('overplay-wrapper')}>
                                                    <FontAwesomeIcon className={cx('overlay-icon')} icon={faPlay} />
                                                </div>
                                            </div>
                                        </div>

                                        <p className={cx('song-name')}>{item.title}</p>
                                        <p className={cx('song-author')}></p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        );
    }
    return body;
}

export default SongConcept;
