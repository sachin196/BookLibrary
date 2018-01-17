var mongoose =require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;

var userSchema = new Schema({
        email : {
            type :String ,
            required : true
        },
        password : {
            type :String ,
            required : true
        }
});


userSchema.methods.encryptpassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(7));
};

userSchema.methods.validpassword = function(password) {
//    console.log(password);
//    console.log(this.password);
//    console.log( bcrypt.compareSync(password, this.password))
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);