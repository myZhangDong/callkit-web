import AgoraRTC from 'agora-rtc-sdk-ng';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import WebIM from 'easemob-websdk'
import store from '../redux';
import { updateConfr, setCallStatus, CALLSTATUS, setCallDuration, changeWinSize, updateJoinedMembers, setUidToUserId } from '../redux/reducer'
import { sendTextMsg, addListener, cancelCall } from './message'
import { formatTime } from './utils'

const client = AgoraRTC.createClient({ mode: 'live', codec: 'h264' });
client.setClientRole('host');


let appId = '15cb0d28b87b425ea613fc46f7c9f974';
let agoraId = ''
const rtc = {
	client,
	timer: null
}

WebIM.rtc = rtc


export { client, WebIM }
function getRtctoken(params) {
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

export async function join(props, callType) {
	const { channel } = props;
	const username = WebIM.conn.context.userId
	const params = {
		channel: channel,
	};
	const { accessToken } = await getRtctoken(params);

	const uid = await client.join(appId, channel, accessToken, agoraId);

	// 通过麦克风采集的音频创建本地音频轨道对象。
	const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
	rtc.localAudioTrack = localAudioTrack
	let config = [localAudioTrack]

	const { getState, dispatch } = store
	const state = getState()
	const { confr } = state
	console.log('confr *****', confr)
	if (confr.type === 0 || confr.type === 3) {
		await client.publish(config);
		// rtc.localAudioTrack.play();
	} else {
		// 通过摄像头采集的视频创建本地视频轨道对象。
		const localVideoTrack = await AgoraRTC.createCameraVideoTrack();
		config.push(localVideoTrack)
		rtc.localVideoTrack = localVideoTrack;
		await client.publish(config);
		if (confr.type === 2) {
			let videoElm = 'video' + username;

			let joinedMembersCp = [...state.joinedMembers]
			joinedMembersCp.push({ videoElm: videoElm, name: username, type: 'video', value: uid })
			dispatch(updateJoinedMembers(joinedMembersCp))

			let params = {
				username: username,
				channelName: state.confr.channel,
				appkey: WebIM.conn.appKey
			}

			const members = await getConfDetail(params)
			dispatch(setUidToUserId(members))

			setTimeout(() => {
				localVideoTrack.play(videoElm);
			}, 500)

		} else {
			localVideoTrack.play("local-player");
		}
	}
	startTime()
	console.log("publish success! --- ");
}

export function startTime() {
	const { dispatch } = store
	let hour = 0, minute = 0, second = 0;
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
	WebIM.rtc.intervalTimer = timerId
}

export async function close() {
	console.log('click hangup')
	// 销毁本地音视频轨道。
	rtc.localAudioTrack && rtc.localAudioTrack.close();
	rtc.localVideoTrack && rtc.localVideoTrack.close();
	WebIM.rtc.intervalTimer && clearInterval(WebIM.rtc.intervalTimer)
	const { getState, dispatch } = store
	const state = getState()
	const { confr } = state
	console.log(confr, WebIM.conn.context.jid.name)
	if (confr.callerIMName == WebIM.conn.context.jid.name) {
		cancelCall()
	}
	// 离开频道。
	await rtc.client.leave();

	dispatch(setCallStatus(CALLSTATUS.idle))
	dispatch(setCallDuration('00:00'))
	dispatch(changeWinSize('normal'))
	dispatch(updateJoinedMembers([]))
	// dispatch(resetAll())
	// dispatch(setInvitedMembers([]))
	dispatch(updateConfr({
		to: '',
		ext: {}
	}))
}

export const callVoice = (options) => {
	const { getState, dispatch } = store
	const state = getState()
	const { conf, callStatus } = state

	// if (callStatus > 0 && ) {
	// 	throw Error('you are in calling')
	// }
	// let options = {
	//   callType: 1,
	//   chatType: 'singleChat',
	//   to: 'zd2',
	//   agoraUid: WebIM.conn.agoraUid,
	//   message: '邀请你加入语音',
	// }

	const { callId, channel, chatType, callType, to, message, groupId, groupName, agoraUid } = options;

	agoraId = agoraUid
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
	}
	sendTextMsg(chatType, to, message, confInfo)

	dispatch(updateConfr({
		ext: msgExt,
		to: to,
		from: WebIM.conn.context.jid.name
	}))

	dispatch(setCallStatus(CALLSTATUS.inviting))

}

export const hangup = () => {
	const { getState, dispatch } = store
	rtc.localAudioTrack && rtc.localAudioTrack.close();
	rtc.localVideoTrack && rtc.localVideoTrack.close();
	rtc.client && rtc.client.leave();

	dispatch(setCallStatus(CALLSTATUS.idle))
	dispatch(setCallDuration('00:00'))
	dispatch(changeWinSize('normal'))
	dispatch(updateJoinedMembers([]))
	// dispatch(resetAll())
	// dispatch(setInvitedMembers([]))
	dispatch(updateConfr({
		to: '',
		ext: {}
	}))
}

export const init = (appId, uid, conn) => {
	appId = appId
	agoraId = uid
	WebIM.conn = conn
	addListener()
}

export const getConfDetail = (params2) => {
	axios.defaults.headers.common['Authorization'] = 'Bearer ' + WebIM.conn.context.accessToken;

	const { getState, dispatch } = store
	const state = getState()
	const { confr } = state
	console.log(confr, WebIM.conn.context.jid.name)
	let params = {
		username: WebIM.conn.context.jid.name,
		channelName: state.confr.channel,
		appkey: WebIM.conn.appKey
	}

	let { username, channelName, appkey } = params
	// const url = `${WebIM.conn.apiUrl}/channel/mapper?userAccount=${username}&channelName=${channelName}&appkey=${encodeURIComponent(appkey)}`

	const url = `${WebIM.conn.apiUrl}/agora/channel/mapper?channelName=${channelName}&userAccount=${username}`

	return axios.get(url)
		.then(function (response) {
			let members = response.data.result
			return members
		})
		.catch(function (error) {
			console.log(error);
		});
}


function countdown() {
	rtc.timer = setTimeout(() => {
		if (selectTab === 'contact') {
			this.props.cancelCall(to)
			this.props.hangup()
		}
	}, 30000)
}


