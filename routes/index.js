var express = require('express');
var router = express.Router();

var Genre = require('../models/genre');


router.get('/', (req, res, next) => {
 res.render('shop/index');
});



// router.get('/signup',(req, res, next)=> {
//   res.status(500).json({
//       message : 'email id already exist'
//   })
// });

// router.get('/user',(req, res, next)=> {
//  Users.find().then((users) => {
//   res.send({users});
//  },(e) => {
//    res.status(400).send(e);
//  });
// });

// router.post('/signin', passport.authenticate('local.signin',{
//   successRedirect : '/user',
//   failureRedirect: '/signup'
// }));


// router.get('/user/:id',(req, res)=> {
//   var userId = req.params.id ;
//   Users.findById(userId).then((user) => {
//     res.send({user});
//    },(e) => {
//      res.status(400).send(e);
//    });
// });

module.exports = router;
