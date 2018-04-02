
var express = require('express');
var router = express.Router();
var passport=require('passport');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var path = require('path');
var multer = require('multer');
var async = require('async');
var crypto = require('crypto');
var randomString = require('random-string')
var Users = require('../models/user');

var csrf = require('express-csurf');
var csrfProtection = csrf();
router.use(csrfProtection);


  const storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, 'uploads/')
    },
    filename: function(req, file, callback) {
      callback(null, file.fieldname + '_' + Date.now().toString() + path.extname(file.originalname))
    }
  })
  

  router.get('/image', (req, res, next) => {
    const flashMessages = req.flash('success');
    res.render('user/image',{flashMessages:flashMessages});
  }) 


  router.get('/profile', isLoggedIn, (req, res, next) => {
    const flashMessages = req.flash('success');
    var user= req.user
    console.log('message',user )
      res.render('user/profile',{flashMessages:flashMessages, user: user});
    }) 



  router.post('/profile',  (req, res, next) => {
            console.log('calling upload');
            var upload = multer({
            storage: storage
          }).single('pic')
          upload(req, res, function(err) {
            if(err) {
              req.flash('error', 'Photo not uploaded please try after some time');
              res.redirect('/user/image');
            }
            req.flash('success','Photo is uploaded successfully.');
            // res.json({
            //   success:true,
            //   message:'image uploaded'
            // })
            // console.log(req.file.fieldname)
            res.render('user/profile');
      })
  });


  router.get('/logout', isLoggedIn, (req, res, next)=>{
    req.logout();
    res.redirect('/');
  });


// router.use('/', notLoggedIn, (req, res, next) => {
//   next();
// });



  router.get('/signup',(req, res, next)=>{
      var messages = req.flash('error');
      res.render('user/signup', {csrfToken: req.csrfToken(), user: req.user, messages:messages, hasErrors:messages.length > 0});
    });


  router.post('/signup', passport.authenticate('local.signup',{
      failureRedirect: '/user/signup',
      failureFlash : true
    }), (req, res, next) => {
      if( req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
      } else {
        res.redirect('/user/profile');
      }
    });


  router.get('/signin',(req, res, next)=>{
    var messages = req.flash('error');
    res.render('user/signin', {csrfToken: req.csrfToken(),user: req.user,messages:messages, hasErrors:messages.length > 0});
  });



  router.post('/signin', passport.authenticate('local.signin',{
      // successRedirect : '/user/profile',
      failureRedirect: '/user/signin',
      failureFlash : true
    }) ,(req, res, next) => {
      if( req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
      } else {
        res.redirect('/user/profile');
        // res.render('user/profile',{user:req.user});
      }
    });
//,(req,res,next) => {
//   Users.find({email:req.body.email}).then((user) => {
//     {
//       console.log('hey i m here');
//       console.log('user',user);
//     //  return res.send(user);
//     res.render('user/profile',{user:user});
//     //  res.redirect('/user/profile')

