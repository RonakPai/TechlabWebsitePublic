/**
 * firebase.js handles firebase initialization for all firebase pages
 *
 * @author rajpai@gmail.com
 * RonakPai <ronakspai@gmail.com>
 */

// Initialize Firebase
var config = {
  apiKey: 'AIzaSyAbROaNXDM-Mm-pWYD7-i7dIKihKqW0SSg',
  authDomain: 'techlab-website-1f5cc.firebaseapp.com',
  databaseURL: 'https://techlab-website-1f5cc.firebaseio.com',
  projectId: 'techlab-website-1f5cc',
  storageBucket: 'techlab-website-1f5cc.appspot.com',
  messagingSenderId: '434406194453'
};
firebase.initializeApp(config);

export var db = firebase.firestore();
export var firebaseRef = firebase;

const settings = { timestampsInSnapshots: true };
db.settings(settings);

// Initialize Cloud Functions through Firebase
var fbFunctions = firebase.functions();

// returns promise with user data
function getUserWithEmail(email) {
  return db
    .collection('emails')
    .doc(email)
    .get()
    .then(function(doc) {
      // returns userID to next promise
      if (doc.exists) {
        var userID = doc.data().userID;
        return userID;
      } else {
        throw new Error('User with email ' + email + " doesn't exist.");
      }
    })
    .then(function(userID) {
      return db
        .collection('users')
        .doc(userID)
        .get();
    })
    .then(function(doc) {
      var data = doc.data();
      data['userID'] = doc.id;
      return data;
    });
}
