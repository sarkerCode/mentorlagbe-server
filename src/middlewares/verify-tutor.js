const verifyTutor = (req, res, next) => {
  if (req.user?.role !== "tutor") {
    return res.status(403).json({
      success: false,
      message: "Tutor access only.",
    });
  }

  next();
};

export default verifyTutor;