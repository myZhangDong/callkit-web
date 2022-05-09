import './index.css';
import Avatar from '../../components/avatar';
import React, { useState, useEffect, memo, useContext } from 'react';

import head from '../../assets/images/head.jpg';
import classnames from 'classnames';
import Icon from '../../components/Icon';
import Button from '../../components/button';
import { useSelector, useDispatch } from 'react-redux';
import { updateConfr, setCallStatus, CALLSTATUS, updateJoinedMembers, setUidToUserId } from '../../redux/reducer'
import { answerCall } from '../message'
import { close, WebIM, client, join, getConfDetail } from '../conf'
import store from '../../redux';
import { CallkitContext } from '../../index'
function VideoCall(props) {
	const { text, className, id } = props;
	const cls = classnames(className, {
		'callkit-group-video-box-4': true
	})
	return (
		<div className={cls} id={id}>
			<span className='callkit-group-video-name'>{text}</span>
		</div>
	);
}

function AudioCall(props) {
	const { active, text, mute } = props;
	const cls = classnames({
		'callkit-group-audio-avatar': true,
		'callkit-group-audio-active': active,
	});

	const iconClass = classnames({
		iconfont: true,
		'icon-mic_slash': true,
		'callkit-group-audio-icon': true,
		'display-none': !mute,
	});
	return (
		<div className="callkit-group-audio-container">
			<Avatar src={head} alt="name" className={cls}></Avatar>
			<Icon className={iconClass}></Icon>
			<div className="callkit-group-audio-username">
				{text}
			</div>
		</div>
	);
}

