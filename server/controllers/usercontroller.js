import usermodel from "../models/usermodel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const register = async (req, res) => {
  console.log("Received body:", req.body);
  
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        response: false, 
        message: "Missing fields" 
      });
    }

    const existingUser = await usermodel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        response: false, 
        message: "Email already exists" 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashpass = await bcrypt.hash(password, salt);
    
    const userdata = {
      name,
      email,
      password: hashpass,
    };

    const newUser = new usermodel(userdata);
    const user = await newUser.save();
    
    console.log("Saved user:", user);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { 
      expiresIn: "24h" // Extended to 24 hours to prevent frequent logouts
    });
    
    res.status(201).json({ 
      response: true, 
      token,
      name: user.name,
      userId: user._id
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ 
      response: false, 
      message: "Error during registration" 
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        response: false, 
        message: "User not found" 
      });
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(400).json({ 
        response: false, 
        message: "Invalid password" 
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { 
      expiresIn: "24h" // Extended to 24 hours to prevent frequent logouts
    });
    
    res.status(200).json({
      response: true,
      message: "Login successful",
      token,
      name: user.name,
      userId: user._id
    });
  } catch (error) {
    res.status(500).json({ 
      response: false, 
      message: error.message 
    });
  }
};

const getProfile = async (req, res) => {
  try {
    // req.user is set by the authenticateToken middleware
    const user = req.user;
    
    res.status(200).json({
      response: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ 
      response: false, 
      message: error.message 
    });
  }
};

export { register, login, getProfile };