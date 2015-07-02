var mongoose = require('mongoose'),
    validate = require('mongoose-validator'),
    extend = require('mongoose-validator').extend,
    uniqueValidator = require('mongoose-unique-validator');


function validaIdade(idade){
    return idade<18;
}

var userSchema = mongoose.Schema({
    nome : {
        type: String,
        required : true,
        unique : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    dataCriacao : {
        type : Date,
        default : new Date
    }
});

userSchema.plugin(uniqueValidator, { message: '{PATH} : {VALUE} já se encontra em uso.' });


var User = mongoose.model('user',userSchema);

module.exports = User;


