// src/middleware/errorHandler.js
export default function errorHandler(err, req, res, next) {
    console.error(err);
  
    const status = err.statusCode || 500;
    const code   = err.code       || 'ERR_SERVER';
  
    const response = {
      success: false,
      message: code,
      code
    };
    if (err.details) {
      response.errors = err.details;
    }
  
    res.status(status).json(response);
  }
  