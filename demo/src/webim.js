import websdk from 'easemob-websdk';
import { getToken, getRtctoken } from './api'
import CallKit, { join } from '../../src/index'

let WebIM = window.WebIM || {};

WebIM.conn = new websdk.connection({ appKey: '41117440#383391' });

WebIM.conn.addEventHandler('connect', {
    onOpened: () => {
        console.log('login success')
    },
    onTextMessage: async (message) => {
        console.log('received message', message)

        if (message.chatType !== 'singleChat') return;
        if (message.ext && message.ext.action === 'invite') {
            const { channelName } = message.ext
            let rtcToken = await getRtctoken({
                channel: channelName,
                agoraId: WebIM.conn.agoraUid,
                username: WebIM.conn.context.userId
            })
            let accessToken = rtcToken.accessToken
            // CallKit.setToken(accessToken)

            CallKit.answerCall(true, accessToken)
        }
    },

    onCmdMessage: async (msg) => {
        if (msg.action === "rtcCall" && msg.ext.action === 'invite') {
            const { channelName } = msg.ext
            let rtcToken = await getRtctoken({
                channel: channelName,
                agoraId: WebIM.conn.agoraUid,
                username: WebIM.conn.context.userId
            })
            let accessToken = rtcToken.accessToken
            // CallKit.setToken(accessToken)
            CallKit.answerCall(true, accessToken)
        }
    }
})

export default WebIM