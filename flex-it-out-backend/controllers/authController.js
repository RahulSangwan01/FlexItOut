const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");





const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        console.log(req.body);
        // Validate required fields
        
        if (!name || !password || (!email && !phone)) {
            return res.status(400).json({ message: "Name, password, and either email or phone are required." });
        }

        

        // Check if a user already exists with the same email or phone
        let user = await User.findOne({ $or: [{ email }, { phone }] });
        if (user) {
            return res.status(400).json({ message: "User with this email or phone already exists." });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the user
        user = new User({
            name,
            email,
            phone,
            password: hashedPassword,
           
        });

        await user.save();

        // Generate JWT Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.status(201).json({
            message: "Registration successful!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email || null,
                phone: user.phone || null,
                
                membership: user.membership,
            },
        });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server error. Please try again." });
    }
};


const loginUser = async (req, res) => {
    try {
        const { emailOrPhone, password, isPhone } = req.body;
  
        // Validate the presence of credentials
        if (!emailOrPhone || !password) {
            return res.status(400).json({ message: "Email/Phone and password are required." });
        }

        // Check if the user exists by email or phone number
        let user;
        if (isPhone) {
            user = await User.findOne({ phone: emailOrPhone }); // Searching by phone number
        } else {
            user = await User.findOne({ email: emailOrPhone }); // Searching by email
        }
  
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
  
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
  
        // Generate JWT Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  
        // Respond with the token and user info (excluding password)
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,  // You can also send phone if required
               
                membership:user.membership,
            },
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server Error", error });
    }
};

module.exports = { registerUser, loginUser };
