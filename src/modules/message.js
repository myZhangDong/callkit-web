import { WebIM, hangup, close, callManager } from './callManager'
import './utils'
import store from '../redux';
import { updateConfr, setCallStatus, CALLSTATUS } from '../redux/reducer'
// WebIM.rtc.timer = null
// let timer = null
const manager = {}

export const sendTextMsg = (chatType, to, message, ext) => {
    let option = {
        chatType: chatType,
        type: "txt",
        to: to,
        msg: message,
        ext: ext
    };

    let msg = WebIM.message.create(option);
    console.log("sendTextMsg", msg);
    WebIM.conn.send(msg);

    if (ext.type === 0 || ext.type === 1) {
        const { dispatch } = store
        WebIM.rtc.timer = setTimeout(() => {
            console.log('主叫 定时器到期')
            callManager.hangup('timeout', true)
            dispatch(setCallStatus(CALLSTATUS.idle))
        }, 30000)
        console.log('设置定时器')
    }
}

export const sendCMDMsg = (chatType, to, message, ext) => {
    var id = WebIM.conn.getUniqueId();            //生成本地消息id
    var msg = new WebIM.message('cmd', id); //创建命令消息
    msg.set({
        to: to,
        action: 'rtcCall',
        ext: ext,
        success: function (id, serverMsgId) {
            dispatch(setCallStatus(CALLSTATUS.alerting))
        },
        fail: function (e) {
            console.log("Fail");
        }
    });

    console.log('被叫发出的alert: ', msg.body)
    WebIM.conn.send(msg.body);
}

// callee
export const sendAlerting = (to, calleeDevId, callId) => {
    console.log('sendAlerting', to, calleeDevId, callId)
    const { getState, dispatch } = store
    var id = WebIM.conn.getUniqueId();            //生成本地消息id
    var msg = new WebIM.message('cmd', id); //创建命令消息
    msg.set({
        to: to,
        action: 'rtcCall',
        ext: {
            action: 'alert',
            calleeDevId: WebIM.conn.context.jid.clientResource,
            callerDevId: calleeDevId,
            callId: callId,
            ts: Date.now(),
            msgType: 'rtcCallWithAgora'
        },
        success: function (id, serverMsgId) {
            dispatch(setCallStatus(CALLSTATUS.alerting))
        },
        fail: function (e) {
            console.log("Fail");
        }
    });

    console.log('被叫发出的alert: ', msg.body)
    WebIM.conn.send(msg.body);
    WebIM.rtc.timer = setTimeout(() => {
        console.log('被叫 定时器到期')
        callManager.hangup('timeout')
        dispatch(setCallStatus(CALLSTATUS.idle))
    }, 30000)
    console.log('设置定时器')
}

// caller
const confirmRing = (to, calleeDevId, callerDevId, callId) => {
    console.log('confirmRing')
    const { getState, dispatch } = store
    let confr = getState().confr
    let currentCallId = confr.callId
    let status = true
    console.log('confirmRing confr', confr)
    if (callId !== currentCallId) {
        console.warn('callId 不相同', callId, currentCallId)
        status = false
    }

    if (getState().callStatus > 4 && confr.type != 2) { //已经在通话中
        console.log('已经在通话中', confr)
        status = false
    }
    // if (confr.calleeDevId && confr.calleeDevId != calleeDevId){
    // 	console.warn('calleeDevId 不相同')
    // 	status = false
    // }

    if (callerDevId !== WebIM.conn.context.jid.clientResource) {
        console.warn('callerDevId 设备不相同')
        return
    }

    var id = WebIM.conn.getUniqueId();            //生成本地消息id
    var msg = new WebIM.message('cmd', id); //创建命令消息
    msg.set({
        to: to,
        action: 'rtcCall',
        ext: {
            action: 'confirmRing',
            status: status, // TRUE为有效，FALSE为无效（miss）
            callerDevId: WebIM.conn.context.jid.clientResource,
            calleeDevId: calleeDevId,
            callId: callId,
            ts: Date.now(),
            msgType: 'rtcCallWithAgora'
        },
        success: function (id, serverMsgId) {
            if (status) {
                dispatch(setCallStatus(CALLSTATUS.confirmRing))
            }
        },
        fail: function (e) {
            console.log("Fail");
        }
    });
    console.log('发送confirmRing', msg)
    WebIM.conn.send(msg.body);
}

// callee
export const answerCall = (result, info) => {
    console.log('send answerCall')
    const { getState, dispatch } = store
    info = info || {}
    console.log(getState().confr, 'confr')
    var id = WebIM.conn.getUniqueId();            //生成本地消息id
    var msg = new WebIM.message('cmd', id); //创建命令消息
    let currentCallId = info.currentCallId || getState().confr.callId
    let callerDevId = info.callerDevId || getState().confr.callerDevId
    let to = info.to || getState().confr.callerIMName
    msg.set({
        to: to,
        action: 'rtcCall',
        ext: {
            action: 'answerCall',
            result: result, // busy/accept/refuse
            callerDevId: callerDevId,
            calleeDevId: WebIM.conn.context.jid.clientResource,
            callId: currentCallId,
            ts: Date.now(),
            msgType: 'rtcCallWithAgora'
        },
        success: function (id, serverMsgId) {
        },
        fail: function (e) {
            console.log("Fail"); //如禁言、拉黑后发送消息会失败
        }
    });
    console.log('发送answerCall', msg)
    WebIM.conn.send(msg.body);
}

