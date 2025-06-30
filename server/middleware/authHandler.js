import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const token = req.header('Authorization').split(' ')[1];
  if (!token) return res.status(401).send('Access Denied');

  // console.log(token);
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    // console.log(verified);
    
    next();
  } catch (err) {
    console.log(err);
    
    res.status(400).send('Invalid Token');
  }
};
