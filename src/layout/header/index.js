import './index.css';
import React, { useState } from 'react';
import Icon from '../../components/Icon';
import { useSelector, useDispatch } from 'react-redux';
import { changeWinSize } from '../../redux/reducer';


function Header(props) {
	const dispatch = useDispatch();
	const currentSize = useSelector((state) => state.windowSize);
	const confr = useSelector((state) => state.confr)
	const isGroup = confr.type === 2 || confr.type === 3;
	console.log('isGroup', isGroup, currentSize)
	const onZoomWindow = () => {
		// const size = windowSize === 'small' ? 'full' : 'small';
		const nextSize = currentSize === 'normal' ? 'large' : 'normal';
		dispatch(changeWinSize(nextSize));
		// props.onZoomWindow && props.onZoomWindow(windowSize);
	};

	const handleClose = () => {
		dispatch(changeWinSize('mini'));
	};

	const onAddPerson = () => {
		props.onAddPerson && props.onAddPerson();
	};

	const headTitle = confr.type === 0 || confr.type === 3 ? 'Audio Call' : 'Video Call'

	return (
		<div className="callkit-header-cantainer">
			<span className="callkit-header-name">{headTitle}</span>
			<div className="callkit-header-contral">
				{isGroup && <span onClick={onAddPerson}>
					<Icon className="iconfont icon-add_person icon-style"></Icon>
				</span>}
				{
					currentSize === 'normal' ? <span onClick={onZoomWindow}>
						<Icon className="iconfont icon-a-4_arrows_separation icon-style"></Icon>
					</span> : (currentSize === 'large' ? <span onClick={onZoomWindow}>
						<Icon className="iconfont icon-a-4_arrows_gathering icon-style"></Icon>
					</span> : null)
				}
				<span onClick={handleClose}>
					<Icon className="iconfont icon-x icon-style"></Icon>
				</span>
			</div>
		</div>
	);
}

export default Header;
