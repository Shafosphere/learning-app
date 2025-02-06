const authorizeData = (req, res, next) => {
    const { patchNumber, wordList } = req.body;
  
    if (patchNumber === undefined && wordList === undefined) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Either patchNumber or wordList must be provided.",
      });
    }
  
    if (patchNumber !== undefined) {
      if (!Number.isInteger(patchNumber) || patchNumber <= 0 || patchNumber >= 1000000) {
        return res.status(400).json({
          success: false,
          message: "Invalid patchNumber. It must be a positive integer.",
        });
      }
    }
  
    if (wordList !== undefined) {
      if (!Array.isArray(wordList) || wordList.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid wordList. It must be a non-empty array.",
        });
      }
    }
  
    next();
  };
  
  export default authorizeData;
  