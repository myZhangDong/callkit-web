import './App.css';
import Layout from './layout';
import './assets/icon/iconfont.css';
import {
	Provider,
	createStoreHook,
	createDispatchHook,
	createSelectorHook,
} from 'react-redux';
import React from 'react';
import store from './redux';

// const MyContext = React.createContext({ a: '11' });

// // Export your custom hooks if you wish to use them in other files.
// export const useStore = createStoreHook(MyContext, '1s');
// export const useDispatch = createDispatchHook(MyContext);
// export const useSelector = createSelectorHook(MyContext);

interface CallkitProps {
	token: string;
	channel: string;
	appId: string;
}
function Callkit(props: CallkitProps) {
	return (
		<Provider store={store}>
			<div className="App">
				{/* <header className="App-header">123</header> */}
				<Layout></Layout>
			</div>
		</Provider>
	);
}

Callkit.join = async () => {
	return null;
};

export default Callkit;
