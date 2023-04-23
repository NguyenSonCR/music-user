import styles from './HomeMusic.module.scss';
import classNames from 'classnames/bind';
import SongConcept from '~/layouts/components/SongConcept';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState, useRef } from 'react';
import musicApi from '~/api/music/musicApi';
import { useNavigate } from 'react-router-dom';
import Loading from '~/layouts/components/Loading';
import NewSongConcept from '~/layouts/components/NewSongConcept';
import NewSongRelease from '~/layouts/components/NewSongRelease';
import config from '~/config';
import useViewport from '~/hooks/useViewport';
import images from '~/assets/img';
import { ReactComponent as IconKinds } from '~/assets/icon/kinds.svg';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper';

import { loadSong, play, setLink, setHomeMusic, setSongLyric, setAlbumPlaying } from '~/slices/songSlice';
import React from 'react';
import axios from 'axios';

const cx = classNames.bind(styles);
function HomeMusic() {
    const songState = useSelector((state) => state.song);
    const swiperRef = useRef(null);

    const viewPort = useViewport();
    const isMobile = viewPort.width < 740;

    const dispatch = useDispatch();
    useEffect(() => {
        if (!songState.homeMusic) {
            musicApi.getHome().then((response) => {
                if (response.success) {
                    dispatch(setHomeMusic(response.homeData.items));
                    setMobileSlider(response.homeData.items[0].items);
                }
            });
        } else {
            setMobileSlider(songState.homeMusic[0].items);
        }
        // eslint-disable-next-line
    }, []);

    const [mobileSlider, setMobileSlider] = useState([]);
    const navigate = useNavigate();
    const handleChooseSlide = async (item) => {
        if (item.type === 4) {
            navigate(`/music/album/${item.encodeId}`);
        }
        try {
            const response = await musicApi.getSong(item.encodeId);
            if (response.success) {
                dispatch(loadSong(response.info));
                handleSelectSong(response.info);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const convertTimeToNumber = (string) => {
        const minutes = string.slice(1, 2);
        const seconds = string.slice(3, 9);
        const value = Math.round(Number(minutes) * 60 * 1000 + Math.round(Number(seconds) * 1000));
        return value;
    };

    const handleSelectSong = (item) => {
        dispatch(setAlbumPlaying({ playlist: [item], title: '' }));
        dispatch(play());
        const linkPromise = musicApi.getSong(item.encodeId);
        const fileLyricPromise = musicApi.getLyricSong(item.encodeId);

        Promise.all([linkPromise, fileLyricPromise])
            .then((response) => {
                dispatch(
                    setLink({
                        link: response[0].data['128'],
                        songId: response[0].info.encodeId,
                    }),
                );
                const lyricPromise = axios.get(response[1].lyric.file, {
                    headers: {
                        'content-type': 'application/octet-stream',
                    },
                });

                lyricPromise
                    .then((lyric) => {
                        const array = lyric.data.split('\n');
                        const array1 = array.map((line) => {
                            return {
                                startTime: convertTimeToNumber(line.slice(1, 9)),
                                words: line.slice(10, line.length),
                            };
                        });
                        dispatch(setSongLyric({ lyric: array1, songId: response[0].info.encodeId }));
                    })
                    .catch((error) => console.log(error));
            })
            .catch((error) => {
                console.log(error);
            });
    };

    let body = null;

    if (isMobile) {
        body = (
            <div className={cx('mobile')}>
                <div className={cx('wrapper')}>
                    {mobileSlider.length > 0 ? (
                        <Swiper
                            slidesPerView={1}
                            spaceBetween={10}
                            loop={true}
                            pagination={{
                                clickable: true,
                            }}
                            autoplay={{
                                delay: 2500,
                                disableOnInteraction: false,
                            }}
                            modules={[Autoplay, Pagination]}
                            className="mySwiper"
                        >
                            {mobileSlider.map((item, index) => (
                                <SwiperSlide key={index}>
                                    <img alt="" src={item.banner} className={cx('img')}></img>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    ) : (
                        <div className={cx(['row'])}>
                            <div className={cx(['col', 'l-4', 'm-6', 'c-12'])}>
                                <div className={cx('loading')} style={{ animation: 'loading 2s infinite' }}></div>
                            </div>
                        </div>
                    )}
                    <div className={cx('mobile-navigate')}>
                        <div
                            className={cx('navigate-item')}
                            onClick={() => {
                                navigate(config.routes.myMusic);
                            }}
                        >
                            <img src={images.musicUser} alt="" className={cx('navigate-img')}></img>
                            <p className={cx('navigate-text')}>Cá nhân</p>
                        </div>
                        <div
                            className={cx('navigate-item')}
                            onClick={() => {
                                navigate(config.routes.music);
                            }}
                        >
                            <img src={images.cd} alt="" className={cx('navigate-img')}></img>
                            <p className={cx('navigate-text')}>Khám phá</p>
                        </div>
                        <div
                            className={cx('navigate-item')}
                            onClick={() => {
                                navigate(config.routes.top100);
                            }}
                        >
                            <img src={images.star} alt="" className={cx('navigate-img')}></img>
                            <p className={cx('navigate-text')}>Top 100</p>
                        </div>
                        <div
                            className={cx('navigate-item')}
                            onClick={() => {
                                navigate(config.routes.genresMusic);
                            }}
                        >
                            <IconKinds className={cx('navigate-img')} />
                            <p className={cx('navigate-text')}>Thể loại</p>
                        </div>
                    </div>
                    <div>
                        {songState.homeMusic ? (
                            songState.homeMusic.map((concept, index) => {
                                let value = null;
                                if (concept.sectionType === 'weekChart' || concept.sectionType === 'livestream') {
                                    return (value = <div key={index}></div>);
                                } else if (concept.sectionType === 'artistSpotlight') {
                                    return (value = <div key={index}></div>);
                                } else if (concept.sectionType === 'RTChart') {
                                    return (value = <div key={index}></div>);
                                } else if (concept.sectionType === 'newReleaseChart') {
                                    return (value = (
                                        <NewSongRelease concept={concept} key={index} link={config.routes.newRelease} />
                                    ));
                                } else if (concept.sectionType === 'new-release' && concept.sectionId !== 'hSlider') {
                                    return (value = <NewSongConcept key={index} link={config.routes.newRelease} />);
                                } else if (concept.items && concept.sectionId !== 'hSlider') {
                                    const title = concept.title || '';
                                    if (concept.title === 'Top 100') {
                                        return (value = (
                                            <SongConcept
                                                key={index}
                                                title={title}
                                                data={concept}
                                                link={config.routes.top100}
                                            />
                                        ));
                                    }

                                    return (value = (
                                        <SongConcept key={index} title={title} data={concept} all={false} />
                                    ));
                                }
                                return value;
                            })
                        ) : (
                            <div className={cx('content-loading')}>
                                <Loading />
                                <Loading />
                                <Loading />
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
                {mobileSlider.length > 0 ? (
                    <Swiper
                        ref={swiperRef}
                        init="false"
                        slidesPerView={3}
                        spaceBetween={10}
                        loop={true}
                        // autoplay={{
                        //     delay: 2500,
                        //     disableOnInteraction: false,
                        // }}
                        pagination={true}
                        navigation
                        modules={[Navigation, Pagination, Autoplay]}
                    >
                        {mobileSlider.map((item, index) => (
                            <SwiperSlide key={index} onClick={() => handleChooseSlide(item)}>
                                <img alt="" src={item.banner} className={cx('img')}></img>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                ) : (
                    <div className={cx(['row', 'sm-gutter'])}>
                        <div className={cx(['col', 'l-4'])}>
                            <div className={cx('loading')} style={{ animation: 'loading 2s infinite' }}></div>
                        </div>
                        <div className={cx(['col', 'l-4'])}>
                            <div className={cx('loading')} style={{ animation: 'loading 2s infinite' }}></div>
                        </div>
                        <div className={cx(['col', 'l-4'])}>
                            <div className={cx('loading')} style={{ animation: 'loading 2s infinite' }}></div>
                        </div>
                    </div>
                )}
                <div>
                    {songState.homeMusic ? (
                        songState.homeMusic.map((concept, index) => {
                            let value = null;
                            if (concept.sectionType === 'weekChart' || concept.sectionType === 'livestream') {
                                return (value = <div key={index}></div>);
                            } else if (concept.sectionType === 'artistSpotlight') {
                                return (value = <div key={index}></div>);
                            } else if (concept.sectionType === 'RTChart') {
                                return (value = <div key={index}></div>);
                            } else if (concept.sectionType === 'newReleaseChart') {
                                return (value = (
                                    <NewSongRelease concept={concept} key={index} link={config.routes.newRelease} />
                                ));
                            } else if (concept.sectionType === 'new-release' && concept.sectionId !== 'hSlider') {
                                return (value = <NewSongConcept key={index} link={config.routes.newRelease} />);
                            } else if (concept.items && concept.sectionId !== 'hSlider') {
                                const title = concept.title || '';
                                if (concept.title === 'Top 100') {
                                    return (value = (
                                        <SongConcept
                                            key={index}
                                            title={title}
                                            data={concept}
                                            link={config.routes.top100}
                                        />
                                    ));
                                }

                                return (value = <SongConcept key={index} title={title} data={concept} all={false} />);
                            }
                            return value;
                        })
                    ) : (
                        <div>
                            <Loading />
                            <Loading />
                            <Loading />
                            <Loading />
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return body;
}

export default HomeMusic;
