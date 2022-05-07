import SingleCall from '../../modules/singleCall';
import GroupCall from '../../modules/groupCall';
import './index.scss';
function Main() {
	return (
		<div className="callkit-main-cantainer">
			{/* <SingleCall style={{ marginTop: '96px' }}></SingleCall> */}

			<GroupCall></GroupCall>
		</div>
	);
}

export default Main;
