import classNames from 'classnames/bind';
import styles from './Search.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react/headless';
import { Wrapper } from '~/components/Popper';
import { faCircleXmark, faSpinner, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import musicApi from '~/api/music/musicApi';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchResult } from '~/slices/songSlice';
import { useDebounce } from '~/hooks';
import PlaylistItem from '~/pages/musics/playlist/PlaylistItem';
import config from '~/config';
import useViewport from '~/hooks/useViewport';
import { CiSearch } from 'react-icons/ci';

const cx = classNames.bind(styles);

function Search({ visible }) {
    const viewPort = useViewport();
    const isMobile = viewPort.width < 740;
    const songState = useSelector((state) => state.song);
    const searchResult = songState?.searchResult;
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const debouncedValue = useDebounce(query, 500);
    const [show, setShow] = useState(false);
    const inputRef = useRef();

    const handleOnChange = (event) => {
        setQuery(event.target.value);
    };

    useEffect(() => {
        setLoading(true);
        if (!debouncedValue.trim()) {
            dispatch(setSearchResult(null));
            setLoading(false);
            setShow(false);
            return;
        } else {
            handleSearch();
        }
        // eslint-disable-next-line
    }, [debouncedValue]);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSearch = () => {
        musicApi.searchSong(query).then((response) => {
            if (response.success) {
                dispatch(setSearchResult(response.result));
                setLoading(false);
                setShow(true);
            }
        });
    };

    const handleEnter = (event) => {
        if (event.key === 'Enter') {
            inputRef.current.blur();
            setLoading(true);
            if (!debouncedValue.trim()) {
                dispatch(setSearchResult(null));
                setLoading(false);
                setShow(false);
                return;
            } else {
                musicApi.searchSong(query).then((response) => {
                    if (response.success) {
                        dispatch(setSearchResult(response.result));
                        setLoading(false);
                        navigate(config.routes.searchMusic);
                    }
                });
            }
        }
    };

    const handleClickSearch = () => {
        inputRef.current.blur();
        setLoading(true);
        if (!debouncedValue.trim()) {
            dispatch(setSearchResult(null));
            setLoading(false);
            setShow(false);
            return;
        } else {
            musicApi.searchSong(query).then((response) => {
                if (response.success) {
                    dispatch(setSearchResult(response.result));
                    setLoading(false);
                    navigate(config.routes.searchMusic);
                }
            });
        }
    };

    const handleClear = () => {
        setQuery('');
    };

    let body = null;
    if (isMobile) {
        body = (
            <div className={cx('mobile')}>
                <Tippy
                    delay={[0, 300]}
                    visible={visible ? visible : show}
                    interactive
                    render={(attrs) => (
                        <div className={cx('search-result')} tabIndex="-1" {...attrs}>
                            <Wrapper className={cx('search-result-popper')}>
                                <div
                                    className={cx('search-result-body')}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        inputRef.current.blur();
                                    }}
                                >
                                    <div className={cx('search-result-header')}>
                                        <FontAwesomeIcon
                                            icon={faMagnifyingGlass}
                                            className={cx('result-icon')}
                                        ></FontAwesomeIcon>
                                        <p className={cx('result-text')}>Gợi ý kết quả</p>
                                    </div>
                                    <div className={cx('result-content')}>
                                        {searchResult && (
                                            <div className={cx('list')}>
                                                {searchResult?.artists && (
                                                    <Link
                                                        to={`/music/artist/${searchResult.artists[0].alias}`}
                                                        className={cx('artist')}
                                                        onClick={() => {
                                                            setShow(false);
                                                        }}
                                                    >
                                                        <img
                                                            className={cx('artist-img')}
                                                            src={searchResult.artists[0].thumbnailM}
                                                            alt=""
                                                        ></img>
                                                        <div className={cx('text')}>
                                                            <p>{searchResult.artists[0].name}</p>
                                                            <p>Nghệ sĩ</p>
                                                        </div>
                                                    </Link>
                                                )}
                                                {searchResult?.playlists && (
                                                    <Link
                                                        to={`/music/album/${searchResult.playlists[0].encodeId}`}
                                                        className={cx('playlist')}
                                                        onClick={() => {
                                                            setShow(false);
                                                        }}
                                                    >
                                                        <img
                                                            alt=""
                                                            className={cx('playlist-img')}
                                                            src={searchResult.playlists[0].thumbnail}
                                                        ></img>

                                                        <div className={cx('text')}>
                                                            <p>{searchResult.playlists[0].title}</p>
                                                            <p>Allbum</p>
                                                        </div>
                                                    </Link>
                                                )}

                                                <PlaylistItem
                                                    playlist={searchResult?.songs}
                                                    songList={searchResult?.songs?.slice(0, 3)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className={cx('footer')}>
                                        <Link
                                            to={config.routes.searchMusic}
                                            className={cx('footer-link')}
                                            onClick={() => {
                                                setShow(false);
                                            }}
                                        >
                                            Xem tất cả
                                        </Link>
                                    </div>
                                </div>
                            </Wrapper>
                        </div>
                    )}
                >
                    <div className={cx('wrapper')}>
                        <input
                            autoComplete="off"
                            name="search"
                            ref={inputRef}
                            className={cx('input')}
                            placeholder="Tìm kiếm "
                            spellCheck={false}
                            onChange={handleOnChange}
                            onKeyUp={handleEnter}
                            value={query}
                            onBlur={() => {
                                setShow(false);
                            }}
                            onFocus={() => {
                                if (searchResult) setShow(true);
                            }}
                        ></input>

                        {!loading && (
                            <FontAwesomeIcon icon={faCircleXmark} className={cx('clear')} onClick={handleClear} />
                        )}

                        {loading && <FontAwesomeIcon className={cx('loading')} icon={faSpinner} />}
                        <div className={cx('split')}></div>
                        <div className={cx('search-btn')} onClick={handleClickSearch}>
                            <CiSearch className={cx('search-btn-icon')} />
                        </div>
                    </div>
                </Tippy>
            </div>
        );
    }

    if (!isMobile) {
        body = (
            <Tippy
                delay={[0, 300]}
                visible={visible ? visible : show}
                interactive
                render={(attrs) => (
                    <div className={cx('search-result')} tabIndex="-1" {...attrs}>
                        <Wrapper className={cx('search-result-popper')}>
                            <div
                                className={cx('search-result-body')}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    inputRef.current.blur();
                                }}
                            >
                                <div className={cx('search-result-header')}>
                                    <FontAwesomeIcon
                                        icon={faMagnifyingGlass}
                                        className={cx('result-icon')}
                                    ></FontAwesomeIcon>
                                    <p className={cx('result-text')}>Gợi ý kết quả</p>
                                </div>
                                <div className={cx('result-content')}>
                                    {searchResult && (
                                        <div className={cx('list')}>
                                            {searchResult?.artists && (
                                                <Link
                                                    to={`/music/artist/${searchResult.artists[0].alias}`}
                                                    className={cx('artist')}
                                                >
                                                    <img
                                                        className={cx('artist-img')}
                                                        src={searchResult.artists[0].thumbnailM}
                                                        alt=""
                                                    ></img>
                                                    <div className={cx('text')}>
                                                        <p>{searchResult.artists[0].name}</p>
                                                        <p>Nghệ sĩ</p>
                                                    </div>
                                                </Link>
                                            )}
                                            {searchResult?.playlists && (
                                                <Link
                                                    to={`/music/album/${searchResult.playlists[0].encodeId}`}
                                                    className={cx('playlist')}
                                                >
                                                    <img
                                                        alt=""
                                                        className={cx('playlist-img')}
                                                        src={searchResult.playlists[0].thumbnail}
                                                    ></img>

                                                    <div className={cx('text')}>
                                                        <p>{searchResult.playlists[0].title}</p>
                                                        <p>Allbum</p>
                                                    </div>
                                                </Link>
                                            )}

                                            <PlaylistItem
                                                playlist={searchResult?.songs}
                                                songList={searchResult?.songs?.slice(0, 3)}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className={cx('footer')}>
                                    <Link to={config.routes.searchMusic} className={cx('footer-link')}>
                                        Xem tất cả
                                    </Link>
                                </div>
                            </div>
                        </Wrapper>
                    </div>
                )}
            >
                <div className={cx('wrapper')}>
                    <input
                        name="search"
                        ref={inputRef}
                        className={cx('input')}
                        placeholder="Tìm kiếm "
                        spellCheck={false}
                        onChange={handleOnChange}
                        onKeyUp={handleEnter}
                        value={query}
                        onBlur={() => {
                            setShow(false);
                        }}
                        onFocus={() => {
                            if (searchResult) setShow(true);
                        }}
                    ></input>

                    {!loading && <FontAwesomeIcon icon={faCircleXmark} className={cx('clear')} onClick={handleClear} />}

                    {loading && <FontAwesomeIcon className={cx('loading')} icon={faSpinner} />}
                    <div className={cx('split')}></div>
                    <div className={cx('search-btn')} onClick={handleClickSearch}>
                        <FontAwesomeIcon icon={faMagnifyingGlass} className={cx('search-btn-icon')} />
                    </div>
                </div>
            </Tippy>
        );
    }
    return body;
}

export default Search;
