const checkAuthorization = (req, res, next) => {
  const user = req.user;
  console.log(req.params)
  console.log(user);
  if (!user || req.user.userId != req.params.id) {
    return res.sendStatus(403);
  }
  next();
};

export default checkAuthorization;