//       // res.redirect('/user/profile', {user:user});
//       // res.redirect(user, '/user/profile')
//       // res.redirect('/user/profile').send(user);
//     }
//   });
// });



  router.get('/forgot',(req, res, next)=>{
    var messages = req.flash('error');
    res.render('user/forgot', {
      messages:messages, hasErrors:messages.length > 0,
      csrfToken: req.csrfToken()
    });
  });

 router.post('/forgot',(req, res, next) => {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      
  function(token, done) {
        Users.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/user/forgot');
          }
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: '',
            pass: ''
          },
          tls: {
            rejectUnauthorized : false
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'sachin.yadav@infiny.in',
          subject: 'Node.js Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/user/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          // done(err, 'done');
          res.redirect('/book')
        });
      }
    ], function(err) {
      if (err)
       return next(err);
      res.redirect('/user/forgot');
    });
  });



  router.get('/reset/:token', function(req, res) {
    console.log('reset');
    Users.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: new Date() } }, function(err, user) {
     if (!user) {
       req.flash('error', 'Password reset token is invalid or has expired.');
       return res.redirect('/user/forgot');
     }
     console.log('message', user);
     res.render('user/reset_password', {
       user:user,
       csrfToken: req.csrfToken()
     });
   });
  });
  



  router.post('/reset/:token', function(req, res) {
    console.log(req.params.token);
    console.log('req.params.token');
    async.waterfall([
      function(done) {
        Users.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: new Date() } }, function(err, user) {
          console.log('error', err);
          console.log('user', user);
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/user/forgot');
          }
          console.log('user found');
          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
          console.log('user saved');
          user.save(function(err, user) {
            // req.logIn(user, function(err) {
            //   done(err, user);
            // });
            if(err) {
              console.log('error', err);
              res.send(err);
            }
            done(null, user);
          });
        });
      },
  
      function(user, done) {
        console.log('hii');
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: 'sachin.yadav@infiny.in',
            pass: 'infiny@123'
          },
          tls: {
            rejectUnauthorized : false
          }
        });
        console.log('after smtp');
        var mailOptions = {
          to: user.email,
          from: 'sachin.yadav@infiny.in',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        console.log('mail generated');
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'Success! Your password has been changed.');
          res.redirect('/book')
          // done(err);
        });
      }
    ], function(err) {
      res.redirect('/');
    });
  });
  



  router.get('/change_password',(req, res, next)=>{
    var messages = req.flash('error');
    res.render('user/change_password', {
      messages:messages, hasErrors:messages.length > 0,
      csrfToken: req.csrfToken()
    });
  });
      



  router.post('/change_password',(req, res, next) => {
    console.log('i inside');
    async.waterfall([
      function(done) {
        var otp = randomString({length: 4, numeric: true, letters: false,
          special: false,});
        console.log(otp);
        done(null, otp);
      },
      
    function(otp, done) {
      console.log('otp',otp);
        Users.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/user/changepassword');
          }
          user.changePasswordOtp = otp;
          user.changePasswordExpires = Date.now() + 3600000; // 1 hour
          user.save(function(err) {
            done(err, otp, user);
          });
        });
      },
      function(otp, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: 'sachin.yadav@infiny.in',
            pass: 'infiny@123'
          },
          tls: {
            rejectUnauthorized : false
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'sachin.yadav@infiny.in',
          subject: 'Node.js Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/user/change/' + otp + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          // done(err, 'done');
          res.redirect('/book')
        });
      }
    ], function(err) {
      if (err)
       return next(err);
      res.redirect('/user/change_password');
    });
  });


  router.get('/change/:otp', function(req, res) {
    console.log('reset');
    Users.findOne({ changePasswordOtp: req.params.otp, changePasswordExpires: { $gt: new Date() } }, function(err, user) {
     if (!user) {
       req.flash('error', 'Password reset token is invalid or has expired.');
       return res.redirect('/user/change_password');
     }
     console.log('message', user);
     res.render('user/set_password', {
       user:user,
       csrfToken: req.csrfToken()
     });
   });
  });
  

  router.post('/change/:otp', function(req, res) {
    console.log(req.params.otp);
    console.log('req.params.otp');
    async.waterfall([
      function(done) {
        Users.findOne({ changePasswordOtp: req.params.otp, changePasswordExpires: { $gt: new Date() } }, function(err, user) {
          console.log('error', err);
          console.log('user', user);
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/user/change_password');
          }
          console.log('user found');
          user.password = req.body.password;
          user.changePasswordOtp = undefined;
          user.changePasswordExpires = undefined;
          console.log('user saved');
          user.save(function(err, user) {
            // req.logIn(user, function(err) {
            //   done(err, user);
            // });
            if(err) {
              console.log('error', err);
              res.send(err);
            }
            done(null, user);
          });
        });
      },
  
      function(user, done) {
        console.log('hii');
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: 'sachin.yadav@infiny.in',
            pass: 'infiny@123'
          },
          tls: {
            rejectUnauthorized : false
          }
        });
        console.log('after smtp');
        var mailOptions = {
          to: user.email,
          from: 'sachin.yadav@infiny.in',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        console.log('mail generated');
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'Success! Your password has been changed.');
          res.redirect('/book')
          // done(err);
        });
      }
    ], function(err) {
      res.redirect('/');
    });
  });



module.exports = router;

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()){
      return next();
  }
  res.redirect('/');
}

 function notLoggedIn(req, res, next) {
if(!req.isAuthenticated()){
    return next();
}
res.redirect('/');
}
