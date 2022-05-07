import AgoraRTC from 'agora-rtc-sdk-ng';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
const client = AgoraRTC.createClient({ mode: 'live', codec: 'h264' });
client.setClientRole('host');
const appId = '15cb0d28b87b425ea613fc46f7c9f974';

interface JoinProps {
	username: string;
	channel: string;
	appKey: string;
}

type GetRtctokenParams = JoinProps;

function getRtctoken(params: GetRtctokenParams) {
	// return { accessToken: '', agoraUserId: '' };
	const WebIM: any = {};
	axios.defaults.headers.common['Authorization'] =
		'Bearer ' + WebIM.conn.context.accessToken;
	const { username, channel, appKey } = params;
	//${WebIM.conn.apiUrl} &agoraUserId=12345
	return axios
		.get(
			`${
				WebIM.conn.apiUrl
			}/token/rtcToken/v1?userAccount=${username}&channelName=${channel}&appkey=${encodeURIComponent(
				appKey
			)}`
		)
		.then(function (response) {
			return response.data;
		})
		.catch(function (error) {
			console.log(error);
		});
}

function getConfDetail(params: GetRtctokenParams) {
	return null;
}

export async function join(props: JoinProps) {
	const { username, channel, appKey } = props;
	const params = {
		username: username,
		channel: channel,
		appKey: appKey,
	};
	const { accessToken, agoraUserId } = await getRtctoken(params);

	const uid = await client.join(appId, channel, accessToken, agoraUserId);

	// 通过麦克风采集的音频创建本地音频轨道对象。
	const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
	// 通过摄像头采集的视频创建本地视频轨道对象。
	const localVideoTrack = await AgoraRTC.createCameraVideoTrack();
	// 将这些音视频轨道对象发布到频道中。
	await client.publish([localAudioTrack, localVideoTrack]);
}
