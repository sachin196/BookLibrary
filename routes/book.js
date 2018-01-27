var express = require('express');
var router = express.Router();
var fs = require('fs');
var dateFormat = require('dateformat');
var now = new Date();
var path = require('path');
var multer = require('multer');
var mime = require('mime');
var crypto = require('crypto');
// var expressHbs = require('express-handlebars');
// var paginateHelper = require('express-handlebars-paginate');
// expressHbs.Template.registerHelper('paginateHelper', paginateHelper.createPagination);

var Book = require('../models/book');
var Genre = require('../models/genre');



function base64_encode(file) {
  // read binary data
  var bitmap = fs.readFileSync(file);
  // convert binary data to base64 encoded string
  return new Buffer(bitmap).toString('base64');
}

console.log('message', dateFormat(now, "isoDateTime"));


  const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads/')
      },
    //     filename: function(req, file, callback) {
    //     callback(null, file.fieldname + '_' + Date.now().toString() + path.extname(file.originalname))
    // }
    filename: function(req, file, cb) {
      crypto.randomBytes(8, function(err, raw) {
          cb(null, raw.toString('hex') + Date.now().toString() + path.extname(file.originalname));
      });
    }
  });

  const fileFilter = (req, file, cb)=>{
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg')
      {
          cb(null,true);
        } else {
          cb(null,false);
      }
  };

  const upload = multer({
    storage: storage,
      limits:{
        fileSize:1024 * 1024 * 5
      },
      fileFilter : fileFilter
  });


  router.get('/', (req, res, next) => {
      const flashMessages = req.flash('success');
      console.log('flash', flashMessages);
      var perPage = 10
      var page = req.params.page || 1

      const book = Book.find({})
      .populate('genre')
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .exec(function(err, book) {
      Book.count().exec(function(err, count) {
            if (err) return next(err)
            res.render('shop/book', {
                user:req.user,
                book: book,
                current: page,
                pages: Math.ceil(count / perPage),
                flashMessages:flashMessages,
                // pagination: { page: currentPage, limit:PageLimit,totalRows: TotalNoOfROWS }
                });
        });
    });

    
    // .then((book) => {
    //     console.log(book);
    //     return  res.render('shop/book', { book: book ,flashMessages:flashMessages});
    //     }, (err) => {
    //     throw err
    //     });
  });


  router.get('/add', (req, res, next) => {
    const flashMessages = req.flash('error');
      console.log('flash', flashMessages);

      if( flashMessages.length > 0) {
          console.log('hiii');
          res.render('shop/addbook',{flashMessages :flashMessages} );
      } else {
          const genres = Genre.find({}).exec()
        .then((genres) => {
          console.log("got genre list");
          res.render('shop/addBook', { genres : genres, user:req.user});
      });
      }
  });
   

  router.post('/add',upload.single('imagePath'),(req, res, next) => {
      req.checkBody('name', 'Name is required').notEmpty()
      req.checkBody('description', 'Description is required').notEmpty()
      req.checkBody('author', 'author is required').notEmpty()
      req.checkBody('genre', 'Genre is required').notEmpty();
      var errors =req.validationErrors();
        if(errors){
            var messages =[];
                errors.forEach((error) =>{
                messages.push(error.msg);
            });
                req.flash('error', messages);
                console.log('error occured and redirected');
                return res.redirect('/book/add');
        } else {
        //   var image = base64_encode(req.file.path);
        //  var data_url =("data:image/jpg;base64,"+ image);
        const newBook = new Book({
          name : req.body.name ,
          description : req.body.description ,
          author : req.body.author,
          imagePath : req.file.path,
          genre : req.body.genre ,
          price : req.body.price 
        })
        .save()
        .then((data) => {
          console.log('book is created');
          req.flash('success','book added successfully.');
          return res.redirect('/book');
          })
      .catch((errors) => {
      console.log('oops...');
      console.log(('error'), error);
          });
    }
  });
    
    
router.get('/show/:id',async(req, res, next) => {
  console.log('hii i m here in show book');
    const book = await Book.findById({ _id: req.params.id })
    .populate('genre')
    .exec()
    .then((book) => {
      console.log(book);
      res.render('single_book', { book:book, user:req.user });
    })
    .catch((err) => {
     throw err
    });
});

  router.get('/delete/:id',isLoggedIn, (req, res, next) => {
      console.log('hii i m here in delete book');
      Book.findByIdAndRemove({ _id: req.params.id },(err, book)=> {
          if(err) {
            res.send(err);
          }
          req.flash('success','Book Deleted successfully.');
          res.redirect('/book');
      })
  });

router.get('/update/:id/',isLoggedIn, (req, res, next) => {
    const book = Book.findById({_id:req.params.id}).populate('genre').then((book) => {
      console.log(book);
      const genres = Genre.find({}).exec()
      .then((genres) => {
        console.log(genres);
        res.render('shop/updatebook', { book: book, genres : genres, user:req.user,  helpers: {
        inGenre:  id => book.genre.findIndex( el => el._id.toString() == id ) > -1 ? 'checked' : '' } //created a helper function which will check for the id passed and will match with id present in genre collection 
                                                                                                            //if the id matches then the particular id will be checked other with it will be empty;
        });
      });
    }, (err) => {
    throw err
    });
});

router.post('/update/:id/',upload.single('imagePath'),(req, res, next) => {
  console.log('hii i m here in update book');
    Book.findById({_id:req.params.id}, (err, book) => {
    book.name = req.body.name || book.name;
    book.description = req.body.description || book.description;
    book.author = req.body.author || book.author;
    book.imagePath = req.file.path || book.path;
    book.genre = req.body.genre || book.genre;
    // book.name = req.body.name ,
    // book.description = req.body.description ,
    // book.author = req.body.author,
    // // book.imagePath = req.file.path ,
    // book.genre = req.body.genre 
    book.save((err, book) => {
      if (err) {
          res.status(500).send(err)
      }
      console.log(book);
      req.flash('success','book Updated successfully.');
     res.redirect('/book');
  });
  });
});


    
module.exports =router;

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()){
      return next();

  }
  req.session.oldUrl = '/book'+req.url;
  res.redirect('/user/signin');
}