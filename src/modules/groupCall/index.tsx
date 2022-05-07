import './index.scss';
import Avatar from '../../components/avatar';
import head from '../../assets/images/head.jpg';
import classnames from 'classnames';
import Icon from '../../components/Icon';
import Button from '../../components/button';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement, incrementByAmount } from '../../redux/reducer';

interface VideoCallProps {
	text?: string;
	headSrc?: string;
	videoSrc?: string;
}
function VideoCall(props: VideoCallProps) {
	const { text } = props;
	return (
		<div className="callkit-group-video-box">
			<video src=""></video>
			<span>{text}</span>
		</div>
	);
}

interface AudioCallProps {
	active?: boolean;
	text?: string;
	mute?: boolean;
}
function AudioCall(props: AudioCallProps) {
	const count = useSelector((state: any) => state.value);
	// console.log('count-----', count);
	const dispatch = useDispatch();

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
		<div
			className="callkit-group-audio-container"
			onClick={() => {
				dispatch(increment);
			}}
		>
			<Avatar src={head} alt="name" className={cls}></Avatar>
			<Icon
				className={iconClass}
				onClick={() => {
					dispatch(increment);
				}}
			></Icon>
			<div
				className="callkit-group-audio-username"
				onClick={() => {
					dispatch(increment());
				}}
			>
				{count}
			</div>
		</div>
	);
}

function GroupCall() {
	return (
		<div className="callkit-groupCall-container">
			{/* <VideoCall></VideoCall>
			<VideoCall></VideoCall> */}
			<AudioCall active text="Nihao"></AudioCall>
			<AudioCall text="Nihao" mute></AudioCall>
			<AudioCall active text="Nihao"></AudioCall>
			<AudioCall text="Nihao"></AudioCall>
			{/* <AudioCall active text="Nihao"></AudioCall>
			<AudioCall text="Nihao"></AudioCall>
			<AudioCall active text="Nihao"></AudioCall>
			<AudioCall text="Nihao"></AudioCall>
			<AudioCall active text="Nihao"></AudioCall>
			<AudioCall text="Nihao"></AudioCall>
			<AudioCall active text="Nihao"></AudioCall>
			<AudioCall text="Nihao"></AudioCall>
			<AudioCall active text="Nihao"></AudioCall>
			<AudioCall text="Nihao"></AudioCall> */}
			<div className="callkit-group-control">
				<Button circle>
					<Icon className="iconfont icon-mic callkit-main-button"></Icon>
				</Button>

				<Button circle className="callkit-main-button-light">
					<Icon className="iconfont icon-mic_slash callkit-main-button"></Icon>
				</Button>

				{/* <Button circle style={{ marginRight: '116px' }}>
					<Icon className="iconfont icon-video callkit-main-button"></Icon>
				</Button> */}
				<Button circle danger>
					<Icon className="iconfont icon-phone_down callkit-main-button"></Icon>
				</Button>
			</div>
		</div>
	);
}

export default GroupCall;
