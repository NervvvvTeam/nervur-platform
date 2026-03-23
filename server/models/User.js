const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  role: { type: String, enum: ["admin", "client"], default: "client" },
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date }
});

// Note: unique index on email is already created by { unique: true } in the schema field definition.
// No need for a separate userSchema.index() call — that would cause duplicate index warnings.

module.exports = mongoose.model("User", userSchema);
