import $ from 'jquery';
import moment from 'moment';

import { database } from '../assets/javascripts/firebaseInit';
import colors from '../assets/javascripts/helpers/colors';

const dbRef = database.ref();
const dbRefUsers = dbRef.child('wagle/users');
const dbRefMessages = dbRef.child('wagle/messages');

// Get a key for a new Post.
const newMsgKey = dbRefMessages.push().key;

const creation = moment().format('YYYY-MM-DD HH:mm:ss');
const ucolor = colors[getRandomColor()];
const uid = unnamed();

let connectUserCount;


dbRefUsers.on('child_removed', () => {
  const $joinCounting = $('#join-counting');

  $joinCounting.addClass('bounce');
  setTimeout(() => {
    $joinCounting.removeClass('bounce');
  }, 500);
});

dbRefUsers.on('value', (snap) => {
  const count = snap.numChildren();
  const $joinCounting = $('#join-counting');

  if (connectUserCount !== count) {
    $joinCounting.attr('data-badge', count);
    $joinCounting.addClass('exsist').addClass('bounce');
    setTimeout(() => {
      $joinCounting.removeClass('bounce');
    }, 500);
  }
  connectUserCount = count;
});

dbRefUsers.on('child_added', snap => {
  const snapData = snap.val();
  let data = {};

  if (newMsgKey === Object.keys(snapData)[0]) {
    data = setAppendMsgData(snapData, newMsgKey);
  }
  appendMsgTemplate(data);
});

dbRefMessages.on('child_changed', snap => {
  const snapData = snap.val();
  let data = {};
  for (const key in snapData) {
    data = setAppendMsgData(snapData, key);
  }
  appendMsgTemplate(data);
});


$(() => {
  const $wagleInputMessage = $('#wagle-input');
  const $wagleForm = $('#wagle-form');

  joinRoom();

  $wagleInputMessage.val('').focus();

  $('main, footer').on('click', () => {
    $wagleInputMessage.focus();
  });

  $wagleForm.on('submit', e => {
    e.preventDefault();
    e.stopPropagation();

    const times = getCurrentTime();

    if ($.trim($wagleInputMessage.val()) === '') {
      $wagleInputMessage.val('').focus();
      return false;
    }

    writeNewMessage($wagleInputMessage.val(), times.unix, uid);

    $wagleInputMessage.val('').focus();
  });

  $(window).on('unload', () => {
    dbRefUsers.child(uid).remove();
    dbRefMessages.child(newMsgKey).remove();
  });
});


/*
 * functions
 *
 */
function joinRoom() {
  const msg = '입장 했습니다...';
  const msgData = { uid, msg, creation, ucolor };
  const times = getCurrentTime();
  const updates = {};

  updates[`/wagle/users/${uid}/${newMsgKey}`] = msgData;
  updates[`/wagle/messages/${newMsgKey}/${times.unix}`] = msgData;

  return database.ref().update(updates);
}

function setAppendMsgData(data, key) {
  return {
    uid: data[key].uid,
    msg: data[key].msg,
    ucolor: data[key].ucolor,
    creation: data[key].creation
  };
}

function appendMsgTemplate(data) {
  if (Object.keys(data).length && data.constructor === Object) {
    const time = moment().format('HH:mm');
    const $messages = $('#messages');

    $messages.append(
      `
        <div class="logs">
          <span class="time">${time}</span>
          <span style="color:${data.ucolor};" class="user">${data.uid}</span>
          <span class="msg">${data.msg}</span>
        </div>
      `
    );
    $messages.scrollTop($('#messages')[0].scrollHeight);
  }
}

function writeNewMessage(msg, timestamp, uuid) {
  const msgData = { uid, msg, creation, ucolor };
  const updates = {};

  updates[`/wagle/messages/${newMsgKey}/${timestamp}`] = msgData;
  updates[`/wagle/users/${uuid}/${newMsgKey}`] = msgData;

  return database.ref().update(updates);
}

function getRandomColor() {
  return Math.floor(Math.random() * colors.length);
}

function unnamed() {
  return Math.random().toString(36).slice(2, 10);
}

function getCurrentTime() {
  return {
    unix: moment().unix(),
    creation: moment().format('YYYY-MM-DD HH:mm:ss')
  };
}
