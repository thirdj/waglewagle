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

/*
function initUserSetting() {
  const uid = createGuid();
  const name = unnamed();

  const usersRef = dbRef.child('wagle/users');

  usersRef.push({
    uid,
    // name,
    creation
  });

  userId = uid;
  userName = name;
}
initUserSetting();
*/
// "value", "child_added", "child_removed", "child_changed", or "child_moved".
database.ref().child('wagle/users').on('child_removed', chat => {
  const chatVal = chat.val();
  console.log('users child_removed chat  ', chatVal);
});

database.ref().child('wagle/users').on('child_added', chat => {
  const chatVal = chat.val();
  console.log('users child_added chat  ', chatVal);
});

database.ref().child('wagle/messages').on('child_changed', chat => {
  const chatData = chat.val();
  // console.log('111 chatData  ', chatData);
  let data = {};
  for (const key in chatData) {
    // console.log('222 chatData  ', chatData[key]);
    data = {
      uid: chatData[key].uid,
      msg: chatData[key].msg,
      ucolor: chatData[key].ucolor,
      creation: chatData[key].creation
    };
  }
  // console.log('messages child_changed chat  ', chatData);
  appendMsg(data);
});

$('#wagle-form').on('submit', e => {
  e.preventDefault();
  e.stopPropagation();
  const userMessage = $('footer input');
  const times = getCurrentTime();

  writeNewMessage(userMessage.val(), times.unix);

  userMessage.val('').focus();
});

function appendMsg(data) {
  const time = moment().format('HH:mm');
  $('#chat').append(
    `
      <div class="logs">
        <span class="time">${time}</span>
        <span style="color:${data.ucolor};">${data.uid}</span>
        <span class="msg">${data.msg}</span>
      </div>
    `
  );
  $('#chat').scrollTop($('#chat')[0].scrollHeight);
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