function GroupCall(props) {
	const CallkitProps = useContext(CallkitContext);
	const [isMute, setMute] = useState(false)
	const [isCloseCamera, setCamera] = useState(false)
	const [isTalking, setTalkings] = useState([])
	const state = useSelector(state => state)
	const uid2userids = useSelector(state => state.uid2userId)
	const dispatch = useDispatch();
	const username = WebIM.conn.context.userId
	function getControls() {
		if (state.confr.type === 3) {
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

	async function addListener() {
		WebIM.rtc.client.on("user-published", async (user, mediaType) => {
			console.log('有远端画面 -------- ')
			CallkitProps.onStateChange && CallkitProps.onStateChange(user, mediaType)
			console.log(user, mediaType) // user - {uid: 1232}
			// 开始订阅远端用户。
			if (uid2userids[user.uid]) {
				user.uid2userid = uid2userids[user.uid] // user.uid2userid - im user id
			} else {
				const members = await getConfDetail()
				dispatch(setUidToUserId(members))

				user.uid2userid = members[user.uid]
			}
			await WebIM.rtc.client.subscribe(user, mediaType);

			let videoElm = ''
			// let exist = false;

			// joinedMembers.forEach((item, index) => {
			// 	if (item.name === user.uid2userid) {
			// 		exist = true
			// 	}
			// })

			let joined = {}
			// if (!exist) {
			// let joinedMembersCp = [...joinedMembers]
			joined = {
				name: user.uid2userid,
				videoElm: 'video' + user.uid2userid,
				type: mediaType,
				value: user.uid,
				action: 'add'
			}
			videoElm = 'video' + user.uid2userid;

			// joinedMembersCp.push(joined)
			dispatch(updateJoinedMembers(joined))
			// }

			// 表示本次订阅的是视频。
			if (mediaType === "video") {
				// 订阅完成后，从 `user` 中获取远端视频轨道对象。
				const remoteVideoTrack = user.videoTrack;
				// 也可以只传入该 DIV 节点的 ID。
				// let videoBox = videoElm ? videoElm : joinedMembers.filter((item) => (item.name == user.uid2userid))[0].videoElm
				setTimeout(() => {
					remoteVideoTrack.play(videoElm);
				}, 500)
			}

			// 表示本次订阅的是音频。
			if (mediaType === "audio") {
				// 订阅完成后，从 `user` 中获取远端音频轨道对象。
				const remoteAudioTrack = user.audioTrack;
				// 播放音频因为不会有画面，不需要提供 DOM 元素的信息。
				remoteAudioTrack.play();
			}
		});

		// 监听远端取消发布
		WebIM.rtc.client.on("user-unpublished", (user, mediaType) => {
			console.log('取消发布了')
			CallkitProps.onStateChange && CallkitProps.onStateChange({
				type: "user-unpublished",
				user,
				mediaType
			})
		});

		WebIM.rtc.client.on("user-left", (user, mediaType) => {
			CallkitProps.onStateChange && CallkitProps.onStateChange({
				type: "user-left",
				user,
				mediaType
			})
			let state = store.getState()
			console.log('-- 对方已离开 ---', user, [...state.joinedMembers])

			let joinCurrent = state.joinedMembers.filter((item) => {
				return item.name !== user.uid2userid
			});
			dispatch(updateJoinedMembers(joinCurrent))

			if (state.joinedMembers.length < 2) {
				console.log('挂断前', state.joinedMembers, joinCurrent)
				hangup()
			}
		})

		WebIM.rtc.client.enableAudioVolumeIndicator();
		WebIM.rtc.client.on("volume-indicator", (result) => {
			let isTalkingCp = [...isTalking]
			result.forEach((volume, index) => {
				console.log(`**** ${index} UID ${volume.uid} Level ${volume.level} ***`);
				let userId = uid2userids[volume.uid] // userId - im user id
				if (!userId) return;
				if (volume.level > 1 && !isTalkingCp.includes(userId)) {
					isTalkingCp.push(userId)
				} else {
					if (volume.level < 1 && isTalkingCp.includes(userId)) {
						let i = isTalkingCp.indexOf(userId)
						isTalkingCp.splice(i, 1)
					}
				}
			});
			console.log('isTalkingCp +++', isTalkingCp)
			setTalkings(isTalkingCp)
		});
	}

	useEffect(() => {
		addListener()
		return () => {
			WebIM.rtc.client.removeAllListeners()
		}
	}, [])


	const joinConfr = async () => {
		await join({ channel: state.confr.channel, callType: state.confr.type })
		const members = await getConfDetail()
		console.log('joinConfr +++', members) // {12312: zd1}
		dispatch(setUidToUserId(members))
	}

	useEffect(() => {
		if (state.callStatus === CALLSTATUS.confirmRing || state.callStatus === CALLSTATUS.answerCall) {
			joinConfr()
		}
		console.log('state.callStatus ++', state.callStatus)
	}, [state.callStatus])


	const hangup = () => {
		close()
		dispatch(setCallStatus(CALLSTATUS.idle))
	}

	const accept = () => {
		answerCall('accept')
		dispatch(setCallStatus(CALLSTATUS.answerCall)) // 5

		clearTimeout(WebIM.rtc.timer)
	}

	const refuse = () => {
		answerCall('refuse') // 
		if (state.callStatus < 7) { //拒接
			close()
			dispatch(setCallStatus(CALLSTATUS.idle))
		}

		clearTimeout(WebIM.rtc.timer)
	}

	const swichMic = () => {
		if (state.callStatus < 3) return
		setMute((isMute) => !isMute)
		WebIM.rtc.localAudioTrack.setEnabled(isMute)
	}

	const swichCamera = () => {
		if (state.callStatus < 3) return
		setCamera((isCloseCamera) => !isCloseCamera)
		let status = isCloseCamera ? true : false
		WebIM.rtc.localVideoTrack.setEnabled && WebIM.rtc.localVideoTrack.setEnabled(status)
	}


	const showAvatar = [0, 1, 3, 6, 7].includes(state.callStatus) ? false : true

	const callType = state.confr.type === 3 ? 'Audio Call' : 'Video Call'
	const containerCls = classnames({
		'callkit-groupCall-container': true,
		'callkit-group-flex-start': state.joinedMembers.length > 6,
		'callkit-group-container-video': state.confr.type === 2
	})
	console.log('joinedMembers +++++', state.joinedMembers)
	return (
		<div className={containerCls}>

			{showAvatar && <div className='callkit-group-avatar'>
				<Avatar src={head} alt="name" style={{ zIndex: 9 }}></Avatar>
				<div className="callkit-singleCall-username">{state.groupName}</div>
				<div className="callkit-singleCall-title">{callType}</div>
			</div>}

			{
				state.confr.type === 3 && state.joinedMembers.map((item) => {
					let talking = isTalking.includes(item.name)
					return <AudioCall key={item.name} active={talking} text={item.name}></AudioCall>
				})
			}

			{
				state.confr.type === 2 && state.joinedMembers.map((item) => {
					let className = ''
					if (state.joinedMembers.length === 2) {
						if (item.name === username) {
							className = 'callkit-group-video-2-self'
						} else {
							className = 'callkit-group-video-2-target'
						}
					}
					return <VideoCall key={item.name} text={item.name} id={'video' + item.name} className={className}></VideoCall>
				})
			}

			<div className="callkit-group-control">
				{getControls()}
			</div>
		</div>
	);
}

export default memo(GroupCall);