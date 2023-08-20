/* eslint-disable */
import { login, logout } from './login.mjs';
import { updateSettings } from './updateSettings.mjs';
import {bookTour} from './stripe.mjs'
//DOM elements
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const updatDataForm = document.querySelector('.form-user-data');
const updataPasswordForm = document.querySelector('.form-user-password');
const bookTourBtn = document.getElementById('book-tour');

//Actions
if (loginForm) {
  loginForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log('data from eventListener', email, password);
    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (updatDataForm)
  updatDataForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const dataBtn = document.querySelector('.btn--saveData');
    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('photo', document.getElementById('photo').files[0]);

    dataBtn.textContent = 'Saving....';
    await updateSettings(formData, 'data');
    dataBtn.textContent = 'save settings';
  });

if (updataPasswordForm)
  updataPasswordForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const PasswordBtn = document.querySelector('.btn--save-password');
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    PasswordBtn.textContent = 'Updating...';
    await updateSettings(
      { currentPassword, password, passwordConfirm },
      'password'
    );
    document.getElementById('password-current').textContent = '';
    document.getElementById('password').textContent = '';
    document.getElementById('password-confirm').textContent = '';

    PasswordBtn.textContent = 'Save Password';
  });

  if(bookTourBtn){
    bookTourBtn.addEventListener('click',e=>{
        e.target.textContent='processing...';
        const {tourId}=e.target.dataset;
        console.log(e.target);
        bookTour(tourId);
    })
  }