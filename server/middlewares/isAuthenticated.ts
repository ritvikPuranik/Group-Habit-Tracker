import { Request, Response, NextFunction } from 'express';

// Middleware to check if the user is authenticated
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
console.log("entered isauthenticated>", req.isAuthenticated());
  if (req.isAuthenticated()) {
    return next(); // Proceed to the next middleware or route handler
  }
  res.status(401).json({ success: false, message: 'Unauthorized: Session is invalid or expired.' });
}

export default isAuthenticated;