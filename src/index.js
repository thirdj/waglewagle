import $ from 'jquery';
import moment from 'moment';

import { database } from '../assets/javascripts/firebaseInit';
import colors from '../assets/javascripts/helpers/colors';

const dbRef = database.ref();

// Get a key for a new Post.
const newMsgKey = dbRef.child('wagle/messages').push().key;

const creation = moment().format('YYYY-MM-DD HH:mm:ss');
const ucolor = colors[getColor()];
const uid = unnamed();

// "value", "child_added", "child_removed", "child_changed", or "child_moved".
dbRef.child('wagle/users').on('child_removed', () => {
  // const snapVal = snap.val();
  const $joinCounting = $('#join-counting');
  $joinCounting.addClass('bounce');
  setTimeout(() => {
    $joinCounting.removeClass('bounce');
  }, 500);
  // console.log('users child_removed snap  ', snapVal);
});

// connected user count
dbRef.child('wagle/users').on('value', (snap) => {
  // const posts = snap.val();
  // const keys = Object.keys(posts);
  const count = snap.numChildren();
  const $joinCounting = $('#join-counting');

  if (count) {
    $joinCounting.attr('data-badge', count);
    $joinCounting.addClass('exsist').addClass('bounce');
    setTimeout(() => {
      $joinCounting.removeClass('bounce');
    }, 500);
  }
});

dbRef.child('wagle/users').on('child_added', snap => {
  // console.info('wagle/users  child_added');
  const snapData = snap.val();
  let data = {};

  if (newMsgKey === Object.keys(snapData)[0]) {
    data = setAppendMsgData(snapData, newMsgKey);
  }
  appendMsgTemplate(data);
});

dbRef.child('wagle/messages').on('child_changed', snap => {
  // console.info('wagle/messages  child_changed');
  const snapData = snap.val();
  let data = {};
  for (const key in snapData) {
    data = setAppendMsgData(snapData, key);
  }
  appendMsgTemplate(data);
});


$(() => {
  const wagleInputMessage = $('#wagle-input');

  joinRoom();

  wagleInputMessage.val('').focus();

  $('main, footer').on('click', () => {
    wagleInputMessage.focus();
  });

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

  $(window).on('unload', () => {
    dbRef.child('wagle/users').child(uid).remove();
    dbRef.child('wagle/messages').child(newMsgKey).remove();
  });
});


/*
 * functions
 *
 */
function getColor() {
  return Math.floor(Math.random() * colors.length);
}

function joinRoom() {
  const msg = '입장 했습니다.';
  const msgData = { uid, msg, creation, ucolor };
  const updates = {};

  updates[`/wagle/users/${uid}/${newMsgKey}`] = msgData;
  updates[`/wagle/messages/${newMsgKey}/${getCurrentTime().unix}`] = msgData;

  return database.ref().update(updates);
}

function setAppendMsgData(data, key) {
  // console.log('setAppendMsgData', data, key);
  return {
    uid: data[key].uid,
    msg: data[key].msg,
    ucolor: data[key].ucolor,
    creation: data[key].creation
  };
}

function appendMsgTemplate(data) {
  // console.log('appendMsgTemplate ', data);
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

function writeNewMessage(msg, timestamp, uuid) {
  // console.info('start [writeNewMessage]');
  const msgData = { uid, msg, creation, ucolor };
  const updates = {};

  updates[`/wagle/messages/${newMsgKey}/${timestamp}`] = msgData;
  updates[`/wagle/users/${uuid}/${newMsgKey}`] = msgData;

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
