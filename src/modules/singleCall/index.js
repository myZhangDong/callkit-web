import Avatar from '../../components/avatar';
import Button from '../../components/button';
import Icon from '../../components/Icon';
import './index.css';
import head from '../../assets/images/head.jpg';
import { useEffect, useState } from 'react';
import MiniWindow from '../miniWindow';
import React, { useContext } from 'react';
import { WebIM, client, join, callManager } from '../callManager'
import { useSelector, useDispatch } from 'react-redux';
import { updateConfr, setCallStatus, CALLSTATUS } from '../../redux/reducer'
import { answerCall } from '../message'
import { CallkitContext } from '../../index'
import store from '../../redux';
function VideoCall() {
	const [selfScreenFull, setScreen] = useState(true);
	const swichScreen = () => {
		setScreen(() => {
			return !selfScreenFull;
		});
	};
	return (
		<div className="callkit-single-videobox">
			<div
				id="local-player"
				className={
					selfScreenFull
						? 'callkit-single-video-self'
						: 'callkit-single-video-target'
				}
				onClick={swichScreen}
			></div>
			<div
				id="remote-player"
				className={
					!selfScreenFull
						? 'callkit-single-video-self'
						: 'callkit-single-video-target'
				}
				onClick={swichScreen}
			></div>
			{/* <MiniWindow videoSrc="s" text="04:12"></MiniWindow> */}
		</div>
	);
}
function SingleCall(props) {
	const CallkitProps = useContext(CallkitContext);
	const { style } = props;
	const [isMute, setMute] = useState(false)
	const [isCloseCamera, setCamera] = useState(false)
	const state = useSelector(state => state)
	const dispatch = useDispatch();

	const { client } = callManager
	callManager.setCallKitProps(CallkitProps)
	const addListener = () => {
		client.on("user-published", async (user, mediaType) => {
			console.log('-- 对方发布流 -- ')
			CallkitProps.onStateChange && CallkitProps.onStateChange({
				type: "user-published",
				user,
				mediaType
			})
			// 开始订阅远端用户。
			await client.subscribe(user, mediaType);

			// 表示本次订阅的是视频。
			if (mediaType === "video") {
				// 订阅完成后，从 `user` 中获取远端视频轨道对象。
				const remoteVideoTrack = user.videoTrack;

				// 也可以只传入该 DIV 节点的 ID。
				remoteVideoTrack.play('remote-player');
				WebIM.rtc.remoteVideoTrack = remoteVideoTrack;
			}

			// 表示本次订阅的是音频。
			if (mediaType === "audio") {
				// 订阅完成后，从 `user` 中获取远端音频轨道对象。
				const remoteAudioTrack = user.audioTrack;
				WebIM.rtc.other = user
				// 播放音频因为不会有画面，不需要提供 DOM 元素的信息。
				remoteAudioTrack.play();
			}
		});

		client.on("user-left", (user, mediaType) => {
			console.log('-- 对方已离开 --')
			let state = store.getState()
			CallkitProps.onStateChange && CallkitProps.onStateChange({
				type: "user-left",
				user,
				mediaType
			})
			hangup('user-left')
		})

		client.on("user-unpublished", (user, mediaType) => {
			console.log('取消发布了', user, mediaType)
			CallkitProps.onStateChange && CallkitProps.onStateChange({
				type: "user-unpublished",
				user,
				mediaType
			})
		});
	}

	useEffect(() => {
		addListener()
	}, [])

	useEffect(() => {
		if (state.callStatus === CALLSTATUS.confirmRing || state.callStatus === CALLSTATUS.answerCall) {
			joinConfr()
		}
	}, [state.callStatus])

	const joinConfr = () => {
		console.log('join -----', state.confr.channel)
		// join({ channel: state.confr.channel, callType: state.confr.type })
		callManager.join()
	}

	const hangup = () => {
		let state = store.getState()
		CallkitProps.onStateChange && CallkitProps.onStateChange({
			type: "hangup",
			callInfo: {
				...state.confr,
				duration: state.callDuration,
				groupId: state.groupId,
				groupName: state.groupName
			}
		})

		callManager.hangup('normal', true)
		dispatch(setCallStatus(CALLSTATUS.idle))
	}

	const accept = () => {
		answerCall('accept')
		dispatch(setCallStatus(CALLSTATUS.answerCall)) // 5
		// this.props.getGroupMember(this.props.gid)
		// if (this.props.gid) {
		// 	this.props.listGroupMemberAsync({ groupId: this.props.gid })
		// }
		CallkitProps.onStateChange && CallkitProps.onStateChange({
			type: "accept",
			callInfo: state.confr
		})
		clearTimeout(WebIM.rtc.timer)
	}

	const refuse = () => {
		answerCall('refuse') // 
		if (state.callStatus < 7) { //拒接
			callManager.hangup()
			dispatch(setCallStatus(CALLSTATUS.idle))
		}
		CallkitProps.onStateChange && CallkitProps.onStateChange({
			type: "refuse",
			callInfo: state.confr,
			groupId: state.groupId,
			groupName: state.groupName
		})
		clearTimeout(WebIM.rtc.timer)
	}

	const swichMic = () => {
		if (state.callStatus < 5) return
		setMute((isMute) => !isMute)
		WebIM.rtc.localAudioTrack.setEnabled(isMute)
	}

	const swichCamera = () => {
		if (state.callStatus < 3) return
		setCamera((isCloseCamera) => !isCloseCamera)
		let status = isCloseCamera ? true : false
		WebIM.rtc.localVideoTrack.setEnabled && WebIM.rtc.localVideoTrack.setEnabled(status)
	}

	function getControls() {
		if (state.confr.type === 0) {
			if (state.callStatus === 2 || state.callStatus === 4) {
				// 受邀请方按钮
				return (
					<>
						<Button circle danger onClick={refuse}>
							<Icon className="iconfont icon-phone_down callkit-main-button"></Icon>
						</Button>

						<Button circle right onClick={accept}>
							<Icon className="iconfont icon-phone callkit-main-button"></Icon>
						</Button>
					</>
				)
			} else {
				return (<>
					{
						isMute ? <Button className="callkit-singleCall-slash" circle onClick={swichMic}>
							<Icon className="iconfont icon-mic_slash callkit-main-button"></Icon>
						</Button> : <Button circle onClick={swichMic}>
							<Icon className="iconfont icon-mic callkit-main-button"></Icon>
						</Button>
					}
					<Button circle danger onClick={hangup}>
						<Icon className="iconfont icon-phone_down callkit-main-button"></Icon>
					</Button>
				</>)
			}
		} else {
			if (state.callStatus === 2 || state.callStatus === 4) {
				// 受邀请方按钮
				return (
					<>
						{
							isCloseCamera ? <Button className="callkit-singleCall-slash" circle onClick={swichCamera}>
								<Icon className="iconfont icon-video_slash callkit-main-button"></Icon>
							</Button> : <Button circle onClick={swichCamera}>
								<Icon className="iconfont icon-video callkit-main-button"></Icon>
							</Button>
						}

						<Button circle danger onClick={refuse}>
							<Icon className="iconfont icon-phone_down callkit-main-button"></Icon>
						</Button>

						<Button circle right onClick={accept}>
							<Icon className="iconfont icon-phone callkit-main-button"></Icon>
						</Button>
					</>
				)
			} else {
				return <>
					{
						isCloseCamera ? <Button className="callkit-singleCall-slash" circle onClick={swichCamera}>
							<Icon className="iconfont icon-video_slash callkit-main-button"></Icon>
						</Button> : <Button circle onClick={swichCamera}>
							<Icon className="iconfont icon-video callkit-main-button"></Icon>
						</Button>
					}

					{
						isMute ? <Button circle onClick={swichMic} className="callkit-singleCall-slash">
							<Icon className="iconfont icon-mic_slash callkit-main-button"></Icon>
						</Button> : <Button circle onClick={swichMic}>
							<Icon className="iconfont icon-mic callkit-main-button"></Icon>
						</Button>
					}

					<Button circle danger onClick={hangup}>
						<Icon className="iconfont icon-phone_down callkit-main-button"></Icon>
					</Button>
				</>
			}
		}
	}

	const showAvatar = state.confr.type === 0 ? true : (state.callStatus === 7 ? false : true)
	let callType = state.confr.type === 0 ? 'Audio Call' : 'Video Call'

	let { callerIMName, calleeIMName } = state.confr
	let myName = WebIM.conn.context.jid.name;
	let targetUser = callerIMName == myName ? calleeIMName : callerIMName
	if (state.callStatus > 5 && state.confr.type === 0) {
		callType = state.callDuration
	}
	return (
		<div style={style} className="callkit-singleCall-container">
			{showAvatar && <>
				<Avatar src={head} alt="name" style={{ zIndex: 9 }}></Avatar>
				<div className="callkit-singleCall-username">{targetUser}</div>
				<div className="callkit-singleCall-title">{callType}</div>
			</>}
			{
				callType === 'Video Call' && <VideoCall />
			}
			<div className="callkit-singleCall-control">
				{getControls()}
			</div>
		</div>
	);
}

export default SingleCall;
