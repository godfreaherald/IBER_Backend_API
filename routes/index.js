let express = require('express');
let router = express.Router();

const jwt = require('jsonwebtoken');
const passport = require('passport');
require('../config/passport')(passport);

const usersController = require('../controllers/Users');
const authentication = passport.authenticate('jwt', { session: false });

router.post('/user', usersController.create_user);
router.post('/user/login', usersController.login);
router.get('/users', authentication, usersController.show_users);
router.get('/user/:id', authentication, usersController.show_user);
router.put('/user/edit/:id', authentication, usersController.edit_user);
router.delete('/user/remove/:id', authentication, usersController.remove_user);

module.exports = router;
