const { verifyToken } = require('./jwtUtils');

const authMiddleware = async (req, res, next) => {
    try {
        // Get the token from the Authorization header
        const token = req.header('Authorization').replace('Bearer ', '');
        if (!token) {
            throw new Error('Authentication failed');
        }

        // Verify the token
        const decoded = verifyToken(token);
        req.userId = decoded.userId; // Attach the user ID to the request object

        next();
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed', error: error.message });
    }
};

module.exports = authMiddleware;