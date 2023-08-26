import { Fragment } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { publicRoutes, privateRoutes, nullLayoutRoutes } from '~/routes';
import { DefaultLayout } from '~/layouts';
import { useSelector } from 'react-redux';
import Audio from '~/layouts/components/Audio';
import Playlist from '~/pages/musics/playlist/Playlist';
import Toast from './layouts/components/Toast';
import ProtectedRoute from '~/routing/ProtectedRoute';
import useViewport from './hooks/useViewport';
import AudioMobile from '~/layouts/components/AudioMobile';
import ModelSong from '~/layouts/components/ModelSong';
import ModelPlaylist from '~/layouts/components/ModelPlaylist';

function App() {
    const songState = useSelector((state) => state.song);
    const viewPort = useViewport();
    const isMobile = viewPort.width < 740;
    let container = document.querySelector('#mydiv');

    return (
        <Router>
            <div className="app" id="mydiv">
                <Routes>
                    <Route>
                        {nullLayoutRoutes.map((route, index) => {
                            let Layout = Fragment;
                            if (route.layout) {
                                Layout = route.layout;
                            }
                            const Page = route.component;
                            return (
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={
                                        <Layout>
                                            <Page />
                                        </Layout>
                                    }
                                ></Route>
                            );
                        })}
                    </Route>

                    <Route element={<DefaultLayout />}>
                        {publicRoutes.map((route, index) => {
                            const Page = route.component;
                            return <Route key={index} path={route.path} element={<Page />}></Route>;
                        })}

                        {privateRoutes.map((route, index) => {
                            const Page = route.component;
                            return (
                                <Route
                                    key={route.path}
                                    path={route.path}
                                    element={
                                        <ProtectedRoute>
                                            <Page />
                                        </ProtectedRoute>
                                    }
                                ></Route>
                            );
                        })}
                    </Route>
                </Routes>

                {songState.song && !isMobile && <Audio container={container} />}
                {songState.song && isMobile && <AudioMobile />}
                {songState.modelSong && <ModelSong />}
                {songState.modelPlaylist && <ModelPlaylist />}
                {<Playlist />}
                <Toast />
            </div>
        </Router>
    );
}

export default App;
