const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config/jwt.config');
const User = require('../models/User');
const bcrypt = require("bcrypt");

// Registering User
exports.register = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        // Generate hash for the password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt); // Use the user-provided password

        // Check if user already exists
        const userExists = await User.findOne({ username: username });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        // Create a new user document
        const newUser = new User({ name, username, email, password: password, isActive: false });
        await newUser.save();

        // Generate JWT token for the newly registered user
        const token = jwt.sign({ userId: newUser._id }, SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Login User
exports.login = async (req, res) => {
    // console.log(req.body);
    try {
        const { username, password } = req.body;
        // console.log(username);
        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }


        // Compare the user-provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password); // Compare the hashed password
        if (!isMatch) {
            return res.status(401).json({
                error: "Invalid Credentials"
            });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '10h' });

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Logout (empty implementation)
exports.logout = async (req, res) => {
    // Implement logout if needed
}
