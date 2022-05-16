# Web 端 EaseCallKit 使用指南

`EaseCallKit` 是一套基于环信 IM 和声网音视频结合开发的音视频 UI 库，实现了一对一语音和视频通话以及多人音视频通话的功能。基于 `EaseCallKit` 可以快速实现通用音视频功能。

利用 `EaseCallKit` 通话过程中，使用环信 ID 加入频道，方便音视频视图中显示用户名。如果用户不使用 EaseCallKit 而直接调用声网 API，也可以直接使用数字 UID 加入频道。

注：本 UI 库需要 IM SDK 4.0.4 及以上版本, react 16.8 及以上版本 。Demo 中 EaseCallKit 使用的 token 和 UID 都需要从声网申请，如果您需要使用声网对应的音视频服务，也需单独去声网申请。

## 前提条件

在使用 EaseCallKit 之前，需要满足以下条件：

-   分别创建 [[http://docs-im.easemob.com/im/ios/sdk/prepare#注册并创建应用|环信应用]] 及 [[https://docs.agora.io/cn/Video/run_demo_video_call_ios?platform=iOS#1-创建-agora-项目|声网应用]]；
-   已完成环信 IM 的基本功能，包括登录、好友、群组以及会话等的集成；
-   上线之前开通声网 Token 验证时，用户需要实现自己的 [[https://github.com/easemob/easemob-im-app-server/tree/master/agora-app-server|App Server]]，用于生成 Token。具体请参见 [[https://docs.agora.io/cn/live-streaming/token_server|创建 Token 服务及使用 App Server 生成 Token]]。

## 快速集成

使用 EaseCallKit 库完成音视频通话的基本流程如下：

1.  EaseCallKit 库进行初始化并设置 EaseCallKit 监听；
2.  主叫方调用发起通话邀请接口 `startCall` ，进入通话界面；
3.  被叫方收到邀请自动弹出通话邀请界面，在通话邀请界面选择接通或者拒绝；
4.  主叫或者被叫挂断通话。

## 引入 EaseCallKit

下载 callkit

-   npm

```bash
npm install callkit // 包名还没确定
```

-   yarn

```yarn
yarn add callkit
```

引入 callkit

```js
import Callkit from 'callkit';
```

## 初始化

```js
/**
 * 参数说明：
 * appId: 声网的 appId
 * uid: 声网的 uid
 * connection: 环信 IM SDK 实例
 */
Callkit.init(appId, uid, connection);
```

## 添加监听

```js
function Call() {
	const handleAddPerson = () => {
		// 多人通话，点击添加人按钮的回调
	};
	const handleCallStateChange = () => {
		// 通话状态变化的回调
	};
	return (
		<Callkit
			onAddPerson={handleAddPerson}
			onStateChange={handleCallStateChange}
		/>
	);
}
```

## 发起通话邀请

EaseCallKit 初始化完成后，可以发起音视频通话。

一对一音视频通话
一对一通话可分为视频通话和语音通话，接口如下所示：

```js
let options = {
	callType: 1, // 0 1v1 语音，1 1v1视频， 2 多人视频， 3 多人语音
	chatType: 'singleChat',
	to: 'userId',
	agoraUid: 'agoraUid',
	message: '邀请你加入语音',
	channel: 'channel',
	accessToken: '声网 token', // 后面介绍怎么获取声网 token
};
CallKit.startCall(options);
```

多人音视频通话

```js
let options = {
	callType: 1, // 0 1v1 语音，1 1v1视频， 2 多人视频， 3 多人语音
	chatType: 'singleChat',
	to: 'userId',
	agoraUid: 'agoraUid',
	message: '邀请你加入语音',
	channel: 'channel',
	accessToken: '声网 token', // 后面介绍怎么获取声网 token
};
CallKit.startCall(options);
```

## 被叫收到通话邀请

主叫方发起邀请后，如果被叫方在线且当前不在通话中，会触发 onInvite 回调，

加入通话：

```js
CallKit.answerCall(true, accessToken);
```

然后会弹出接听通话的界面，可以选择接听或者挂断。

如果不想弹出接听的界面可以：

```js
CallKit.answerCall(false);
```

## 通话结束

在一对一音视频通话中，若其中一方挂断，双方的通话会自动结束，而多人音视频通话中需要主动挂断才能结束通话。通话结束后，会触发 onStateChange 回调：

```js
function Call() {
	const handleCallStateChange = (info) => {
		if (info.type === 'hangup') {
			// 挂断
		} else if (info.type === 'user-left') {
			// 对方离开
		}
	};
	return <Callkit onStateChange={handleCallStateChange} />;
}
```

## API 列表

方法：
|-- 方法 --|-- 说明 ---|
| init | 初始化 CallKit |
| startCall | 发起通话 |
| answerCall | 接听通话 |
| setUserIdMap | 设置声网 ID 映射 |

回调：
|-- 方法 --|-- 说明 ---|
| onAddPerson | 多人通话点击邀请人按钮的回调 ｜
| onInvite | 收到通话邀请的回调 |
| onStateChange | 通话状态发生变化的回调 |
