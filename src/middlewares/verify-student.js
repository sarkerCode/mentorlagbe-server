const verifyStudent = (req, res, next) => {
  if (req.user?.role !== "student") {
    return res.status(403).json({
      success: false,
      message: "Student access only.",
    });
  }

  next();
};

export default verifyStudent;