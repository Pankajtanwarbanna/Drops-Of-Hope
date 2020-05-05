let mongoose = require('mongoose');
let bcrypt = require('bcrypt-nodejs');
let titlize = require('mongoose-title-case');
let validate = require('mongoose-validator');
mongoose.set('useCreateIndex', true);

let emailValidator = [
    validate({
        validator: 'isEmail',
        message : 'Please type a valid email.'
    }),
];

let passwordValidator = [
    validate({
        validator: 'matches',
        arguments: /^(?=.*[\d])(?=.*[\W]).{8,25}$/,
        message : 'Your password is weak! Password must have one special character, one number and minimum 8 and maximum 25 character'
    }),
    validate({
        validator: 'isLength',
        arguments: [8,25],
        message: 'Password should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

let userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : true
    },
    lastName : {
        type : String,
        required : true
    },
    email : {
        type : String,
        unique : true,
        required : true,
        validate : emailValidator
    },
    profile_url : {
        type : String,
        required : true,
        default : 'default_profile.jpg'
    },
    password : {
        type : String,
        required : true,
        validate : passwordValidator,
        select : false
    },
    active : {
        type : Boolean,
        required : true,
        default : false
    },
    temporarytoken : {
        type : String,
        required : true
    },
    permission : {
        type : String,
        required : true,
        default: 'user'
    }
});

userSchema.pre('save', function (next) {

    let user = this;

    if(!user.isModified('password')) return next();

    bcrypt.hash(user.password, null, null, function(err, hash) {
        // Store hash in your password DB.
        if(err) {
            return next(err);
            //res.send('Error in hashing password');
        } else {
            user.password = hash;
            next();
        }
    });
});

// Mongoose title case plugin
userSchema.plugin(titlize, {
    paths: [ 'firstName','lastName'], // Array of paths
});

// Password compare method
userSchema.methods.comparePassword = function(password){
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User',userSchema);
