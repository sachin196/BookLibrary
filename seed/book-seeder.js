var mongoose =require('mongoose');

mongoose.connect('mongodb://localhost:27017/LibraryApp',(err,LibraryApp )=> {
  if(err) {
    console.log(err);
  } else {
    console.log('connected to mongoDb');
  }
});

var Book = require('../models/book');

var books =[
    {
        title:'Go with your gut',
        author:'Robyn Youkilis',
        publisher:' Kyle Cathie Limited',
        categories:'Health',
        price:'200',
        ISBN:'9781909487352',
        pages:'192'
    },
    {
        title:'Napoleon: The Spirit of the Age: 1805-1810 ',
        author:'Michael Broers ',
        publisher:'Pegasus Books',
        categories:'History',
        price:'400',
        ISBN:' 9781681776699',
        pages:'544'
    },
    {
        title:'THE CHARM OF REVENGE',
        author:'TOM SECRET',
        publisher:' TOM SECRET LLC',
        categories:'Thriller',
        price:'192',
        ISBN:'9781520263120',
        pages:'273'
    },
    {
        title:'Into the Drowning Deep',
        author:'Mira Grant',
        publisher:'Orbit',
        categories:'Horror',
        price:'500',
        ISBN:'9780316379403',
        pages:'440'
    },
    {
        title:'Cloaked in Shadow',
        author:'Ben Alderson',
        publisher:'Oftomes Publishing',
        categories:'fantasy',
        price:'800',
        ISBN:'9781999706869',
        pages:'350'
    }];

    Book.insertMany(books,(err,doc)=>{
       if(err) {
        console.log(err);
       } else {
        console.log(doc);
       }
    });