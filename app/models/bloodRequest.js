let mongoose = require('mongoose');
let titlize = require('mongoose-title-case');
let validate = require('mongoose-validator');
mongoose.set('useCreateIndex', true);

let mobileNumberValidator = [
    validate({
        validator: 'isLength',
        arguments: [10],
        message: 'Mobile Number should be of {ARGS[0]} digits'
    })
];

let purposeValidator = [
    validate({
        validator: 'isLength',
        arguments: [5,100],
        message: 'Purpose should not have more than {ARGS[1]} characters'
    })
];

let bloodRequestSchema = new mongoose.Schema({
    patientName : {
        type : String,
        required : true
    },
    patientAge : {
        type : Number,
        required: true
    },
    bloodGroup : {
        type : String,
        required : true
    },
    condition : {
        type : String,
        required : true
    },
    requiredDate : {
        type : Date,
        required : true
    },
    unitsRequired : {
        type : Number,
        required : true
    },
    patientGender : {
        type : String,
        required : true
    },
    patientMobile : {
        type : String,
        validate : mobileNumberValidator
    },
    hospitalName : {
        type : String
    },
    hospitalAddress : {
        type : String
    },
    purpose : {
        type : String,
        validate : purposeValidator
    },
    status : {
        type : String,
        default : 'open'
    },
    requestedBy : {
        type : String,
        required : true
    },
    views : [String],
    accepted : [String],
    timestamp : {
        type : Date,
        required : true
    }
});

// Mongoose title case plugin
bloodRequestSchema.plugin(titlize, {
    paths: [ 'patientName','hospitalName', 'hospitalAddress'], // Array of paths
});



module.exports = mongoose.model('BloodRequest',bloodRequestSchema);
