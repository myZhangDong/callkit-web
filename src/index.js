import React, { Component } from 'react'
import './style.css'
import './assets/icon/iconfont.css';
import {
  Provider,
} from 'react-redux';
import store from './redux';
import Layout from './layout';
import { callManager } from './modules/callManager'
import { sendTextMsg } from './modules/message'

window.callkit_store = store;
export const CallkitContext = React.createContext()
function Callkit(props) {

  return (
    <Provider store={store}>
      <div>
        <CallkitContext.Provider value={props}>
          <Layout {...props}></Layout>
        </CallkitContext.Provider>
      </div>
    </Provider>
  );
}

Callkit.init = (appId, uid, conn, accessToken) => {
  callManager.init(appId, uid, conn)
  // init(appId, uid, conn, accessToken)
}


// Callkit.join = function (params) {
//   console.log(params)
//   join(params)
// }

Callkit.startCall = function (options) {
  console.log('callVoice options', options)
  // let options = {
  //   callType: 1,
  //   chatType: 'singleChat',
  //   to: 'zd2',
  //   agoraUid: WebIM.conn.agoraUid,
  //   message: '邀请你加入语音',
  // }

  if (options.chatType === 'groupChat' && Array.isArray(options.to)) {
    const callId = WebIM.conn.getUniqueId().toString();
    const channel = options.channel || Math.uuid(8)
    const params = {
      ...options,
      callId,
      channel
    }
    options.to.forEach((userId) => {
      params.to = userId
      // callVoice(params)
      callManager.startCall(params)
    })

    sendTextMsg(options.chatType, options.groupId, options.message, { action: 'invite', type: options.callType, msgType: 'rtcCallWithAgora', callId, channelName: channel, callerDevId: WebIM.conn.context.jid.clientResource, ts: Date.now() })
    return
  }
  const callId = WebIM.conn.getUniqueId().toString();
  // const channel = Math.uuid(8)
  const params = {
    ...options,
    callId,
    // channel
  }
  // callVoice(params)
  callManager.startCall(params)
  return {
    callId
  }
}

Callkit.setToken = function (token) {
  callManager.setToken(token)
}

Callkit.answerCall = function (result, token) {
  callManager.answerCall(result, token)
}

Callkit.setUserIdMap = function (idMap) {
  callManager.setUserIdMap(idMap)
}

Callkit.setCallKitProps = function (props) {
  callManager.setCallKitProps(props)
}

export default Callkit;

