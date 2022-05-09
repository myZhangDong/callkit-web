import './index.css';
import Avatar from '../../components/avatar';
import head from '../../assets/images/head.jpg';
import classnames from 'classnames';
import React, { useEffect } from 'react';
import Draggable, { DraggableCore } from 'react-draggable';
import { useSelector, useDispatch } from 'react-redux';
import { changeWinSize, CALLSTATUS } from '../../redux/reducer'
import { WebIM } from '../conf'
function MiniWindow(props) {
	const { className } = props;
	const dispatch = useDispatch()
	const state = useSelector(state => state)
	const { callDuration, callStatus, confr } = state
	const isVideo = confr.type === 1;
	const text = callStatus < CALLSTATUS.answerCall ? 'Calling' : callDuration
	const cls = classnames(className, {
		'callkit-miniwin-container': true,
		'callkit-miniwin-minivideo': isVideo,
	});
	let temp
	const handleStart = () => {
		temp = Date.now()
	}

	const handleStop = () => {
		let current = Date.now()
		if (current - temp < 300) {
			dispatch(changeWinSize('normal'))
		}
	}

	useEffect(() => {
		if (confr.type !== 1) return
		if (state.windowSize === 'mini') {
			WebIM.rtc.remoteVideoTrack && WebIM.rtc.remoteVideoTrack.play('mini-player')
		}
		return () => {
			WebIM.rtc.remoteVideoTrack && WebIM.rtc.remoteVideoTrack.play('remote-player')
		}
	}, [state.windowSize])

	const content = isVideo ? (
		<>
			<div
				id="mini-player"
				className="callkit-miniwin-video"
			></div>
			<div className="callkit-miniwin-video-text">{text}</div>
		</>
	) : (
		<>
			<Avatar
				src={head}
				className="callkit-miniwin-avatar"
			></Avatar>
			<span className="callkit-miniwin-text">{text}</span>
		</>
	);

	return <Draggable
		onStart={handleStart}
		onStop={handleStop}>
		<div className={cls}>{content}</div>
	</Draggable>
}

export default MiniWindow;