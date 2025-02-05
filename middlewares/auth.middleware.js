const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/jwt.config");
const User = require("../models/User");

exports.authMiddleware = async (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token)
    return res.status(401).send({
      error: "Unauthorized",
    });
  try {
    const _token = token && token.split(" ")[1];
    const decoded = jwt.verify(_token, SECRET_KEY);
    const user = await User.findById(decoded.userId).populate({
      path: 'role',
      populate:{
        path: 'permissions'
      }
    });
    if (!user || !user.isActive)
      return res.status(403).json({
        message: "Access denied",
      });

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    
    res.status(401).send({
      error: "Invalid token : ",
      token,
    });
  }
};

exports.checkPermission =
  (requiredRole, requiredPermission) => async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).populate({
        path: "role",
        populate: {
          path: "permissions",
          select: "name",
        },
      });

      if (!user)
        return res.status(404).json({
          message: "User not found",
        });

      //
      if (requiredRole !== user.role.name)
        return res.status(403).json({
          message: "Access denied",
        });
      const userPermissions = user.role?.permissions.map((p) => p.name) || [];
      if (!userPermissions.includes(requiredPermission)) {
        return res.status(403).json({
          message: "Access denied",
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  };
