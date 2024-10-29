import { config } from "../config.js";

const verifyPin = (req, res, next) => {
  const { pin } = req.body;
  console.log("sprawdzam pin");
  if (!pin) {
    console.log("nie ma pinu");
    return res.status(400).json({
      success: false,
      message: "Pin is required",
    });
  }

  if (pin !== config.pin) {
    console.log("zły pin");
    return res.status(403).json({
      success: false,
      message: "Invalid PIN. Access denied.",
    });
  }

  // console.log("dobrze");
  // res.status(200).json({
  //   success: true,
  //   message: "PIN verified successfully.",
  // });

  next();
};

export default verifyPin;