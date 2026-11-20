
const errorHandler = (error, req, res, next) => {
  console.error("API Error:", error);

  if (res.headersSent) {
    return next(error);
  }

  const statusCode =
    error.statusCode || error.status || 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Internal server error"
        : error.message || "Something went wrong",
  });
};

export default errorHandler;
