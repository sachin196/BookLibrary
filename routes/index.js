var express = require('express');
var router = express.Router();

var Genre = require('../models/genre');
var Cart = require('../models/cart');
var Order = require('../models/order');
var Book = require('../models/book');


    router.get('/', (req, res, next) => {
    res.redirect('/book')
    });



    router.get('/add-to-cart/:id',(req, res, next) => {
        console.log('hiii')
        var bookid = req.params.id;
        var cart = new Cart(req.session.cart ? req.session.cart :  {});

        Book.findById({_id:bookid},(err, book) => {
        if(err) {
            console.log('error occurred');
            console.log(err);
            return res.redirect('/book');
        }
        console.log('hey its working');
        cart.add(book, book.id);
        req.session.cart = cart;
        console.log(req.session.cart);
        res.redirect('/');
        });
        });



    router.get('/shopping-cart',(req, res, next) => {
      if(!req.session.cart) {
       return res.render('shop/shopping-cart', {books:null,  user: req.user});
      }
      var cart = new Cart(req.session.cart);
      return res.render('shop/shopping-cart', {books: cart.generateArray(), totalPrice: cart.totalPrice, user:req.user});
    });



    router.get('/reduce/:id', function(req, res, next) {
      var bookid = req.params.id;
      var cart = new Cart(req.session.cart ? req.session.cart : {});
    
      cart.reduceByOne(bookid);
      req.session.cart = cart;
      res.redirect('/shopping-cart');
    });
    


    router.get('/remove/:id', function(req, res, next) {
      var bookid = req.params.id;
      var cart = new Cart(req.session.cart ? req.session.cart : {});
    
      cart.removeItem(bookid);
      req.session.cart = cart;
      res.redirect('/shopping-cart');
    });
    


    router.get('/checkout', isLoggedIn, (req, res, next) => {
      if(!req.session.cart) {
        return res.redirect('/shopping-cart');
       }
       var cart = new Cart(req.session.cart);
       var errMsg = req.flash('error')[0];
       return res.render('shop/checkout',{total: cart.totalPrice, errMsg: errMsg, noError:!errMsg, user:req.user});
    });
    



    router.post('/checkout',isLoggedIn, (req, res, next) => {
      console.log('checkout post');
      if(!req.session.cart) {
        return res.redirect('/shopping-cart');
       }
       var cart = new Cart(req.session.cart);
       var stripe = require("stripe")(
        "sk_test_VXifb0wJkwuy2YGeb8CWjT62"
      );
      
      stripe.charges.create({
        amount: cart.totalPrice * 100,
        currency: "inr",
        source: req.body.stripeToken, // obtained with Stripe.js
        description: "test Charge"
      }, function(err, charge) {
        if(err) {
          console.log(err)
          req.flash('error', err.message);
          return res.redirect('/checkout');
        }
        var order = new Order ({
          user : req.user,  //passport place the user in user when ever we request
          cart : cart,
          address : req.body.address,
          name : req.body.name,
          paymentId : charge.id
        });
        order.save((err, result)=>{
          console.log(result);
          req.flash('success','Order Successfully Placed!');
          req.session.cart = null;
          res.redirect('/book');
        });
    
        });
    });

    

module.exports = router;

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
  
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
  }