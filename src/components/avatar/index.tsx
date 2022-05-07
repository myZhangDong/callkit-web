import { ReactNode } from 'react';
import './index.scss';
import classnames from 'classnames';
interface AvatarProps {
	src?: string;
	alt?: string;
	children?: ReactNode;
	className?: string;
	[key: string]: any;
}

function Avatar(props: AvatarProps) {
	const { src, alt, className, ...others } = props;
	const cls = classnames('callkit-component-avatar', className);
	return (
		<div className={cls} {...others}>
			<img src={src} alt={alt} draggable={false}></img>
		</div>
	);
}

export default Avatar;
