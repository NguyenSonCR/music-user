import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    song: null,
    link: {
        link: null,
        songId: null,
    },
    songLyric: {
        lyric: null,
        songId: null,
        noLyric: null,
    },
    isPlay: false,
    volume: 0.5,
    muted: false,
    loop: false,
    random: false,
    mounted: false,
    top100: null,
    album: null,
    albumPlaying: null,
    searchResult: null,
    playlist: false,
    homeMusic: null,
    genres: null,
    genresDetail: null,
    lyricPage: false,
    vipSong: false,
    myPlaylist: {
        album: [],
        loading: true,
    },
    singleMyPlaylist: null,
    popup: false,
};

export const songSlice = createSlice({
    name: 'song',
    initialState,
    reducers: {
        loadSong: (state, action) => {
            state.song = action.payload;
            state.mounted = true;
        },
        setLink: (state, action) => {
            state.link = {
                link: action.payload.link,
                songId: action.payload.songId,
            };
        },

        setSongLyric: (state, action) => {
            state.songLyric = {
                lyric: action.payload.lyric,
                songId: action.payload.songId,
            };
        },
        setLyricPage: (state, action) => {
            state.lyricPage = action.payload;
        },
        play: (state) => {
            state.isPlay = true;
        },
        pause: (state) => {
            state.isPlay = false;
        },
        duration: (state, action) => {
            state.duration = action.payload;
        },
        volume: (state, action) => {
            state.volume = action.payload;
        },
        muted: (state, action) => {
            state.muted = action.payload;
        },

        loop: (state, action) => {
            state.loop = action.payload;
        },
        random: (state, action) => {
            state.random = action.payload;
        },
        mounted: (state) => {
            state.mounted = false;
        },

        setTop100: (state, action) => {
            state.top100 = action.payload;
        },
        setAlbum: (state, action) => {
            state.album = action.payload;
        },

        setAlbumPlaying: (state, action) => {
            state.albumPlaying = action.payload;
        },
        setSearchResult: (state, action) => {
            state.searchResult = action.payload;
        },
        setPlaylist: (state, action) => {
            state.playlist = action.payload;
        },

        setHomeMusic: (state, action) => {
            state.homeMusic = action.payload;
        },
        setGenres: (state, action) => {
            state.genres = action.payload;
        },
        setGenresDetail: (state, action) => {
            state.genresDetail = action.payload;
        },
        setVipSong: (state, action) => {
            state.vipSong = action.payload;
        },

        setMyPlaylist: (state, action) => {
            state.myPlaylist.album = action.payload;
            state.myPlaylist.loading = false;
        },

        setSingleMyPlaylist: (state, action) => {
            state.singleMyPlaylist = action.payload;
        },

        addMyPlaylist: (state, action) => {
            state.myPlaylist.album = state.myPlaylist.album.concat(action.payload);
        },

        addSongPlaylist: (state, action) => {
            state.myPlaylist.album = state.myPlaylist.album.map((item) => {
                if (item._id === action.payload.playlistId) {
                    if (
                        item.song.length > 0 &&
                        item.song.find((songPlaylist) => songPlaylist.encodeId === action.payload.song.encodeId)
                    ) {
                        return {
                            ...item,
                            song: item.song,
                        };
                    } else {
                        return {
                            ...item,
                            song: item.song.concat(action.payload.song),
                        };
                    }
                } else {
                    return item;
                }
            });
        },

        deleteSongMyPlaylist: (state, action) => {
            state.singleMyPlaylist = {
                ...state.singleMyPlaylist,
                song: state.singleMyPlaylist.song.filter((item) => item.encodeId !== action.payload.song.encodeId),
            };
            state.myPlaylist.album = state.myPlaylist.album.map((item) => {
                if (item.slug === action.payload.slug) {
                    return {
                        ...item,
                        song: item.song.filter((item) => item.encodeId !== action.payload.song.encodeId),
                    };
                } else {
                    return item;
                }
            });
        },

        setPopup: (state, action) => {
            state.popup = action.payload;
        },
        deletePlaylist: (state, action) => {
            state.myPlaylist.album = state.myPlaylist.album.filter((item) => item.slug !== action.payload);
        },
    },
});

export const {
    play,
    setLink,
    pause,
    loadSong,
    duration,
    volume,
    muted,
    loop,
    random,
    mounted,
    setTop100,
    setAlbum,
    setAlbumPlaying,
    setSearchResult,
    setPlaylist,
    setHomeMusic,
    setSongLyric,
    setGenres,
    setGenresDetail,
    setLyricPage,
    setVipSong,
    setMyPlaylist,
    addMyPlaylist,
    setPopup,
    deletePlaylist,
    addSongPlaylist,
    setSingleMyPlaylist,
    deleteSongMyPlaylist,
} = songSlice.actions;

export default songSlice.reducer;
