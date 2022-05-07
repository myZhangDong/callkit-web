import './index.scss';
import classnames from 'classnames';

export interface IconProps {
	className?: string;
	style?: object;
	children?: string;
	spin?: boolean;
	[key: string]: unknown;
}

function Icon(props: IconProps) {
	const { className, spin, style, children, ...other } = props;
	const cls = classnames(className, {
		'callkit-component-icon': true,
		'icon-spin': !!spin,
	});
	return (
		<i className={cls} style={style} {...other}>
			{children}
		</i>
	);
}

export default Icon;
