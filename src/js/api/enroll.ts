/**
 * Interface representing the requst made by the front-end
 */
export interface RequestBody {
  email: string;
  phone: string;
  parent_name: string;
  name: string;
  age: string;
  time: string;
  week: string;
  class: string;
  season: string;
  payment_type: 'monthly' | 'one-time';
  payment_method: 'paypal' | 'stripe' | 'check';
  token?: string;
  paypalData?: { orderID: string };
  isPayByCheck?: string;
}

export async function enroll(backendRef: string, data: RequestBody) {
  const res = await fetch(backendRef + 'enroll', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    referrer: 'no-referrer',
    body: JSON.stringify(data)
  });
  return await res.json();
}

export const formValidation = {
  rules: {
    name: {
      required: true,
      minlength: 4
    },
    email: {
      required: true,
      email: true
    },
    phone: {
      required: true
    },
    age: {
      required: true
    },
    your_name: {
      required: true,
      minlength: 4
    },
    time_radio: {
      required: true
    },
    week_radio: {
      required: true
    },
    // agree_checkbox: {
    //   required: true
    // },
    check: {
      required: false
    }
  },
  messages: {
    name: {
      required: "Please enter your student's name",
      minlength: "Your student's name must consist of at least 4 characters"
    },
    email: {
      required: 'Please enter your email address'
    },
    phone: {
      required: 'Please enter your phone number'
    },
    age: {
      required: 'Please enter your age'
    },
    your_name: {
      required: 'Please enter your name',
      minlength: 'Your name must consist of at least 4 characters'
    },
    time_radio: {
      required: 'Please select a time'
    },
    week_radio: {
      required: 'Please select a week'
    }
    // agree_checkbox: {
    //   required: 'You must agree to our terms and conditions to continue.'
    // }
  }
};
