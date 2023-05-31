import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) {
    return res.sendStatus(401);
  }

  console.log(token);
  
  token = token.slice(7);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.sendStatus(403);
    }
    
    req.user = decoded;
    next();
  });
};

export default verifyToken;
