import Avatar from '../../components/avatar';
import Button from '../../components/button';
import Icon from '../../components/Icon';
import './index.scss';
import head from '../../assets/images/head.jpg';
import { useState } from 'react';
import MiniWindow from '../miniWindow';

let client: any;

function VideoCall() {
	const [selfScreenFull, setScreen] = useState(true);
	const swichScreen = () => {
		setScreen(() => {
			return !selfScreenFull;
		});
	};
	return (
		<div className="callkit-single-videobox">
			<video
				src=""
				id="self"
				className={
					selfScreenFull
						? 'callkit-single-video-self'
						: 'callkit-single-video-target'
				}
				onClick={swichScreen}
			></video>
			<video
				src=""
				id="target"
				className={
					!selfScreenFull
						? 'callkit-single-video-self'
						: 'callkit-single-video-target'
				}
				onClick={swichScreen}
			></video>
			<MiniWindow videoSrc="s" text="04:12"></MiniWindow>
		</div>
	);
}

function SingleCall(props: any) {
	const { style } = props;
	const callType = 'video';

	const addListener = () => {
		client.on('user-published', async (user: any, mediaType: string) => {
			console.log('-- 对方发布流 -- ');
			// 开始订阅远端用户。
			await client.subscribe(user, mediaType);

			// 表示本次订阅的是视频。
			if (mediaType === 'video') {
				// 订阅完成后，从 `user` 中获取远端视频轨道对象。
				const remoteVideoTrack = user.videoTrack;

				// 也可以只传入该 DIV 节点的 ID。
				remoteVideoTrack.play('remote-player');

				// this.setState({
				// 	localFullRemoteCorner: false,
				// });
			}

			// 表示本次订阅的是音频。
			if (mediaType === 'audio') {
				// 订阅完成后，从 `user` 中获取远端音频轨道对象。
				const remoteAudioTrack = user.audioTrack;
				// other = user;
				// 播放音频因为不会有画面，不需要提供 DOM 元素的信息。
				remoteAudioTrack.play();
			}
		});

		client.on('user-left', () => {
			console.log('-- 对方已离开 --');
			// this.props.close();
		});
	};

	return (
		<div style={style} className="callkit-singleCall-container">
			<Avatar src={head} alt="name">
				niaho
			</Avatar>
			<div className="callkit-singleCall-username">target username</div>
			<div className="callkit-singleCall-title">Audio Call</div>
			<VideoCall></VideoCall>
			<div className="callkit-singleCall-control">
				<Button circle style={{ marginRight: '116px' }}>
					<Icon className="iconfont icon-mic callkit-main-button"></Icon>
				</Button>

				<Button circle className="callkit-main-button-light">
					<Icon className="iconfont icon-mic_slash callkit-main-button"></Icon>
				</Button>

				<Button circle style={{ marginRight: '116px' }}>
					<Icon className="iconfont icon-video callkit-main-button"></Icon>
				</Button>
				<Button circle danger>
					<Icon className="iconfont icon-phone_down callkit-main-button"></Icon>
				</Button>
			</div>
		</div>
	);
}

export default SingleCall;
