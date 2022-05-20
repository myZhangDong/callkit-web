import React, { useEffect } from 'react'
import Draggable, { DraggableCore } from 'react-draggable';
import Header from './header';
import Main from './main';
import './index.css';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { useSelector, useDispatch } from 'react-redux';
import classnames from 'classnames';
import { client, WebIM } from '../modules/callManager'
import MiniWindow from '../modules/miniWindow'

console.log('-----初始化-----');

function Layout({ onAddPerson, onStateChange, onInvite }) {
	const confr = useSelector((state) => state.confr);
	const size = useSelector((state) => state.windowSize);
	const callStatus = useSelector((state) => state.callStatus);
	const cls = classnames('callkit-layout-cantainer', {
		'callkit-layout-large': size === 'large',
		'callkit-layout-displaynone': size === 'mini'
	});
	const miniCls = classnames({
		'callkit-layout-displaynone': size !== 'mini'
	})
	const position = size === 'large' ? { x: 0, y: 0 } : null

	const addPerson = () => {
		onAddPerson && onAddPerson()
	}
	console.log('Layout callStatus', callStatus)
	useEffect(() => {
		if (callStatus === 2) {
			console.log('confr ---', confr)
			onInvite && onInvite(confr)
		}
	}, [callStatus])

	return (
		callStatus > 0 ?
			<>
				<Draggable position={position}>
					<div className={cls}>
						<Header onAddPerson={addPerson}></Header>
						<Main></Main>
					</div>
				</Draggable>
				<MiniWindow className={miniCls}></MiniWindow>
			</>
			: null
	);
}

export default Layout;
