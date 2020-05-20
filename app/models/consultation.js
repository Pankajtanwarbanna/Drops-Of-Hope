let mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

let consultationSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    doctor : {
        type : String,
        required : true
    },
    chat : [{
        from : {
            type : String
        },
        to : {
            type : String
        },
        message : {
            type : String
        },
        attachment : {
            type : String
        },
        timestamp : {
            type : String
        }
    }],
    author : {
        type : String,
        required : true
    },
    status : {
        type : String,
        required : true,
        default : 'open'
    },
    timestamp : {
        type : Date,
        required : true
    }
});


module.exports = mongoose.model('Consultation',consultationSchema);
