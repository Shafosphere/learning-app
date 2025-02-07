const authorizeList = (req, res, next) => {
    let { page = 1, limit = 50 } = req.query;
  
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
  
    if (isNaN(page) || page < 1) {
      return res.status(400).json({ message: "Invalid page parameter. It must be a positive integer." });
    }
  
    if (isNaN(limit) || limit < 1) {
      return res.status(400).json({ message: "Invalid limit parameter. It must be a positive integer." });
    }
  
    next();
  };
  
  export default authorizeList;
  