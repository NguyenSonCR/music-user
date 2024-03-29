import HomeMusic from '~/pages/HomeMusic';
import Cinema from '~/pages/Cinema';
import Search from '~/pages/Search';
import config from '~/config';
import { HeaderOnly } from '~/layouts';
import MyMusic from '~/pages/musics/MyMusic';
import GenresMusic from '~/pages/musics/genres';
import Website from '~/pages/websites/Website';
import Economic from '~/pages/Economic';
import Register from '~/pages/Register';
import Login from '~/pages/Login';
import CinemaSearch from '~/pages/CinemaSearch';
import Details from '~/pages/Cinema/details';
import Top100 from '~/pages/musics/top100/Top100';
import Album from '~/pages/musics/album/Album';
import SearchMusic from '~/pages/musics/Search/SearchMusic';
import GenreDetail from '~/pages/musics/genres/genreDetail';
import Artist from '~/pages/musics/Artist';
import NewRelease from '~/pages/musics/NewRelease';
import MyPlaylist from '~/pages/musics/MyPlaylist';
import Procedure from '~/pages/websites/Procedure';
import Price from '~/pages/websites/Price';
import Demo from '~/pages/websites/Demo';

const publicRoutes = [
    // general
    { path: config.routes.home, component: HomeMusic },
    // music
    { path: config.routes.music, component: HomeMusic },
    { path: config.routes.searchMusic, component: SearchMusic },
    { path: config.routes.genresMusic, component: GenresMusic },
    { path: config.routes.genresDetail, component: GenreDetail },
    { path: config.routes.artist, component: Artist },
    { path: config.routes.newRelease, component: NewRelease },
    { path: config.routes.myPlaylist, component: MyPlaylist },

    { path: config.routes.top100, component: Top100 },
    { path: config.routes.albumMusic, component: Album },

    // cinema
    { path: config.routes.cinema, component: Cinema },
    { path: config.routes.cinemaSearch, component: CinemaSearch },
    { path: config.routes.cinemaDetails, component: Details },

    // website
    { path: config.routes.website, component: Website },
    { path: config.routes.economic, component: Economic },
    { path: config.routes.procedure, component: Procedure },
    { path: config.routes.price, component: Price },
    { path: config.routes.demo, component: Demo },
];

const privateRoutes = [{ path: config.routes.myMusic, component: MyMusic }];

const nullLayoutRoutes = [
    { path: config.routes.register, component: Register, layout: null },
    { path: config.routes.login, component: Login, layout: null },
    { path: config.routes.search, component: Search, layout: HeaderOnly },
];
export { publicRoutes, privateRoutes, nullLayoutRoutes };
