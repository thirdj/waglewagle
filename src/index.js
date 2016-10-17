import $ from 'jquery';
import moment from 'moment';

import { database } from '../assets/javascripts/firebaseInit';
import colors from '../assets/javascripts/helpers/colors';

const creation = moment().format('YYYY-MM-DD HH:mm:ss');
const uname = unnamed();

// Get a key for a new Post.
const newMsgKey = database.ref().child('wagle/messages').push().key;
const users = database.ref().child('wagle/users');

const randomColor = Math.floor(Math.random() * colors.length);
const ucolor = colors[randomColor];

// "value", "child_added", "child_removed", "child_changed", or "child_moved".
database.ref().child('wagle/users').on('child_removed', chat => {
  const chatVal = chat.val();
  console.log('users child_removed chat  ', chatVal);
});

database.ref().child('wagle/users').on('child_added', chat => {
  const chatData = chat.val();
  let data = {};
  // console.log('Object.keys(chatData)  ', Object.keys(chatData)[0]);
  if (newMsgKey === Object.keys(chatData)[0]) {
    data = setAppendMsg(chatData, newMsgKey);
    appendMsg(data);
  }
  // console.log('users child_added chat  ', chatVal);
});

database.ref().child('wagle/messages').on('child_changed', chat => {
  const chatData = chat.val();
  // console.log('111 chatData  ', chatData);
  let data = {};
  for (const key in chatData) {
    // console.log('222 chatData  ', chatData[key]);
    data = setAppendMsg(chatData, key);
  }
  // console.log('messages child_changed chat  ', chatData);
  appendMsg(data);
});

function setAppendMsg(data, key) {
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

function writeNewMessage(msg, timestamp, uid = uname) {
  const msgData = { uid, msg, creation, ucolor };
  const updates = {};

  updates[`/wagle/messages/${newMsgKey}/${timestamp}`] = msgData;

  users.once('value', snapshot => {
    if (!snapshot.hasChild(uid)) {
      updates[`/wagle/users/${uid}/${newMsgKey}`] = msgData;
    } else {
      console.log('That user already exists');
    }
  });
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
