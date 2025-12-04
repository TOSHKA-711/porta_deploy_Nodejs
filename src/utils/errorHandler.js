export const errorHandler = (api) => {
  return async (req, res, next) => {
    try {
      await api(req, res, next);
    } catch (err) {
      // If a response was already started, just log the error
      if (res.headersSent) {
        console.error("Internal Error after response sent:", err);
        return;
      }

      console.error("Internal Error:", err);
      res.status(500).json({ message: "Failed", err });
    }
  };
};

export const globalError = (err, req, res, next) => {
  if (!err) return next();

  // Avoid sending headers twice
  if (res.headersSent) {
    console.error("Global error after headers sent:", err);
    return;
  }

  return res.status(err.cause || 500).json({ message: err.message });
};
