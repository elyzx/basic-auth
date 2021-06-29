const { Schema, model } = require("mongoose");
// short hand version of:
// const mongoose = require("mongoose");
// let mySchema = new mongoose.Schema

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    // unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

const User = model("User", userSchema);

module.exports = User;
