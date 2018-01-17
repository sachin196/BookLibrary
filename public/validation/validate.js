$(document).ready(function() {
    $("#sign-Form").validate({
        rules : {
            email : {
                required : true ,
                email : true
            },
            password : {
                required : true 
            },
            name: {
                required: true
                // min : 3
            },
            description: {
                required: true
            },
            author: {
                required: true
            },
            genre: {
                required: true
                // min : 3
            },
            price: {
                number: true,
                required: true
            }
        },
        messages : {
            email : {
                required: 'please enter the email address.',
                email:'please enter a <em>valid<em> email.'
            },
            password : {
                required: 'password field cannot be blank'
            },
            name : {
                required: 'name field cannot be blank'
                // min :'name should consist of 3 words'
            },
            description : {
                required: 'description field cannot be blank'
            },
            author : {
                required: 'author field cannot be blank'
            },
            genre : {
                required: 'genre field cannot be blank'
                // min :'genre should consist of 3 words'
            },
            price : {
                required: 'price field cannot be blank',
                number : 'price should be number'
            } 
        }
    });
});


// $().ready(function() {
//     $("#Addgenre").validate({
//         rules : {
//             name : {
//                 required : true ,
//             }
//         },
//         messages : {
//             name : {
//                 required: 'please enter the genre .',
//             }
//         }
//     });
// });