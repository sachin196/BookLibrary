var express = require('express');
var router = express.Router();
var passport=require('passport');
var path = require('path');
var multer = require('multer');
var Users = require('../models/user');

// var csrf = require('express-csurf');
// var csrfProtection = csrf();
// router.use(csrfProtection);


const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads')
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
    res.render('user/profile',{flashMessages:flashMessages});
  }) 

router.post('/profile', isLoggedIn, (req, res, next) => {
  console.log('calling upload');
  var upload = multer({
		storage: storage
	}).single('pic')
	upload(req, res, function(err) {
    if(err) {
      req.flash('error', 'Photo not uploaded please try after some time');
      res.redirect('/user/image');
    }
    // req.flash('success','Photo is uploaded successfully.');
    // res.redirect('/user/profile');
    console.log(req.file.filename)
    res.render('user/profile',{
      msg:'File Uploaded',
      file:`uploads/${req.file.filename}`
  });
	})
});


router.get('/logout', isLoggedIn, (req, res, next)=>{
  req.logout();
  res.redirect('/');
});

router.use('/', notLoggedIn, (req, res, next) => {
  next();
});


router.get('/signup',(req, res, next)=>{
    var messages = req.flash('error');
    res.render('user/signup', { messages:messages, hasErrors:messages.length > 0});
  });

router.post('/signup', passport.authenticate('local.signup',{
  successRedirect : '/user/profile',
  failureRedirect: '/user/signup',
  failureFlash : true
}));

router.get('/signin',(req, res, next)=>{
  var messages = req.flash('error');
  res.render('user/signin', {messages:messages, hasErrors:messages.length > 0});
});

router.post('/signin', passport.authenticate('local.signin',{
  successRedirect : '/user/profile',
  failureRedirect: '/user/signin',
  failureFlash : true
}));
 
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