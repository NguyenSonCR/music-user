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
import AudioMobile from './layouts/components/AudioMobile';

function App() {
    const songState = useSelector((state) => state.song);
    const viewPort = useViewport();
    const isMobile = viewPort.width < 740;
    let container = document.querySelector('#container');

    return (
        <Router>
            <div className="app" id="container">
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
                {songState.song && isMobile && <AudioMobile container={container} />}
                {<Playlist />}
                <Toast />
                {/* <ChatBot /> */}
            </div>
        </Router>
    );
}

export default App;
