const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
if (mongoose.models.User) {
  // If the 'User' model is already defined, export it directly
  module.exports = mongoose.models.User;
} else {
  // User Schema
  const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    head:{
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profilePicture:{
      type: String,
      default: 'https://avatars.githubusercontent.com/u/124599?v=4'
    }
  });

  // Hash the password before saving the user document
  userSchema.pre("save", async function (next) {
    // Use a regular function to have the correct 'this' context
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });

  // Create User Model
  let User;
  User = mongoose.model("User", userSchema);
  module.exports = User;
}
