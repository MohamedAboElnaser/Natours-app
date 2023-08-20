/* eslint-disable */
import { showAlert } from './alerts.mjs';

export const login = async (email, password) => {
  try {
    console.log('this from login function', email, password);
    const result = await axios({
      method: 'POST',
      url: 'http://localhost:8000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    console.log(
      'this must be res of the request logged in the browser console:',
      result
    );
    if (result.data.status === 'success') {
      showAlert('success', 'Welcom to Natours APP!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:8000/api/v1/users/logout',
    });
    if ((res.data.status = 'success')) location.assign('/');
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error happen while logging out!');
  }
};
