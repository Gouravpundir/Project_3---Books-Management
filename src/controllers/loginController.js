const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const loginUser = async function (req, res) {
  try {
    //Email And Password (Present?/Not)
    let checkEmaillAndPassword = await userModel.findOne({
      email: req.body.email,
      password: req.body.password,
    });
    //bcz findOne Returns Null(If no Doc Found)
    if (checkEmaillAndPassword == null) {
      return res.status(404).send({
        status: false,
        msg: "this email and password are not register in Our Database",
      });
    }
    //

    let token = jwt.sign(
      { userId: checkEmaillAndPassword._id },
      "Group-27-Secret-Key",
      {
        expiresIn: "1d",
      }
    );

//=================================Verifing Token==============================//
    let decode = jwt.verify(token, "Group-27-Secret-Key");
    if(!decode){
      res.status(403).send({status:false,msg:"Please provide valid secret key"})
    }
    res.status(201).send({
      status: true,
      data: token,
      userId: decode.userId,
      exp: decode.exp,
      iat: decode.iat,
    });
  } catch (err) {
    return res.status(500).send({
      msg: false,
      errMessage: err.message,
    });
  }
};

module.exports.loginUser = loginUser;
