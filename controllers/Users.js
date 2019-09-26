let Users = require('../models').Users;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

// Load input validation
const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');

exports.create_user = function(req, res, next) {
  // Form validation
  const { errors, isValid } = validateRegisterInput(req.body);
  //check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  Users.findOne({
    where: { email: req.body.email }
  }).then(user => {
    if (user) {
      return res.status(400).json({ email: 'Email already exists' });
    } else {
      let password = req.body.password;

      //console.log(newUser);
      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) res.status(400).send(error);
          password = hash;
          Users.create({
            name: req.body.name,
            email: req.body.email,
            password: password
          })

            .then(user => res.status(201).json(user))
            .catch(error => res.status(400).send(error));
        });
      });
    }
  });
};
// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
exports.login = function(req, res, next) {
  // Form validation
  const { errors, isValid } = validateLoginInput(req.body);

  //Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  Users.findOne({
    where: { email: req.body.email }
  }).then(user => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ emailnotfound: 'Email not found' });
    }

    // Check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id,
          email: user.email,
          name: user.name
        };

        // Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 31556926 // 1 year in seconds
          },
          (err, token) => {
            res.json({
              success: true,
              token: 'Bearer ' + token
            });
          }
        );
      } else {
        return res
          .status(400)
          .json({ success: false, msg: 'Password incorrect' });
      }
    });
  });
};

exports.show_users = function(req, res, next) {
  Users.findAll()
    .then(data => {
      if (data) {
        res.status(200).json({ data });
      } else {
        res.status(400).json({ Message: 'No data found' });
      }
    })
    .catch(error => res.status(400).send(error));
};

exports.show_user = function(req, res, next) {
  Users.findOne({
    where: {
      id: req.params.id
    }
  })
    .then(user => {
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(400).json({ Message: 'No data found' });
      }
    })
    .catch(error => res.status(400).send(error));
};

exports.edit_user = function(req, res, next) {
  return Users.update(
    {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role
    },
    {
      where: {
        id: req.params.id
      }
    }
  )
    .then(updatedUser => {
      res.status(200).json({
        message: 'User updated successfully',
        data: req.body || updatedUser
      });
    })
    .catch(error => res.status(400).json(error));
};

exports.remove_user = function(req, res, next) {
  return models.Users.findOne({
    where: {
      id: req.params.id
    }
  }).then(user => {
    if (!user) {
      return res.status(404).send('User not found');
    }
    return user
      .destroy()
      .then(() => res.status(204).send('deleted'))
      .catch(error => res.status(400).send(error));
  });
};
