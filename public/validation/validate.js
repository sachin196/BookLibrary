$.validator.addMethod("pwcheck", function(value) {
    return /^[A-Za-z0-9\d=!\-@._*]*$/.test(value) // consists of only these
        && /[a-z]/.test(value) // has a lowercase letter
        && /\d/.test(value) // has a digit
 });

$(document).ready(function() {
    $("#sign-Form").validate({
        rules : {
            email : {
                required : true ,
                email : true
            },
            password : {
                required : true ,
                pwcheck:true,
                minlength: 8
            },
            confirm : {
                equalTo: "#password" 
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
                email:'please enter a valid email.'
            },
            password : {
                required: 'password field cannot be blank',
                pwcheck: "password must have a lowercase letter and a digit",
                 minlength: "length should not be less than 8 letters!"
            },
            confirm: {
                equalTo: " Enter Confirm Password Same as Password",
                required: 'Confirm password field cannot be blank',
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