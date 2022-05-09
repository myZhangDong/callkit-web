import websdk from 'easemob-websdk';

let WebIM = window.WebIM || {};

WebIM.conn = new websdk.connection({ appKey: '41117440#383391' });

WebIM.conn.addEventHandler('connect', {
    onOpened: () => {
        console.log('login success')
    },
    onTextMessage: (msg) => {
        console.log('received message', msg)
    }
})

export default WebIM