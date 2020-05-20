let mongoose = require('mongoose');
let validate = require('mongoose-validator');
mongoose.set('useCreateIndex', true);

let storyValidator = [
    validate({
        validator: 'isLength',
        arguments: [5,40],
        message: 'Purpose should not have more than {ARGS[1]} characters'
    })
];

let storySchema = new mongoose.Schema({
    story : {
        type : String,
        required : true
    },
    image_url : {
        type : String
    },
    author : {
        type : String,
        required : true
    },
    timestamp : {
        type : Date,
        required : true
    }
});


module.exports = mongoose.model('Story',storySchema);
