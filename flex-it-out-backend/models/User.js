const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Regular expressions for validation
const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
const phoneRegex = /^[0-9]{10,15}$/;

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true, // Allows either email or phone
      lowercase: true,
      trim: true,
      match: emailRegex, // Validate email format
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      match: phoneRegex, // Validate phone number format
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6, // Enforce password length
    },

    avatar: {
      type: String,
      default: "",
    },

    score: {
      type: Number,
      default: 0,
    },

    streak: {
      type: Number,
      default: 0,
    },

    calories: {
      type: Number,
      default: 0,
    },

    membership: {
      plan: {
        type: String,
        enum: ["basic", "premium", "student"],
        default: "basic",
      },
      expiresAt: {
        type: Date,
        default: null,
      },
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically creates and updates `createdAt` & `updatedAt`
  }
);

// Ensure either email or phone is provided
UserSchema.pre("validate", function (next) {
  if (!this.email && !this.phone) {
    return next(new Error("Either email or phone must be provided."));
  }
  next();
});



// Compound index for optimized searches
UserSchema.index({ email: 1, phone: 1 });

module.exports = mongoose.model("User", UserSchema);
