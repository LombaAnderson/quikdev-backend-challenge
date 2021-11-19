const mongoose = require('mongoose')

const User = mongoose.model('User', {
      name: String,
      username: String,
      birthdate: Number,
      address: String,
      addressNumber: Number,
      primaryPhone: Number,
      description: String,
      createdAt: Number,
      password: String,
      confirmpassword: String
})

module.exports = User