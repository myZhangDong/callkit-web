import './index.scss';
import Draggable, { DraggableCore } from 'react-draggable';
import Header from './header';
import Main from './main';
import './index.scss';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { useSelector, useDispatch } from 'react-redux';
import classnames from 'classnames';

const client = AgoraRTC.createClient({ mode: 'live', codec: 'h264' });
client.setClientRole('host');

console.log('-----初始化-----');

function Layout() {
	const size = useSelector((state: any) => state.windowSize);
	const cls = classnames('callkit-layout-cantainer', {
		'callkit-layout-large': size === 'large',
	});
	console.log('size', size);
	const Dragga = size === 'large' ? 'div' : Draggable;
	return (
		<Dragga>
			<div className={cls}>
				<Header></Header>
				<Main></Main>
			</div>
		</Dragga>
	);
}

export default Layout;
