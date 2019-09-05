const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    // its in the user model so its always accesible
    type: String //the type of string, it allows you to attach a profile image to your email
  },
  date: {
    type: Date,
    default: Date.now // its put in automatically
  }
});

module.exports = User = mongoose.model('user', UserSchema);
