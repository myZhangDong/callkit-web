import { createSlice } from '@reduxjs/toolkit';

export const counterSlice = createSlice({
	name: 'call',
	initialState: {
		value: 0,
		windowSize: 'normal',
	},
	reducers: {
		increment: (state) => {
			console.log('state', state);
			state.value += 1;
		},
		decrement: (state) => {
			state.value -= 1;
		},
		incrementByAmount: (state, action) => {
			state.value += action.payload;
		},
		changeWinSize: (state, action) => {
			console.log('action', action);
			state.windowSize = action.payload;
		},
	},
});

export const { increment, decrement, incrementByAmount, changeWinSize } =
	counterSlice.actions;

export default counterSlice.reducer;
