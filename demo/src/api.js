import axios from 'axios';

export const getToken = (agoraId, nickName) => {
    return postData('https://a41.easemob.com/app/chat/user/login', { "userAccount": agoraId, "userNickname": nickName })
}

export function getRtctoken(params) {

    const { channel, agoraId, username } = params;

    const url = `https://a41.easemob.com/token/rtc/channel/${channel}/agorauid/${agoraId}?userAccount=${username}`

    return axios
        .get(url)
        .then(function (response) {
            console.log('getRtctoken', response)
            return response.data;
        })
        .catch(function (error) {
            console.log(error);
        });
}

export const getConfDetail = (username, channelName) => {

    // const url = `${WebIM.conn.apiUrl}/channel/mapper?userAccount=${username}&channelName=${channelName}&appkey=${encodeURIComponent(appkey)}`

    const url = `https://a41.easemob.com/agora/channel/mapper?channelName=${channelName}&userAccount=${username}`

    return axios.get(url)
        .then(function (response) {
            let members = response.data.result
            return members
        })
        .catch(function (error) {
            console.log(error);
        });
}


export function postData(url, data) {
    return fetch(url, {
        body: JSON.stringify(data),
        cache: 'no-cache',
        headers: {
            'content-type': 'application/json'
        },
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        referrer: 'no-referrer',
    })
        .then(response => response.json())
}