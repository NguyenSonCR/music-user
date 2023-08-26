import Header from '~/layouts/components/Header';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { mounted } from '~/slices/songSlice';

function HeaderOnly({ children }) {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(mounted());

        // eslint-disable-next-line
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
