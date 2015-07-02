var User = require('../models/user-model');

exports.listUsers = function(req,res){
    User.find(function(err,list){
        if(err)
            res.json(400,err.message);
        res.json(list);
    });
}

exports.insertUser = function(req,res){
    var user = new User(req.body);
    user.save(function(err,newUser){
        if(err){
            console.log(err);;
            if(err.errors){
                if(err.errors.nome) {
                    err = err.errors.nome.message;
                }
            }
            res.status(400).json(err);
        } else {
            res.json({message : 'Usuário incluído com sucesso.'});
        }
    });
};