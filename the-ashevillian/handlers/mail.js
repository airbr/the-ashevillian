const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify = require('es6-promisify');

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

transport.sendMail({
  from: 'test@test.com',
  to: 'tester@test.com',
  subject: 'SHOOT @@@@',
  html: '<b>WHAT</b> Hello !!!',
  text:  'eeeeeee TTT'
});