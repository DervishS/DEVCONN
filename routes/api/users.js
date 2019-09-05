const express = require('express');
const router = express.Router();
const gravatar = require('gravatar'); //updated it (npm install gravatar does update it if installed priror)
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check');

const User = require('../../models/User');

// @route  POST api/users
// @desc   register user
// @acces  Public
router.post(
  '/',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); //400 wiq is a bad request
    }

    const { name, email, password } = req.body;

    try {
      // see if user exists (send back an error)
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }
      // get users gravatar
      const avatar = gravatar.url(email, {
        s: '200', //default size
        r: 'pg', //rating PG no naked ppl :)
        d: 'mm' // default = it gives a default image (user icon)
      }); // ; ???

      user = new User({
        name,
        email,
        avatar,
        password
      }); // this creates just an instance of the user it doesn't save it we have to vall user.save()
      // encrypt password (using bcrypt)
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save(); // anything that returns a promise you put await in front off
      //this is more elegant and looks pretty clearly wahts going on!
      // return jsonwebtoken (i wantd user to be loged in right away)
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
