import React from 'react';
import ReactDOM from 'react-dom/client';
import CallKit, { join } from '../../src/index'
import WebIM from './webim'
import App from './demo'

const root = ReactDOM.createRoot(
  document.getElementById('demo')
);

const login = () => {
  WebIM.conn.open({
    user: 'zd2',
    pwd: '1'
  }).then((res) => {
    console.log('登录成功', res)
  })
}

const joinConf = () => {
  CallKit.join({ channel: '123', connection: WebIM.conn })
}

root.render(<App />)

