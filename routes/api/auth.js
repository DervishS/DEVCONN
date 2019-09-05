const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth'); // ../ out of api ../ out of routes to /middleware/auth

const User = require('../../models/User');
const { check, validationResult } = require('express-validator/check');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');

// @route  GET api/auth
// @desc   Test route
// @acces  Public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route  POST api/auth
// @desc   authenticate user and get token
// @acces  Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); //400 wiq is a bad request
    }

    const { email, password } = req.body;

    try {
      // see if user exists (send back an error)
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

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
