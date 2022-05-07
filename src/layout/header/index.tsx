import './index.scss';
import { useState } from 'react';
import Icon from '../../components/Icon';
import { useSelector, useDispatch } from 'react-redux';
import { changeWinSize } from '../../redux/reducer';

interface HeaderProps {
	onAddPerson?: () => void;
	onZoomWindow?: (size: 'small' | 'full') => void;
	onClose?: () => void;
}
function Header(props: HeaderProps) {
	const dispatch = useDispatch();
	const currentSize = useSelector((state: any) => state.windowSize);
	const onZoomWindow = () => {
		// const size = windowSize === 'small' ? 'full' : 'small';
		const nextSize = currentSize === 'normal' ? 'large' : 'normal';
		dispatch(changeWinSize(nextSize));
		// props.onZoomWindow && props.onZoomWindow(windowSize);
	};

	const onClose = () => {
		props.onClose && props.onClose();
	};

	const onAddPerson = () => {
		props.onAddPerson && props.onAddPerson();
	};

	return (
		<div className="callkit-header-cantainer">
			<span className="callkit-header-name">Video Call</span>
			<div className="callkit-header-contral">
				<span onClick={onAddPerson}>
					<Icon className="iconfont icon-add_person icon-style"></Icon>
				</span>
				<span onClick={onZoomWindow}>
					<Icon className="iconfont icon-a-4_arrows_separation icon-style"></Icon>
				</span>
				<span onClick={onClose}>
					<Icon className="iconfont icon-x icon-style"></Icon>
				</span>
			</div>
		</div>
	);
}

export default Header;
