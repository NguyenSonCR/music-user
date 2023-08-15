import musicApi from '~/api/music/musicApi';
import styles from './Artist.module.scss';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import NewSongRelease from '~/layouts/components/NewSongRelease';
import SongConcept from '~/layouts/components/SongConcept';
import Loading from '~/layouts/components/Loading';

const cx = classNames.bind(styles);
function Artist() {
    const { slug } = useParams();
    const [artist, setArtist] = useState();
    useEffect(() => {
        musicApi.getArtist(slug).then((data) => setArtist(data.data));
    }, [slug]);
    let body = (
        <div>
            <Loading />
            <Loading />
            <Loading />
        </div>
    );
    if (artist) {
        body = (
            <div className={cx('wrapper')}>
                {artist.sections.map((section, index) => {
                    let body = null;
                    if (section.sectionType === 'song') {
                        body = (
                            <div className={cx('songs')} key={index}>
                                <NewSongRelease concept={section} all={false} />
                            </div>
                        );
                    } else if (section.sectionType === 'playlist') {
                        body = (
                            <div className={cx('playlists')} key={index}>
                                <SongConcept title={section.title} data={section.items} all={false} />
                            </div>
                        );
                    } else if (section.sectionType === 'artist')
                        body = (
                            <div className={cx('tab3')} key={index}>
                                <div className={cx('title')}>{section.title}</div>
                                <div className={cx(['row'])}>
                                    {section.items.map((item, index) => (
                                        <Link
                                            key={index}
                                            className={cx('tab2-item', ['col', 'l-2-4', 'm-4', 'c-6'])}
                                            to={`/music/artist/${item.alias}`}
                                        >
                                            <div className={cx('album-img')}>
                                                <img className={cx('item-img')} src={item.thumbnailM} alt=""></img>
                                            </div>

                                            <p className={cx('item-name')}>{item.name}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    return body;
                })}

                <div className={cx('about')}>
                    <div className={cx('about-title')}>Về {artist.name}</div>
                    <div className={cx(['row'])}>
                        <div className={cx(['col', 'l-5'])}>
                            <img src={artist.thumbnailM} alt="" className={cx('about-img')}></img>
                        </div>
                        <div className={cx(['col', 'l-7'])}>
                            <ul className={cx('about-info')}>
                                <li>Họ tên: {artist.realname}</li>
                                <li>Ngày sinh: {artist.birthday}</li>
                                <li>Quốc tịch: {artist.national}</li>
                            </ul>
                            <div
                                className={cx('descreption')}
                                dangerouslySetInnerHTML={{ __html: artist.biography }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return body;
}

export default Artist;
