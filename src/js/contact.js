/**
 * The contact.js file is for frontend handling of the contact form on contact.html
 *
 * @author zacklukem <mayhew.zachary2003@gmail.com>
 *   dhruvshah1214 <dhruv.shah@gmail.com>
 *   RonakPai <ronakspai@gmail.com>
 */

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

// This should be https://us-central1-techlab-website-1f5cc.cloudfunctions.net/ in production. Not "techlab.education" it has a different url.  Also I set it to automatially change to the local url.
var backendRef =
  'https://us-central1-techlab-website-1f5cc.cloudfunctions.net/'; // Cloud functions url

// Used if run locally
if (window.location.hostname === 'localhost') {
  backendRef = 'http://localhost:5001/techlab-website-1f5cc/us-central1/'; // replaced port 5001 with 5000, @ rajpai
}

// Run when the form is submitted
function contactFormSubmit(element) {
  element.preventDefault();

  $('#error').fadeOut();
  $('#success').fadeOut();

  // Gets the data from the html
  var formData = {
    name: document.getElementById('contact_user_name').value,
    email: document.getElementById('contact_user_email').value,
    subject: document.getElementById('contact_subject').value,
    message: document.getElementById('contact_message').value
  };

  // if it is valid
  if (formData.name && formData.email && validateEmail(formData.email)) {
    console.log('VALIDATION SUCCESS.');

    $.ajax({
      url: backendRef + 'message',
      type: 'post',
      data: formData
    })
      .done(function(data) {
        if (!data.err) {
          $('#contact-form').addClass('hidden');
          $('#success').fadeIn();
          console.log('Send Success');
        } else {
          $('#error').fadeIn();
        }
      })
      .fail(function() {
        $('#error').fadeIn();
      });
  } else {
    console.error('VALIDATION FAILED.');
  }
}

$(document).ready(function() {
  document
    .getElementById('contact-form')
    .addEventListener('submit', contactFormSubmit);
  $('#contact-form').validate({
    rules: {
      user_name: {
        required: true,
        minlength: 4
      },
      user_email: {
        required: true,
        email: true
      },
      user_subject: {
        required: false
      },
      user_message: {
        required: true
      }
    },
    messages: {
      user_name: {
        required: 'Please add a valid name',
        minlength: 'Your name must consist of at least 4 characters'
      },
      user_email: {
        required: 'Please put your email address'
      },
      user_message: {
        required: 'Put some messages here?'
      }
    }
  });
});
