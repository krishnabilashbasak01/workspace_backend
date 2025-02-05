const mongoose = require("mongoose");

// Role schema
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  permissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Permission",
    },
  ],
});

// Create Role Model
const Role = mongoose.model("Role", roleSchema);

// Export user and role model
module.exports = Role;
