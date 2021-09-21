/**
 * admin.js handles the admin page and admin operations in the website
 *
 * @author RonakPai <ronakspai@gmail.com>
 */


import { firebaseRef, db } from './firebase';
import { plans } from './plans.json';

/// Any type for placeholder any
type Any = any;

$(function() {

  var backendRef =
    'https://us-central1-techlab-website-1f5cc.cloudfunctions.net/'; // Cloud functions url

  if (window.location.hostname === 'localhost')
    backendRef = 'http://localhost:5001/techlab-website-1f5cc/us-central1/';

  // if (!db) {
  //   throw new Error(
  //     'Firebase DB with variable name db does not exist. Please make sure you include the firebase.js script BEFORE this script.'
  //   );
  // }
  
  
  /////////////
  // SORTING //
  /////////////

  $('#table_head tr th').each(function(index: number) {
    $(this).append(`
      <br>
      <button class="sort-btn" data-index="${index}">Sort By</button>
    `);
  });

  $('.sort-btn').click(function() {
    let index = $(this).data("index");

    ($('#enrolltable tr') as any).sort((a: Any, b: Any) => {
      let a_t: any = $(a).children().eq(index).text().toLowerCase();
      let b_t: any = $(b).children().eq(index).text().toLowerCase();
      if (index == 4) { // Enroll date
        a_t = new Date(a_t).getTime();
        b_t = new Date(b_t).getTime();
      }
      return a_t > b_t;
    }).appendTo('#enrolltable');

  });

  ///////////////
  // FILTERING //
  ///////////////

  let seasons = ['summer2020', 'spring2020', 'fall2019'];
  seasons.forEach(season => {
	  $('#season').append(`<option value="${season}">${season}</option>`);
  });

  let class_types = Object.keys(plans);
  class_types.unshift('any');
  class_types.forEach((class_t: string) => {
    $('#class').append(`<option value="${class_t}">${class_t}</option>`);
  });

  // TODO: don't hardcode these
  let weeks = [
  	'any',
    'Week 1: 6/08 - 6/12',
    'Week 2: 6/15 - 6/19',
    'Week 3: 6/22 - 6/26',
    'Week 4: 7/06 - 7/10',
    'Week 5: 7/13 - 7/17',
	  'Week 6: 7/20 - 7/24',
    'Week 7: 7/27 - 7/31',
    'Week 8: 8/03 - 8/07',
    'Week 9: 8/10 - 8/14',
    'Week 1&2: 6/08 - 6/19',
    'Week 2&3: 6/22 - 7/10, closed wk of 6/29',
    'Week 3&4: 7/13 - 7/24',
    'Week 4&5: 7/24 - 8/07'
  ];
  weeks.forEach((week: string) => {
    $('#week').append(`<option value="${week}">${week}</option>`);
  });


  function filter(row: Any) {
    let season = $('#season').val();
    let week = $('#week').val();
    let class_n = $('#class').val();
    let testingMode = $('#testing-mode-check').is(":checked");
    let showDeleted = $('#deleted-mode-check').is(":checked");
    console.log(showDeleted);


    if (season !== 'any' && row.season !== season) {
      return false;
    }
    if (week !== 'any' && row.week !== week) {
      return false;
    }
    if (class_n !== 'any' && row.class !== class_n) {
      return false;
    }
    if (testingMode !== row.testingMode) {
      return false;
    }
    if (!showDeleted && row.canceled) {
      return false;
    }

    return true;
  }

  //////////
  // AUTH //
  //////////

  firebase.auth().onAuthStateChanged((user: any) => {
    if (!user) {
      $('#login-modal').modal('show');
      console.log("stuff");
    }
  });

  $('#login-button').click(() => {
    firebase
      .auth()
      .signInWithEmailAndPassword(
        $('#login-email').val(),
        $('#login-password').val()
      )
      .then(() => $('#login-modal').modal('hide'))
      .catch(function(error: any) {
        $('#login-error').html(error.message);
        console.error(`${error.code} : ${error.message}`);
      });
  });

  /////////////
  // EDITING //
  /////////////

  async function edit(uid: string, id: string) {
    $("#edit-modal").modal('show');
    $("#update-button").data('uid', uid);
    $("#update-button").data('id', id);
    $("#delete-button").data('uid', uid);
    $("#delete-button").data('id', id);
    let data: any = (await db.collection("users").doc(uid).collection("enrollment").doc(id).get()).data();
    let c_types = Object.keys(plans);
    let c_options = c_types.map((class_t: string) => {
      return `<option value="${class_t}">${class_t}</option>`;
    }).join();
    $("#edit-modal-body")
      .html(`
        <p>
          Student: ${data['student-name']}
        </p>
        <div>
          <label for="edit-class">Class</label>
          <br>
          <select name="edit-class" id="edit-class-opt">${c_options}</select>
        </div>
        <div>
          <label for="edit-time">Time</label>
          <input name="edit-time" value="${data.time}" id="edit-time-opt" class="form-control">
        </div>
        <div>
          <label for="edit-week">Week</label>
          <input name="edit-week" value="${data.week}" id="edit-week-opt" class="form-control">
        </div>

      `)
    $("#edit-class-opt").val(data.class);
  }

  $("#delete-button").click(function () {
    let uid: string = $(this).data('uid');
    let id: string = $(this).data('id');

    let enrollRef = db.collection('users').doc(uid).collection('enrollment').doc(id);

    enrollRef.set({
      canceled: true
    }, {
      merge: true
    });

    $("#edit-modal").modal('hide');

  });

  $("#update-button").click(async function () {
    let uid: string = $(this).data('uid');
    let id: string = $(this).data('id');

    let enrollRef = db.collection('users').doc(uid).collection('enrollment').doc(id);

    let transRef = db.collection('transactions').doc();

    let change = {
      class: $("#edit-class-opt").val(),
      time: $("#edit-time-opt").val(),
      week: $("#edit-week-opt").val(),
    }

    let data = (await enrollRef.get()).data();

    let old = {
      class: data.class,
      time: data.time,
      week: data.week
    };

    console.log(enrollRef);
    transRef.set({
      path: enrollRef,
      data: change,
      old_data: old,
      date: Date.now()
    });

    enrollRef.set(change, {
      merge: true,
    });

    enrollRef.update({
      transactions: firebase.firestore.FieldValue.arrayUnion(transRef)
    });

    $("#edit-modal").modal('hide');

  });

  /////////////
  // LOADING //
  /////////////

  let table = $('#enrolltable');

  function addRow(row: Any) {
    let id_path = `${row.uid}/${row.id}`;
    let firebase_link = `https://console.firebase.google.com/u/0/project/techlab-website-1f5cc/database/firestore/data~2Fusers~2F${row.uid}~2Fenrollment~2F${row.id}`;
    table.append(
      $(`
        <tr
          class="${(() => {
            if (row.canceled) {
              return 'danger';
            }
            switch (row.paymentMethod) {
              case 'check':
                return 'warning';
              default:
                return '';
            }
          })()}"
          data-id="${id_path}"
          >
          <td>${row.name}</td>
          <td>${row.email}</td>
          <td>${row.age}</td>
          <td>${row.class}</td>
          <td>${convertDateToString(row.enroll_date)}</td>
          <td>${row.season}</td>
          <td>${row['student-name']}</td>
          <td>${row.time}</td>
          <td>${row.week}</td>
          <td>$${row.amount / 100}</td>
        </tr>
      `).append(
        $("<td>")
          .append(`<a target="_blank" href="${firebase_link}"><button>FB</button></a>`)
          .append(
            $("<button>Edit</button>").click(() => {
              edit(row.uid, row.id);
            })
          )
        )

    );
  }

  function load() {
    db.collection('users').get().then((docs: any) => {
      docs.forEach((user: any) => {
        user.ref.collection('enrollment').get().then((enrollment: any) => {
          enrollment.forEach((class_v: any) => {
            let data: Any = class_v.data();
            data.name = user.data().name;
            data.email = user.data().email;
            data.uid = user.id;
            data.id = class_v.id;
            if (filter(data)) {
              addRow(data);
            }
          });
        });
      });
    });
  }

  $('.edit-button').click(function() {
    let uid = $(this).data("uid");
    let id = $(this).data("id");
    console.log(uid);
    edit(uid, id);
  });

  /**
   * Converts timestamp to string date
   */
  function convertDateToString(timestamp: number) {
    let date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  }

  $('#listall').click(load);

  $('#clear').click(() => {
    table.html('');
  });
});
