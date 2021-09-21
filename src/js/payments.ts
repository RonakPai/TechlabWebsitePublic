/**
 * The payment.js file handles pages that use the enroll form
 *
 * @author zacklukem <mayhew.zachary2003@gmail.com>
 * RonakPai <ronakspai@gmail.com>
 */

import { enroll, RequestBody, formValidation } from './api/enroll';
import { plans } from './plans.json';

const _season = 'summer2020'; // change this every season!!!!! Dont forget!

// This should be https://us-central1-techlab-website-1f5cc.cloudfunctions.net/ in production. Not "techlab.education" it has a different url.  Also I set it to automatially change to the local url.
let backendRef =
  'https://us-central1-techlab-website-1f5cc.cloudfunctions.net/'; // Cloud functions url
let pk_stripe = 'pk_live_4QpGaoetTtXyt313keGUKMGK';

// Used if run locally
if (window.location.hostname === 'localhost') {
  backendRef = 'http://localhost:5001/techlab-website-1f5cc/us-central1/';
  pk_stripe = 'pk_test_WXBO4GbRxcedIveH9em0bhLQ';
}

// Add capitalize function
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

$(async function() {
  let paypalData: any;

  $('#check-checkbox').click(function() {
    if (this.checked) {
      $('#stripe-section').addClass('hidden');
    } else {
      $('#stripe-section').removeClass('hidden');
    }
  });

  let using_coupon = false;
  let codes: Map<string, number> = new Map();
  codes.set("NVIDIA10", 0.9);

  $('#apply_coupon').on('click', function(e) {
	$('#invalid-coupon').text("");
    e.preventDefault();
	let coupon: string = $('#coupon-input').val() as string;
	coupon = coupon.toUpperCase();
	let percent_off = codes.get(coupon);
	if (codes.has(coupon)) {
      let forClass = $('#paymentModal').attr('data-for-class');
      let classPlan = plans[forClass];
	  $('#coupon-input').val('');

	
      $('#coupon-successful').html(
        `Coupon Successful! Enjoy ${Math.round((1 - percent_off) * 100)}% off!`
      );
      $('#payment-title').html(
        `Enroll - ${classPlan.name} - <del>$${classPlan.price / 100}</del> $${classPlan.price * percent_off / 100} USD`
      );
      $('#payment-cost-data').html(`<del>$${classPlan.price / 100}</del> $${classPlan.price * percent_off / 100} USD`);
	  using_coupon = true;
	  $("#paypal-btn").html('');
      paypal
        .Buttons({
          createOrder: function(data: any, actions: any) {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: String(classPlan.price * percent_off / 100)
                  }
                }
              ]
            });
          },
          onApprove: function(data: any, actions: any) {
            $('#payment-section').addClass('hidden');
            $('#payment-check').removeClass('hidden');
            $('#paymentModal').modal('show');
            // Capture the funds from the transaction
            return actions.order.capture().then(function(details: any) {
              paypalData = data;
              console.log(data);
              //$('#payment-form').submit();
            });
          }
        })
        .render('#paypal-btn');
	} else {
	  $('#apply_coupon').after('<span id="invalid-coupon">Invalid Coupon</span>');
	  console.log("invalid coupon");
	}
  });


  // Called when the enroll button is clicked.  opens the popup and adds info
  $('.enroll-button').on('click', function() {
    let forClass = $(this).attr('data-for-class');
    let classPlan = plans[forClass];

    $('#paypal-btn').html('');
    $('#payment-section').removeClass('hidden');
    paypalData = undefined;
    paypal
      .Buttons({
        createOrder: function(data: any, actions: any) {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: String(classPlan.price / 100)
                }
              }
            ]
          });
        },
        onApprove: function(data: any, actions: any) {
          $('#payment-section').addClass('hidden');
          $('#payment-check').removeClass('hidden');
          $('#paymentModal').modal('show');
          // Capture the funds from the transaction
          return actions.order.capture().then(function(details: any) {
            paypalData = data;
            console.log(data);
			
            //$('#payment-form').submit();
          });
        }
      })
      .render('#paypal-btn');

    if (ga) {
      ga('send', 'event', 'enroll', 'enroll_modal_open');
    }

    // Add times list
    let radios = $('#time-radios');
    radios.text(''); // Reset the radios text
    for (let i = 0; i < classPlan.times.length; i++) {
      radios.append(
        $(`
        <label>
          <input id="${'r' + i}"
            type="radio"
            name="time_radio"
            value="${classPlan.times[i]}"
          /> 
          ${classPlan.times[i]}
        </label>
        <br />
      `)
      );
    }

    // Add weeks list
    radios = $('#week-radios');
    radios.text(''); // Reset the radios text
    for (let i = 0; i < classPlan.weeks.length; i++) {
      radios.append(
        $(`
        <label>
          <input id="${'r' + i}"
            type="radio"
            name="week_radio"
            value="${classPlan.weeks[i]}"
          /> 
          ${classPlan.weeks[i]}
        </label>
        <br />
      `)
      );
    }

    // $('#one-time-price').text(
    //   `One payment of $${classPlan.price / 100} (${Math.floor(
    //     100 * (1 - classPlan.price / (classPlan.monthly * classPlan.payments))
    //   )}% off)`
    // );

    // $('#monthly-price').text(
    //   `${classPlan.payments} payments of $${classPlan.monthly / 100}`
    // );

    // Change title text
    $('#payment-title').text(
      `Enroll - ${classPlan.name} - $${classPlan.price / 100} USD`
    );
    $('#payment-cost-data').text('$' + classPlan.price / 100 + ' USD');
    $('#paymentModal').attr('data-for-class', forClass);
    $('#paymentModal').modal('show');
  });

  // Validate the payment form
  $('#payment-form').validate({
    rules: formValidation.rules,
    messages: formValidation.messages,
    submitHandler: async function(form: any) {
      try {
        // Run when the form is submitted successfully
        let paymentMethod: 'check' | 'paypal' | 'stripe';

        // if (form.check.checked) {
        //   paymentMethod = 'check';
        // } else
        if (paypalData) {
          paymentMethod = 'paypal';
        } else {
          paymentMethod = 'stripe';
        }
        let formData: any = {};

        console.log(formData);
        $(form)
          .serializeArray()
          .forEach(v => {
            formData[v.name] = v.value;
          });

        let data: RequestBody = {
          email: formData.email,
          phone: formData.phone,
          parent_name: formData.your_name,
          name: formData.name,
          age: formData.age,
          time: formData.time_radio,
          week: formData.week_radio,
          // payment_type: formData.payment_method_radio,
          payment_type: 'one-time',
          class: $('#paymentModal').attr('data-for-class'),
          season: _season,
          payment_method: paymentMethod
        };

        switch (paymentMethod) {
          case 'stripe':
            let result = await stripe.createToken(card, {
              name: formData.your_name
            });
            if (result.error) {
              // Inform the customer that there was an error.
              let errorElement = document.getElementById('card-errors');
              errorElement.textContent = result.error.message;
              return;
            }
            data.token = result.token.id;
            break;
          case 'paypal':
            data.paypalData = paypalData;
            break;
          // case 'check':
          //   data.isPayByCheck = 'true';
          //   break;
        }

        // Send google analytics
        if (ga) {
          ga('send', 'event', 'enroll', 'enroll_payment_button_clicked');
        }

        // Show progress bar
        $('#payment-progress').removeClass('hidden');
        // Clear error message
        let errorElement = document.getElementById('card-errors');
        errorElement.textContent = '';

		// Enroll

        let response = await enroll(backendRef, data);

        console.log(response);
        // success
        if (response.err === true) {
          throw new Error('Backend Error.');
        } else {
          $('#paymentModal').modal('hide');
          $('#payment-progress').addClass('hidden');
          $('#enroll-fail').addClass('hidden');
          $('#enroll-suc').modal('show');
        }
      } catch (e) {
        $('#payment-progress').addClass('hidden');
        $('#enroll-fail').removeClass('hidden');
        $('#enroll-suc').modal('hide');
        console.error(e);
      }
    }
  });

  // Hello friends!
  // This is some stuff!
  let stripe = Stripe(pk_stripe); // TODO: Change this key for production
  let elements = stripe.elements();

  let style = {
    base: {
      color: '#32325d',
      lineHeight: '18px',
      fontFamily: '"Ubuntu", sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '14px',
      '::placeholder': {
        color: '#999'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  };

  // Create an instance of the card Element.
  let card = elements.create('card', { style: style });

  // Add an instance of the card Element into the `card-element` <div>.
  card.mount('#card-element');
});
