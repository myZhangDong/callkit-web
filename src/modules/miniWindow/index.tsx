import './index.scss';
import Avatar from '../../components/avatar';
import head from '../../assets/images/head.jpg';
import classnames from 'classnames';

interface MiniWinProps {
	text?: string;
	videoSrc?: string;
	headSrc?: string;
}

function MiniWindow(props: MiniWinProps) {
	const { text, headSrc, videoSrc } = props;
	const cls = classnames('callkit-miniwin-container', {
		'callkit-miniwin-minivideo': !!videoSrc,
	});

	const content = videoSrc ? (
		<>
			<video
				src=""
				id="mini-video"
				className="callkit-miniwin-video"
			></video>
			<div className="callkit-miniwin-video-text">{text}</div>
		</>
	) : (
		<>
			<Avatar
				src={headSrc || head}
				className="callkit-miniwin-avatar"
			></Avatar>
			<span className="callkit-miniwin-text">{text}</span>
		</>
	);
	return <div className={cls}>{content}</div>;
}

export default MiniWindow;
