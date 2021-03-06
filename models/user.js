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
        },
        resetPasswordToken: String,
        resetPasswordExpires: Date,
        changePasswordOtp:Number,
        changePasswordExpires: Date
});


// userSchema.methods.encryptpassword = function(password) {
//     return bcrypt.hash(password, bcrypt.genSalt(5));
// };

// userSchema.methods.validpassword = function(password) {
// //    console.log(password);
// //    console.log(this.password);
// //    console.log( bcrypt.compareSync(password, this.password))
//   return bcrypt.compare(password, this.password);
// };

userSchema.pre('save', function(next) {
    var user = this;
    var SALT_FACTOR = 5;
  
    if (!user.isModified('password')) return next();
  
    bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
      if (err) return next(err);
  
      bcrypt.hash(user.password, salt, null, function(err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  });
  
  userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
      if (err) return cb(err);
      cb(null, isMatch);
    });
  };
  

module.exports = mongoose.model('User', userSchema);