// caller
const confirmCallee = (to, calleeDevId, result) => {
    const { getState, dispatch } = store
    var id = WebIM.conn.getUniqueId();
    var msg = new WebIM.message('cmd', id);

    let confr = getState().confr
    let currentCallId = confr.callId

    if (!confr.calleeDevId && confr.type != 2) {
        dispatch(updateConfr({
            to: confr.confrName,
            ext: {
                channelName: confr.channel,
                token: confr.token,
                type: confr.type,
                callerDevId: confr.callerDevId,
                calleeDevId: calleeDevId,
                callId: confr.callId,
                calleeIMName: confr.calleeIMName,
                callerIMName: confr.callerIMName
            }
        }))
    } else if (confr.calleeDevId != calleeDevId && confr.type != 2) {
        result = 'refuse'
    }

    msg.set({
        to: to,
        action: 'rtcCall',
        ext: {
            action: 'confirmCallee',
            result: result || 'accept', // busy/accept/refuse
            callerDevId: WebIM.conn.context.jid.clientResource,
            calleeDevId: calleeDevId,
            callId: currentCallId,
            ts: Date.now(),
            msgType: 'rtcCallWithAgora'
        },
        success: function (id, serverMsgId) {
            if (result == 'accept') {
                dispatch(setCallStatus(CALLSTATUS.confirmCallee))
            }
        },
        fail: function (e) {
            console.log("Fail")
        }
    });
    console.log('发送confirmCallee', msg)
    WebIM.conn.send(msg.body);
}

export const cancelCall = (to) => {
    console.log('cancelCall', to)
    const { getState, dispatch } = store
    var id = WebIM.conn.getUniqueId();
    var msg = new WebIM.message('cmd', id);
    let callerDevId = getState().confr.callerDevId
    let user = to || getState().confr.calleeIMName
    let currentCallId = getState().confr.callId
    if (!user) {
        console.log('-- to is undefined --')
        return
    }
    msg.set({
        to: user,
        action: 'rtcCall',
        ext: {
            action: 'cancelCall',
            callerDevId: callerDevId,
            callId: currentCallId,
            ts: Date.now(),
            msgType: 'rtcCallWithAgora'
        },
        success: function (id, serverMsgId) {
            //dispatch(setCallStatus(CALLSTATUS.idle))
        },
        fail: function (e) {
            console.log("Fail");
        }
    });
    console.log('发送取消消息', msg)
    WebIM.conn.send(msg.body);
}

