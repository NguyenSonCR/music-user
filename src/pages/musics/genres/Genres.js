import styles from './Genres.module.scss';
import classNames from 'classnames/bind';
import GenresConcept from './genresConcept/GenresConcept';
import musicApi from '~/api/music/musicApi';
import { useEffect } from 'react';
import { setGenres } from '~/slices/songSlice';
import { useDispatch, useSelector } from 'react-redux';
import Loading from '~/layouts/components/Loading';

const cx = classNames.bind(styles);

function Genres() {
    const genres = useSelector((state) => state.song.genres);
    const dispatch = useDispatch();
    useEffect(() => {
        musicApi.getGenres().then((res) => {
            dispatch(setGenres(res.genres));
        });
        // eslint-disable-next-line
    }, []);

    return (
        <div className={cx('wrapper')}>
            {genres ? (
                <GenresConcept title={'Tâm trạng và hoạt động'} data={genres.topic} genres={true} />
            ) : (
                <Loading />
            )}
            <div className={cx('genres')}>
                {genres ? (
                    genres.genre.map((item, index) => (
                        <GenresConcept
                            key={index}
                            title={item.title}
                            data={item.playlists.slice(0, 5)}
                            genres={false}
                        />
                    ))
                ) : (
                    <Loading />
                )}
            </div>
        </div>
    );
}

export default Genres;
