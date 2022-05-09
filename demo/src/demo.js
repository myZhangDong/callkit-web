import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import CallKit, { join } from '../../src/index'
import WebIM from './webim'
import { getToken } from './api'

function App() {
    const [username, setUsername] = useState('')
    const login = () => {
        getToken(username, 'nickname').then((res) => {
            console.log('getToken', res)
            const { accessToken, agoraUid } = res
            WebIM.conn.agoraUid = agoraUid
            WebIM.conn.open({
                user: username,
                agoraToken: accessToken
            }).then((res) => {
                console.log('登录成功', res)
                let appId = '15cb0d28b87b425ea613fc46f7c9f974';
                CallKit.init(appId, agoraUid, WebIM.conn)
            })
        })
    }

    const joinConf = () => {
        CallKit.join({ channel: '123', connection: WebIM.conn })
    }

    const handleChange = (e) => {
        setUsername(e.target.value)
    }

    const inviteAudioCall = () => {
        let options = {
            callType: 0,
            chatType: 'singleChat',
            to: 'zd2',
            agoraUid: WebIM.conn.agoraUid,
            message: '邀请你加入语音',
        }
        CallKit.callVoice(options)
        // CallKit.callVoice('groupChat', 'zd2', '邀请你加入语音', 'audio', '146188268535809', '群名')
    }

    const inviteVideoCall = () => {
        let options = {
            callType: 2,
            chatType: 'groupChat',
            to: 'zd2',
            agoraUid: WebIM.conn.agoraUid,
            message: '邀请你加入语音',
            groupId: '180889985286145',
            groupName: 'name'
        }
        CallKit.callVoice(options)
        // CallKit.callVoice('singleChat', 'zd2', '邀请你加入语音', 'video')
        // CallKit.callVoice('groupChat', ['zd2', 'zd4'], '邀请你加入语音', 'video', '146188268535809', '群名')
        // CallKit.callVoice('groupChat', 'zd4', '邀请你加入语音', 'video', '146188268535809', '群名')
    }

    // useEffect(() => {
    //     let appId = '15cb0d28b87b425ea613fc46f7c9f974';
    //     CallKit.init(appId, WebIM.conn)
    // }, [])

    return (
        <>
            <h1>callkit Demo</h1>
            <label>用户名</label>
            <input onChange={handleChange}></input>
            <br />
            <button onClick={login}>登录</button>
            <button onClick={joinConf}>加入会议</button>
            <button onClick={inviteAudioCall}>发送语音邀请</button>
            <button onClick={inviteVideoCall}>发送视频邀请</button>
            <CallKit></CallKit>
        </>
    )
}

export default App