const User = require("../models/User");
const { uploadOnCloudinary } = require('../utils/cloudinary.js');

// Get User Profile
exports.getProfile = async (req, res) => {
    try {
      // Find user by ID (from the authenticated user)
      const user = await User.findById(req.user.id).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // Send the user profile along with the membership info
      res.json({
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        score: user.score,
        streak: user.streak,
        calories: user.calories,
        membership: user.membership,  // Include membership details
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    } catch (error) {
      console.error("Error getting profile:", error);
      res.status(500).json({ message: "Server Error" });
    }
  };
  

// Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    // Destructure body for profile data
    const { name, calories, phoneNumber, email } = req.body;
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Validate email and phone number (at least one should be provided)
    if (email && !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    
    if (phoneNumber && !/^[0-9]{10,15}$/.test(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    // Upload profile image if provided
    if (req.file) {
      // Ensure the uploaded file is an image
      if (!req.file.mimetype.startsWith('image')) {
        return res.status(400).json({ message: "File must be an image" });
      }

      const uploadResponse = await uploadOnCloudinary(req.file.path);
      if (uploadResponse) {
        user.avatar = uploadResponse.url;  // Store the uploaded image URL
      }
    }

    // Update fields if provided
    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (email) user.email = email;
    if (calories !== undefined && !isNaN(calories)) user.calories = Number(calories);

    // Update streak (assuming this should be updated based on activity or some other factor)
    if (user.streak < 0) user.streak = 0;

    // Save updated user data
    await user.save();

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
