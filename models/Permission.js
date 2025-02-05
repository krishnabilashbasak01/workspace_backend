const mongoose = require("mongoose");

// Permission Schema
const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
});

// Create Permission Model
const Permission = mongoose.model("Permission", permissionSchema);

// Export Permission model
module.exports = Permission;
