import $ from 'jquery';
import moment from 'moment';

import { database } from '../assets/javascripts/firebaseInit';
import colors from '../assets/javascripts/helpers/colors';

const dbRef = database.ref();

// Get a key for a new Post.
const newMsgKey = dbRef.child('wagle/messages').push().key;
// const users = dbRef.child('wagle/users');

// const randomColor = Math.floor(Math.random() * colors.length);
const creation = moment().format('YYYY-MM-DD HH:mm:ss');
const ucolor = colors[getColor()];
const uname = unnamed();

function getColor() {
  return Math.floor(Math.random() * colors.length);
}

function joinUser() {
  // dbRef.child('wagle/users').on('child_added', chat => {
  //   console.info('wagle/users  child_added');
  //   const chatData = chat.val();
  //   let data = {};
  //   // console.log('Object.keys(chatData)  ', Object.keys(chatData)[0]);
  //   // console.log('newMsgKey ', newMsgKey);
  //   // console.log('Object.keys(chatData)[0] ', Object.keys(chatData)[0]);
  //   if (newMsgKey === Object.keys(chatData)[0]) {
  //     console.log('users child_added same');
  //     data = setAppendMsgData(chatData, newMsgKey);
  //     appendMsg(data);
  //   }
  //   // console.log('users child_added chat  ', chatVal);
  // });
  const msg = '입장 했습니다.';
  const uid = uname;
  const msgData = { uid, msg, creation, ucolor };
  const updates = {};

  updates[`/wagle/users/${uname}/${newMsgKey}`] = msgData;
  updates[`/wagle/messages/${newMsgKey}/${getCurrentTime().unix}`] = msgData;
  // users.once('value', snapshot => {
  //   console.log('[writeNewMessage] user.once');
  //   if (!snapshot.hasChild(uid)) {
  //     console.log('[writeNewMessage] not uid');
  //     updates[`/wagle/users/${uid}/${newMsgKey}`] = msgData;
  //   } else {
  //     console.log('[writeNewMessage] That user already exists');
  //   }
  // });
  // console.log('[writeNewMessage] before return');
  return database.ref().update(updates);
}

joinUser();

// "value", "child_added", "child_removed", "child_changed", or "child_moved".
dbRef.child('wagle/users').on('child_removed', chat => {
  const chatVal = chat.val();
  console.log('users child_removed chat  ', chatVal);
});

dbRef.child('wagle/users').on('child_added', chat => {
  // console.info('wagle/users  child_added');
  const chatData = chat.val();
  let data = {};
  // console.log('Object.keys(chatData)  ', Object.keys(chatData)[0]);
  // console.log('newMsgKey ', newMsgKey);
  // console.log('Object.keys(chatData)[0] ', Object.keys(chatData)[0]);
  if (newMsgKey === Object.keys(chatData)[0]) {
    // console.log('users child_added same');
    data = setAppendMsgData(chatData, newMsgKey);
  }
  appendMsg(data);
  // console.log('users child_added chat  ', chatVal);
});
/*
dbRef.child('wagle/messages').on('child_added', chat => {
  console.info('wagle/messages  child_added');
  const chatData = chat.val();
  // console.log('111 chatData  ', chatData);
  let data = {};
  for (const key in chatData) {
    console.log('222 chatData  ', chatData[key]);
    console.log('chatData[key].uid ', chatData[key].uid);
    console.log('uname ', uname);
    if (uname === chatData[key].uid) {
      data = setAppendMsgData(chatData, key);
      appendMsg(data);
    }
  }
  // console.log('messages child_added chat  ', chatData);
});
*/
dbRef.child('wagle/messages').on('child_changed', chat => {
  // console.info('wagle/messages  child_changed');
  const chatData = chat.val();
  // console.log('111 chatData  ', chatData);
  let data = {};
  for (const key in chatData) {
    // console.log('222 chatData  ', chatData[key]);
    data = setAppendMsgData(chatData, key);
  }
  // console.log('messages child_changed chat  ', chatData);
  appendMsg(data);
});

function setAppendMsgData(data, key) {
  // console.log('setAppendMsgData', data, key);
  return {
    uid: data[key].uid,
    msg: data[key].msg,
    ucolor: data[key].ucolor,
    creation: data[key].creation
  };
}

$(() => {
  const wagleInputMessage = $('#wagle-input');

  $('main, footer').on('click', () => {
    wagleInputMessage.focus();
  });

  wagleInputMessage.val('').focus();

  $('#wagle-form').on('submit', e => {
    e.preventDefault();
    e.stopPropagation();

    const times = getCurrentTime();

    if ($.trim(wagleInputMessage.val()) === '') {
      wagleInputMessage.val('').focus();
      return false;
    }

    writeNewMessage(wagleInputMessage.val(), times.unix);

    wagleInputMessage.val('').focus();
  });
});

function appendMsg(data) {
  // console.log('appendMsg ', data);
  if (Object.keys(data).length && data.constructor === Object) {
    const time = moment().format('HH:mm');
    $('#messages').append(
      `
        <div class="logs">
          <span class="time">${time}</span>
          <span style="color:${data.ucolor};" class="user">${data.uid}</span>
          <span class="msg">${data.msg}</span>
        </div>
      `
    );
    $('#messages').scrollTop($('#messages')[0].scrollHeight);
  }
}

function writeNewMessage(msg, timestamp, uid = uname) {
  // console.info('start [writeNewMessage]');
  const msgData = { uid, msg, creation, ucolor };
  const updates = {};

  updates[`/wagle/messages/${newMsgKey}/${timestamp}`] = msgData;
  updates[`/wagle/users/${uid}/${newMsgKey}`] = msgData;
  // console.log('[writeNewMessage] before return');
  return database.ref().update(updates);
}

function createGuid() {
  function p8(s) {
    const p = (`${Math.random().toString(16)}000000000`).substr(2, 8);
    return s ? `-${p.substr(0, 4)}-${p.substr(4, 4)}` : p;
  }
  return p8() + p8(true) + p8(true) + p8();
}
console.log('🐶 createGuid ', createGuid());

function unnamed() {
  return Math.random().toString(36).slice(2, 10);
}

function getCurrentTime() {
  const times = {
    unix: moment().unix(),
    creation: moment().format('YYYY-MM-DD HH:mm:ss')
  };
  return times;
}
