const jwt = require("jsonwebtoken");
const bookModel = require("../models/bookModel");
const mongoose = require('mongoose')

//============================validation======================================//
function isvalidObjectId(ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId);
}

//==========================authentication=============================//
exports.authentication = function (req, res, next) {
  //Checking Header is coomimg from the request header or not

  try {
    let checkHeader = req.headers["token-key"];
    if (!checkHeader) {
      return res
        .status(400)
        .send({ status: false, msg: "In headers section token is madatory" });
    }

    //verifing that token
    let decodedToken = jwt.verify(
      checkHeader,
      "Group-27-Secret-Key",
      (err, decode) => {
        if (err) {
          let msg =
            err.message === "jwt expired"
              ? "Token is expired"
              : "Token is invalid";
          return res.status(400).send({ status: false, message: msg });
        }
        //Seting userId in headers for Future Use
        req.decode = decode;
        next();
      }
    );
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

//=============================Autherization================================//

exports.autherization = async function (req, res, next) {
  //console.log(req.headers.userId);
  try {
    if (req.params.bookId) {
      if (!isvalidObjectId(req.params.bookId)) {
        return res
          .status(400)
          .send({ status: false, msg: "Not a valid BookID" })
      }
      let findUserIdByBookId = await bookModel.findById(req.params.bookId)
      if(!findUserIdByBookId){
        return res
        .status(404)
        .send({ status: false, msg: "No such Book found" }) 
      }
      if (findUserIdByBookId.userId != req.decode.userId) {
        return res
        .status(403)
        .send({ status: false, msg: "Not an Authorized user" }) 
      }return next()
    }
    if(!req.body.userId){
      return res.status(400).send({status: false, msg:"UserID is required"})
    }
    if (req.body.userId) {
      if (!isvalidObjectId(req.body.userId)) {
        return res
          .status(400)
          .send({ status: false, msg: "Not a valid userID" })
      }
      if (req.body.userId != req.decode.userId) {
        return res
        .status(403)
        .send({ status: false, msg: "Not Autherized user" })
      }
      next()
    }
  } catch (err) {
    return res.status(500).send({
      status: false,
      msg: " Authrization Server Error !!",
      errMessage: err.message,
    });
  }
};