export const addListener = () => {
    const { getState, dispatch } = store
    WebIM.conn.addEventHandler('message', {
        onTextMessage: (message) => {
            console.log('收到得消息', message)
            const state = getState()
            const { conf, callStatus } = state
            let { from, to } = message
            if (message.chatType !== 'singleChat') return;
            if (message.ext && message.ext.action === 'invite') {
                if (message.from == WebIM.conn.context.jid.name) {
                    return // 自己在另一端发出的邀请
                }

                if (callStatus > CALLSTATUS.idle) { // 正忙
                    if (message.ext.callId == conf.callId) { // 多人会议中邀请别人
                        // store.dispatch(VideoCallAcctions.sendAlerting(from, message.ext.callerDevId, message.ext.callId)) // 回复alerting消息

                        // sendAlerting(from, message.ext.callerDevId, message.ext.callId)

                        // store.dispatch(VideoCallAcctions.setCallStatus(CALLSTATUS.alerting)) // 更改为alerting状态
                        // 收到邀请回调 onInvite
                        dispatch(setCallStatus(CALLSTATUS.alerting))
                    } else {
                        // return store.dispatch(VideoCallAcctions.answerCall('busy', { callId: message.ext.callId, callerDevId: message.ext.callerDevId, to: from }))
                        answerCall('busy', { callId: message.ext.callId, callerDevId: message.ext.callerDevId, to: from })
                    }
                } else {
                    try {
                        // manager.sendAlerting(from, message.ext.callerDevId, message.ext.callId) // 回复alerting消息
                        dispatch(updateConfr(message))
                        // 收到邀请回调 onInvite
                        dispatch(setCallStatus(CALLSTATUS.alerting))
                    } catch (e) {
                        console.log('shibai', e)
                    }
                }
            }
        },

        onCmdMessage: msg => {
            console.log('onCmdMessage', msg)
            if (msg.action === "rtcCall") {
                if (msg.from === WebIM.conn.context.jid.name) {
                    return // 多端情况， 另一端自己发的消息
                }
                let msgInfo = msg.ext
                let deviceId = '';

                let callerDevId = ''
                let callId = '';
                let callVideo = store.getState();
                switch (msgInfo.action) {
                    case "invite":
                        console.log('收到群组邀请得消息', msg)
                        if (msg.from == WebIM.conn.context.jid.name) {
                            return // 自己在另一端发出的邀请
                        }
                        const state = getState()
                        const { conf, callStatus } = state

                        let { from, to } = msg

                        if (callStatus > CALLSTATUS.idle) { // 正忙
                            console.warn('正忙', callStatus)
                            if (msgInfo.callId == conf.callId) { // 多人会议中邀请别人
                                // sendAlerting(from, msgInfo.callerDevId, msgInfo.callId)
                                // 收到邀请回调 onInvite
                                dispatch(setCallStatus(CALLSTATUS.alerting))
                            } else {
                                answerCall('busy', { callId: msgInfo.callId, callerDevId: msgInfo.callerDevId, to: from })
                            }
                        }

                        // manager.sendAlerting(from, msgInfo.callerDevId, msgInfo.callId) // 回复alerting消息

                        dispatch(updateConfr({
                            from,
                            to,
                            ext: msgInfo
                        }))

                        // 收到邀请回调 onInvite
                        dispatch(setCallStatus(CALLSTATUS.alerting))

                    case "alert":
                        deviceId = msgInfo.calleeDevId
                        callerDevId = msgInfo.callerDevId
                        callId = msgInfo.callId

                        console.log('收到回复的alert', msg)
                        confirmRing(msg.from, deviceId, callerDevId, callId)
                        break;
                    case "confirmRing":
                        console.log('收到confirmRing', msg)
                        if (msgInfo.calleeDevId != WebIM.conn.context.jid.clientResource) {
                            console.log('不是自己设备的confirmRing', msg)
                            // callManager.changeState({
                            //     type: 'other device',
                            //     data: msg
                            // })
                            return // 多端情况另一端的消息
                        }
                        if (!msgInfo.status && callVideo.callStatus < CALLSTATUS.receivedConfirmRing) {
                            console.warn('邀请已失效')
                            dispatch(setCallStatus(CALLSTATUS.idle))
                            callManager.hangup('invitation has expired')
                            return
                        }
                        deviceId = msgInfo.calleeDevId
                        try {
                            dispatch(setCallStatus(CALLSTATUS.receivedConfirmRing))
                            // answerCall(msg.from, deviceId)
                        } catch (e) {
                            console.log('eeee', e)
                        }

                        console.log('清除定时器2')
                        WebIM.rtc.timer && clearTimeout(WebIM.rtc.timer)
                        break;
                    case "answerCall":
                        console.log('收到回复的answerCall', msg)
                        console.log('清除定时器1')
                        WebIM.rtc.timer && clearTimeout(WebIM.rtc.timer)

                        deviceId = msgInfo.calleeDevId

                        if (msgInfo.callerDevId != WebIM.conn.context.jid.clientResource) {
                            console.log('不是自己设备的answerCall', msg)
                            return // 多端情况另一端的消息
                        }
                        if (msgInfo.result !== 'accept') {
                            if (msgInfo.result === 'busy') {
                                console.error('对方正忙')
                            } else if (msgInfo.result === 'refuse') {
                                console.error('对方已拒绝')
                            }

                            if (callVideo.confr.type !== 2) { // 单人情况挂断，多人不挂断
                                confirmCallee(msg.from, deviceId, msgInfo.result)
                                callManager.hangup(msgInfo.result)
                                dispatch(setCallStatus(CALLSTATUS.idle))
                            }
                        } else {
                            confirmCallee(msg.from, deviceId, msgInfo.result)
                        }
                        break;
                    case "confirmCallee":
                        console.log('收到confirmCallee', msg)
                        if (msgInfo.calleeDevId != WebIM.conn.context.jid.clientResource) {
                            if (msg.to == WebIM.conn.context.jid.name) {
                                callManager.hangup('processed on other devices')
                                dispatch(setCallStatus(CALLSTATUS.idle))
                                return console.error('已在其他设备处理')
                            }
                            return
                        }

                        if (msg.ext.result != 'accept' && callVideo.callStatus != 7) {
                            // 不在通话中收到 busy refuse时挂断
                            callManager.hangup('nomal')
                            dispatch(setCallStatus(CALLSTATUS.idle))
                            return
                        }
                        dispatch(setCallStatus(CALLSTATUS.confirmCallee))
                        break;
                    case "cancelCall":
                        console.log('收到cancelCall', msg, callVideo.confr)
                        // if (msgInfo.calleeDevId != WebIM.conn.context.jid.clientResource) {
                        //     console.log('不是自己设备的cancelCall', msg)
                        //     return // 多端情况另一端的消息
                        // }

                        if (msg.from == WebIM.conn.context.jid.name) {
                            return // 多端情况另一端的消息
                        }
                        if (msg.from == callVideo.confr.callerIMName) {
                            callManager.hangup('cancel')
                            dispatch(setCallStatus(CALLSTATUS.idle))
                        }
                        break;
                    default:
                        console.log('unexpected action')
                        break;
                }
            }
        }
    })
}
manager.sendAlerting = sendAlerting
