import $ from 'jquery';
import moment from 'moment';
import { database } from '../assets/javascripts/firebaseInit';
// import unname from '../assets/javascripts/helpers/unname';
// import guid from '../assets/javascripts/helpers/createGuid';

// const currentTime = moment().format('HHmmss');
const creation = moment().format('YYYY-MM-DD HH:mm:ss');
// const timestamp = moment().unix();

const dbRef = database.ref();
// const rootRef = dbRef.child('wagle');

let userId;
let userName;

function initUserSetting() {
  const uid = createGuid();
  const name = unnamed();

  const usersRef = dbRef.child(`wagle/users/${name}`);

  usersRef.set({
    uid,
    // name,
    creation
  });

  userId = uid;
  userName = name;
}
initUserSetting();

// "value", "child_added", "child_removed", "child_changed", or "child_moved".
database.ref().child('wagle').on('child_added', chat => {
  const chatVal = chat.val();
  console.log('chat  ', chatVal);
});

$('#send').on('click', () => {
  console.log(userName);
  const times = getCurrentTime();
  // const name = unnamed();
  const chatRef = dbRef.child(`wagle/chat/${userName}/${times.unix}`);
  const userMessage = $('footer input').val();
  chatRef.set({
    uid: userId,
    userMessage,
    creation: times.creation
  });

  // console.log(uid, name);
});

function createGuid() {
  function p8(s) {
    const p = (`${Math.random().toString(16)}000000000`).substr(2, 8);
    return s ? `-${p.substr(0, 4)}-${p.substr(4, 4)}` : p;
  }
  return p8() + p8(true) + p8(true) + p8();
}

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
