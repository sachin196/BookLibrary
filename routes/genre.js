var express = require('express');
var router = express.Router();

var Genre = require('../models/genre');

router.get('/', (req, res, next) => {
    const flashMessages = req.flash('success');
    console.log('flash', flashMessages);
  
    if (flashMessages.error) {
      res.render('shop/add_genre', {
        showErrors: true,
        errors: flashMessages.error
      });
    }
    const genres = Genre.find({}).then((genres) => {
        console.log(genres);
        res.render('shop/genre', { genres: genres ,flashMessages:flashMessages,user:req.user});
    }, (err) => {
      throw err
    })
  });

router.get('/add', (req, res , next) => {
    res.render('shop/add_genre',{user:req.user});
});

router.post('/add',(req, res, next) => {
        req.checkBody('name', 'Name is required').notEmpty()
        const errors = req.validationErrors();
        if (errors) {
        console.log(errors);
        return res.render('shop/add_genre');
        }
    console.log('inside post');
    var name = req.body.name ;
    Genre.findOne({'name':name}, function(err, genre)  {
        if (err) {
            console.log(err)
            return res.render('shop/add_genre');
          }
        if(genre){
             console.log('Category is already available');
             return res.render('shop/add_genre');
        }
        var newGenre = new Genre ();
            newGenre.name = name;
            newGenre.save(function(err, result){
                if(err){
                     res.send(err);
                }
                console.log('new genre created');
                req.flash('success','genre added successfully.');
                return res.redirect('/genre');
            });
    });
});

router.get('/delete/:id/', isLoggedIn, (req, res, next) => {
    console.log('hii i m here in delete book');
     Genre.findByIdAndRemove({ _id: req.params.id },(err, genre)=> {
       if(err) {
         res.send(err);
       }
       req.flash('success','Genre Deleted successfully.');
      res.redirect('/genre');
     })
  });

router.get('/update/:id/',isLoggedIn, (req, res, next) => {
    console.log('hii i m here in delete book');
    const genres = Genre.findById({_id:req.params.id}).populate('genre').then((genres) => {
      console.log(genres);
      res.render('shop/updategenre', { genres: genres, user:req.user });
  }, (err) => {
    throw err
  });
  });

router.post('/update/:id/',(req, res, next) => {
    console.log('hii i m here in update book');
      Genre.findById({_id:req.params.id}, (err, genre) => {
        genre.name = req.body.name || book.name;
        genre.save((err, book) => {
        if (err) {
            res.status(500).send(err)
        }
        console.log(book);
        req.flash('success','Genre Updated successfully.');
       res.redirect('/genre');
    });
    });
  });
  


module.exports = router;

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()){
      return next();
  }
  req.flash('success','You need to Login first!!!');
  res.redirect('/genre');
}