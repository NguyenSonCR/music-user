import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    code: '',
    history: 0,
    display: true,
};

export const navigateSlice = createSlice({
    name: 'navigateSlice',
    initialState,
    reducers: {
        setCode: (state, action) => {
            state.code = action.payload;
        },

        setHistoryStore: (state, action) => {
            state.history = action.payload;
        },

        setShow: (state, action) => {
            state.display = action.payload;
        },
    },
});

export const { setCode, setHistoryStore, setShow } = navigateSlice.actions;

export default navigateSlice.reducer;
