/* eslint-disable import/no-extraneous-dependencies */
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Mohamed AboElnasr ${process.env.EMAIL_FROM}`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //sendGrid mail in the FUTURE
      return nodemailer.createTransport({
          service:'SendGrid',
          auth:{
            user:process.env.SENDGRID_USERNAME,
            pass:process.env.SENDGRID_PASSWORD
          }
      })
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  //_send email
  async _send(template, subject) {
    //1] render  HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    //2] define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.htmlToText(html),
    };

    //create transport and _send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this._send('welcome', 'Welcome to the Natours family!');
  }

  async sendPasswordReset(){
    await this._send('passwordReset','Reset Your Password');
  }
};
