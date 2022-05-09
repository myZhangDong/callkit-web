import React, { Component } from 'react'
import './style.css'
import './assets/icon/iconfont.css';
import {
  Provider,
  createStoreHook,
  createDispatchHook,
  createSelectorHook,
} from 'react-redux';
import store from './redux';
import Layout from './layout';
import { join, callVoice, init } from './modules/conf'
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

Callkit.init = (appId, uid, conn) => {
  init(appId, uid, conn)
}


Callkit.join = function (params) {
  console.log(params)
  join(params)
}

Callkit.callVoice = function (options) {
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
    const channel = Math.uuid(8)
    const params = {
      ...options,
      callId,
      channel
    }
    options.to.forEach((userId) => {
      params.to = userId
      callVoice(params)
    })
    return
  }
  const callId = WebIM.conn.getUniqueId().toString();
  const channel = Math.uuid(8)
  const params = {
    ...options,
    callId,
    channel
  }
  callVoice(params)
  return {
    callId,
    channel
  }
}

export default Callkit;

