import styles from './NewPlaylistModel.module.scss';
import classNames from 'classnames/bind';
import Model from '~/components/Model/Model';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import musicApi from '~/api/music/musicApi';
import { addMyPlaylist } from '~/slices/songSlice';
import { addToast } from '~/slices/toastSlice';
import routes from '~/config/routes';
import Button from '~/components/Button/Button';

const cx = classNames.bind(styles);
function NewPlaylistModel({ setModel, myMusic }) {
    const authState = useSelector((state) => state.auth);
    const toastState = useSelector((state) => state.toast);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formValue, setFormValue] = useState({
        name: '',
    });

    const { name } = formValue;
    const onChangeName = (event) => {
        setFormValue({ name: event.target.value });
    };

    const handleAddNewPlaylist = async () => {
        if (!authState.isAuthenticated) navigate(routes.login);
        try {
            const response = await musicApi.addPlaylist({
                ...formValue,
                username: authState.user.username,
            });
            if (response.success) {
                dispatch(addMyPlaylist(response.playlist));
                setModel(false);
                setFormValue({
                    name: '',
                });
                dispatch(
                    addToast({
                        id: toastState.toastList.length + 1,
                        content: response.message,
                        type: 'success',
                    }),
                );
            } else {
                console.log(response.message);
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Model setModel={setModel} myMusic={myMusic}>
            <div className={cx('model-content')}>
                <p>Tạo playlist mới</p>
                <input
                    autoComplete="off"
                    name="playlist"
                    type={'text'}
                    placeholder="Nhập tên playlist"
                    spellCheck={false}
                    value={name}
                    className={cx('model-input')}
                    onChange={onChangeName}
                ></input>
                <Button type="text" primary onClick={() => handleAddNewPlaylist()}>
                    Tạo mới
                </Button>
            </div>
        </Model>
    );
}

export default NewPlaylistModel;
