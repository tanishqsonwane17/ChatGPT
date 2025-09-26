const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


async function registerUser(req, res) {
    try {
        // Flexible destructure: frontend ke format ke hisaab se
        const email = req.body.email;
        const password = req.body.password;

        const firstName = req.body.fullName?.firstName || req.body.firstname;
        const lastName = req.body.fullName?.lastName || req.body.lastname;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            fullName: { firstName, lastName },
            email,
            password: hashedPassword
        });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                email: user.email,
                _id: user._id,
                fullName: user.fullName
            }
        });
    } catch (err) {
        console.error("REGISTER ERROR:", err);
        res.status(500).json({ message: err.message });
    }
}


async function loginUser(req, res) {

    const { email, password } = req.body;

    const user = await userModel.findOne({
        email
    })

    if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);


    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);


    res.cookie("token", token);


    res.status(200).json({
        message: "user logged in successfully",
        user: {
            email: user.email,
            _id: user._id,
            fullName: user.fullName
        }
    })

}


module.exports = {
    registerUser,
    loginUser
}