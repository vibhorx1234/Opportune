// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const Company = require('../models/Company');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Initialize clean user object
    req.user = null;
    req.company = null;

    // Company authentication
    if (decoded.company?.id) {
      const company = await Company.findById(decoded.company.id).select('-password');
      if (!company) throw new Error('Company not found');
      
      req.company = company;
      req.user = { // Maintain backward compatibility
        id: company._id,
        isCompany: true,
        isAdmin: false
      };
    }
    // User authentication (with admin support)
    else if (decoded.user?.id) {
      const user = await User.findById(decoded.user.id).select('-password');
      if (!user) throw new Error('User not found');
      
      req.user = {
        ...user.toObject(), // Include all user properties
        isAdmin: user.isAdmin,
        isCompany: false
      };
    }
    // Backward compatibility for old tokens
    else if (decoded.userId?.id) {
      const user = await User.findById(decoded.userId.id).select('-password');
      if (!user) throw new Error('User not found');
      
      req.user = {
        ...user.toObject(),
        isAdmin: user.isAdmin,
        isCompany: false
      };
    }
    else {
      throw new Error('Invalid token structure');
    }

    console.log('Authentication successful:', { 
      user: req.user ? { id: req.user.id, isAdmin: req.user.isAdmin } : null,
      company: req.company ? { id: req.company.id } : null
    });
    
    next();
  } catch (err) {
    console.error('Authentication error:', err.message);
    res.status(401).json({ 
      msg: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
};



// // backend/middleware/auth.js
// const jwt = require('jsonwebtoken');
// const Company = require('../models/Company');
// const User = require('../models/User');

// module.exports = async (req, res, next) => {
//   // Get token from header
//   const token = req.header('Authorization')?.replace('Bearer ', '');

//   if (!token) {
//     return res.status(401).json({ msg: 'No token, authorization denied' });
//   }

//   try {
//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log('Decoded token:', decoded);

//     // Check for company
//     if (decoded.company) {
//       req.company = await Company.findById(decoded.company.id).select('-password');
//       return next();
//     }

//     // Check for user
//     if (decoded.user) {
//       req.user = await User.findById(decoded.user.id).select('-password');
//       return next();
//     }

//     if (decoded.userId) {
//       req.user = await User.findById(decoded.userId.id).select('-password');
//       return next();
//     }

//     throw new Error('Invalid token');
//   } catch (err) {
//     console.error('Token verification error:', err);
//     res.status(401).json({ msg: 'Token is not valid' });
//   }
// };
