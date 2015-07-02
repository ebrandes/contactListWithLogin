var express = require('express');
var router = express.Router();
var controller = require('../controllers/user-controller');


router.get('/', controller.listUsers);
router.post('/', controller.insertUser);

module.exports = router;