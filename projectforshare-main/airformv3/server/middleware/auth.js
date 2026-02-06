import jwt from "jsonwebtoken";
import usermodel from "../models/usermodel.js";

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        response: false, 
        message: "Access token required" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await usermodel.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ 
        response: false, 
        message: "User not found" 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        response: false, 
        message: "Token expired" 
      });
    }
    
    return res.status(401).json({ 
      response: false, 
      message: "Invalid token" 
    });
  }
};

export default authenticateToken;