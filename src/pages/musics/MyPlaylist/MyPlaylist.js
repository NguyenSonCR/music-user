import styles from './MyPlaylist.module.scss';
import classNames from 'classnames/bind';
import SongItemMobile from '~/layouts/components/SongItemMobile';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import Loading from '~/layouts/components/Loading';
import musicApi from '~/api/music/musicApi';
import images from '~/assets/img';
import { HiOutlinePencil } from 'react-icons/hi';
import { useDispatch, useSelector } from 'react-redux';
import { AiOutlineClose } from 'react-icons/ai';
import { RiMoreLine } from 'react-icons/ri';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { addToast } from '~/slices/toastSlice';
import { deletePlaylist, setSingleMyPlaylist } from '~/slices/songSlice';
import { BsTrash } from 'react-icons/bs';
import useViewport from '~/hooks/useViewport';

const cx = classNames.bind(styles);
function MyPlaylist() {
    const { slug } = useParams();
    const songState = useSelector((state) => state.song);
    const playlistChoose = songState.singleMyPlaylist;
    const width = useViewport().width;

    const dispatch = useDispatch();
    const toastState = useSelector((state) => state.toast);
    const navigate = useNavigate();

    const handleDeletePlaylist = async (slug) => {
        try {
            const response = await musicApi.deletePlaylist(slug);
            if (response.success) {
                dispatch(deletePlaylist(slug));
                dispatch(
                    addToast({
                        id: toastState.toastList.length + 1,
                        content: response.message,
                        type: 'success',
                    }),
                );
                navigate(-1);
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

    useEffect(() => {
        if (!playlistChoose) {
            musicApi
                .getSingleMyPlaylist(slug)
                .then((res) => {
                    dispatch(setSingleMyPlaylist(res.playlist));
                })
                .catch((error) => console.log(error));
        }
        // eslint-disable-next-line
    }, [slug]);

    let body = <Loading />;
    if (playlistChoose) {
        body = (
            <div className={cx('wrapper', ['row'], width < 740 && 'mobile')}>
                <div className={cx(['col', 'l-3', 'm-3', 'c-12'])}>
                    <div className={cx('song-img')}>
                        <img alt="" src={images.song} className={cx('img-content')}></img>
                        <div className={cx('overlay')}>
                            <div className={cx('close-icon-wrapper')}>
                                <AiOutlineClose
                                    className={cx('close-icon')}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleDeletePlaylist(slug);
                                    }}
                                />
                            </div>
                            <div className={cx('overplay-wrapper')}>
                                <FontAwesomeIcon className={cx('overlay-icon')} icon={faPlay} />
                            </div>
                            <div
                                className={cx('more-icon-wrapper')}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    // setShowAlbum((show) => !show);
                                    // setActive(item._id);
                                }}
                            >
                                <RiMoreLine className={cx('close-icon')} />
                            </div>
                        </div>
                    </div>
                    <div className={cx('items')}>
                        <p>{playlistChoose.name}</p>
                        <HiOutlinePencil className={cx('items-icon')}></HiOutlinePencil>
                    </div>
                    <div className={cx('items-more')}>
                        <div className={cx('items-wrapper')}>
                            <BsTrash
                                className={cx('items-more-icon')}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleDeletePlaylist(slug);
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className={cx(['col', 'l-9', 'm-9', 'c-12'])}>
                    <div className={cx('header')}>
                        <p className={cx('header-text')}>Danh sách bài hát</p>
                    </div>
                    {playlistChoose.song.length > 0 ? (
                        <SongItemMobile songList={playlistChoose.song} title={playlistChoose.name} myPlaylist />
                    ) : (
                        <div>
                            <p className={cx('no-song-text')}>Chưa có bài hát nào trong playlist</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return body;
}

export default MyPlaylist;
