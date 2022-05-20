import AgoraRTC from 'agora-rtc-sdk-ng';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import WebIM from 'easemob-websdk'
import store from '../redux';
import { updateConfr, setCallStatus, CALLSTATUS, setCallDuration, changeWinSize, updateJoinedMembers, setUidToUserId } from '../redux/reducer'
import { sendTextMsg, addListener, cancelCall, sendCMDMsg, sendAlerting } from './message'
import { formatTime } from './utils'

const client = AgoraRTC.createClient({ mode: 'live', codec: 'h264' });
client.setClientRole('host');

class Manager {
	constructor(params) {
		if (params) {
			this.init(params)
		}

		this.client = client
		this.props = {}
		WebIM.rtc = this.rtc = {
			client,
			localAudioTrack: null,
			localVideoTrack: null,
			timer: null
		}
	}

	init(appId, agoraUid, connection) {
		this.appId = appId;
		this.agoraUid = agoraUid;
		WebIM.conn = connection;
		addListener()
	}

	setCallKitProps(props) {
		this.props = props
	}

	changeState(state) {
		this.props.onStateChange && this.props.onStateChange(state)
	}

	setToken(accessToken) {
		this.accessToken = accessToken;
	}

	setUserIdMap(idMap) {
		const { getState, dispatch } = store
		dispatch(setUidToUserId(idMap))
	}

	answerCall(result, accessToken) {
		const { getState, dispatch } = store
		const state = getState()
		const { confr } = state
		console.log('answerCall', result)
		if (result) {
			this.accessToken = accessToken;
			sendAlerting(confr.callerIMName, confr.callerDevId, confr.callId)
		} else {
			const { dispatch } = store
			dispatch(setCallStatus(CALLSTATUS.idle))
		}
	}

	startCall(options) {
		const { getState, dispatch } = store
		const state = getState()

		const { callId, channel, chatType, callType, to, message, groupId, groupName, accessToken } = options;
		this.accessToken = accessToken;

		let confInfo = {
			action: 'invite',
			channelName: channel,
			type: callType, //0为1v1音频，1为1v1视频，2为多人视频 3多人语音
			callerDevId: WebIM.conn.context.jid.clientResource, // 主叫方设备Id
			callId: callId, // 随机uuid，每次呼叫都不同，代表一次呼叫
			ts: Date.now(),
			msgType: 'rtcCallWithAgora',
			callerIMName: WebIM.conn.context.jid.name,
		}

		let msgExt = {
			channelName: channel,
			token: null,
			type: callType,
			callerDevId: WebIM.conn.context.jid.clientResource,
			callId: callId,
			calleeIMName: to,
			callerIMName: WebIM.conn.context.jid.name
		}
		if (chatType === 'groupChat') {
			confInfo.ext = {
				groupId: groupId,
				groupName: groupName
			}
			msgExt.ext = {
				groupId: groupId,
				groupName: groupName
			}
			sendCMDMsg(chatType, to, message, confInfo)
		} else {
			sendTextMsg(chatType, to, message, confInfo)
		}

		dispatch(updateConfr({
			ext: msgExt,
			to: to,
			from: WebIM.conn.context.jid.name
		}))

		dispatch(setCallStatus(CALLSTATUS.inviting))
	}

	async join() {
		const { getState, dispatch } = store
		const state = getState()
		const { confr } = state
		const username = WebIM.conn.context.userId
		console.log('this', this)
		const uid = await client.join(this.appId, confr.channel, this.accessToken, this.agoraUid);

		// 通过麦克风采集的音频创建本地音频轨道对象。
		const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
		this.rtc.localAudioTrack = localAudioTrack
		let config = [localAudioTrack]

		console.log('confr *****', confr)
		if (confr.type === 0 || confr.type === 3) {
			await client.publish(config);
			// rtc.localAudioTrack.play();
		} else {
			// 通过摄像头采集的视频创建本地视频轨道对象。
			const localVideoTrack = await AgoraRTC.createCameraVideoTrack();
			config.push(localVideoTrack)
			this.rtc.localVideoTrack = localVideoTrack;
			await client.publish(config);
			if (confr.type === 2) {
				let videoElm = 'video' + username;

				let joinedMembersCp = [...state.joinedMembers]
				joinedMembersCp.push({ videoElm: videoElm, name: username, type: 'video', value: uid })
				dispatch(updateJoinedMembers(joinedMembersCp))

				let params = {
					username: username,
					channelName: confr.channel,
					appkey: WebIM.conn.appKey
				}

				// TODO 需要设计接口
				// const members = await getConfDetail(params)
				// dispatch(setUidToUserId(members))

				setTimeout(() => {
					localVideoTrack.play(videoElm);
				}, 500)

			} else {
				localVideoTrack.play("local-player");
			}
		}
		this.startTime()
		console.log("publish success! --- ");
	}

	startTime() {
		const { dispatch } = store
		let hour = 0, minute = 0, second = 0;
		this.rtc.intervalTimer && clearInterval(WebIM.rtc.intervalTimer)
		let timerId = setInterval(() => {
			second += 1
			if (second === 60) {
				second = 0
				minute += 1
				if (minute === 60) {
					minute = 0
					hour += 1
					if (hour == 24) {
						hour = 0
					}
				}
			}
			let time = formatTime(hour, minute, second)
			dispatch(setCallDuration(time))
		}, 1000)
		this.rtc.intervalTimer = timerId
	}

	async hangup(reson, isCancel) {
		const { getState, dispatch } = store
		this.rtc.localAudioTrack && this.rtc.localAudioTrack.close();
		this.rtc.localVideoTrack && this.rtc.localVideoTrack.close();
		this.rtc.intervalTimer && clearInterval(this.rtc.intervalTimer)

		const state = getState()
		const { confr } = state
		if (isCancel && confr.callerIMName == WebIM.conn.context.jid.name) {
			cancelCall()
		}

		this.props.onStateChange && this.props.onStateChange({
			type: 'hangup',
			reson: reson,
			callInfo: {
				...state.confr,
				duration: state.callDuration,
				groupId: state.groupId,
				groupName: state.groupName
			}
		})

		this.rtc.client && await this.rtc.client.leave();

		dispatch(setCallStatus(CALLSTATUS.idle))
		dispatch(setCallDuration('00:00'))
		dispatch(changeWinSize('normal'))
		dispatch(updateJoinedMembers([]))
		dispatch(updateConfr({
			to: '',
			ext: {}
		}))
	}
}

export const callManager = new Manager();

export { client, WebIM }

function getRtctoken(params) {
	let agoraId = ''
	const conn = WebIM.conn;
	const appKey = conn.context.appKey
	const username = conn.context.userId
	axios.defaults.headers.common['Authorization'] =
		'Bearer ' + conn.context.accessToken;
	const { channel } = params;
	// const url = `${conn.apiUrl
	// 	}/token/rtcToken/v1?userAccount=${username}&channelName=${channel}&appkey=${encodeURIComponent(
	// 		appKey
	// 	)}`

	const url = `${conn.apiUrl}/token/rtc/channel/${channel}/agorauid/${agoraId}?userAccount=${username}`

	return axios
		.get(url)
		.then(function (response) {
			console.log('getRtctoken', response)
			return response.data;
		})
		.catch(function (error) {
			console.log(error);
		});
}
