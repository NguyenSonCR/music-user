import Header from '~/layouts/components/Header';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { mounted } from '~/slices/songSlice';

function HeaderOnly({ children }) {
    const songState = useSelector((state) => state.song);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(mounted());
    }, []);
    return (
        <div>
            <Header />
            <div className="container">
                <div className="content">{children}</div>
            </div>
        </div>
    );
}

export default HeaderOnly;
