const userModel = require("../models/userModel");
const bookModel = require("../models/bookModel");
const mongoose = require("mongoose");

function isValidTitle(title) {
  return ["Mr", "Mrs", "Miss"].indexOf(title) !== -1;
}

function onlyAplha(value) {
  return /^[a-zA-Z/s]/.test(value);
}

function validateMobile($phone) {
  var phoneReg = /^[6789]\d{9}$/;
  if (!phoneReg.test($phone)) {
    return false;
  } else {
    return true;
  }
}

function validateEmail($email) {
  var emailReg = /^(\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3}))$/;
  if (!emailReg.test($email)) {
    return false;
  } else {
    return true;
  }
}
function isvalidObjectId(ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId);
}

function isvalidRequestBody(requestBody) {
  return Object.keys(requestBody).length > 0;
}

function isValid(value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
}

function isValidDate(value) {
  return /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/.test(
    value
  );
}

module.exports = {
  createUser: async (req, res, next) => {
    try {
      let data = req.body;
      if (Object.keys(data).length == 0) {
        res
          .status(400)
          .send({ status: false, msg: "Request body can not be empty" });
      }
      let { title, name, phone, email, password } = data;
      if (!isValidTitle(title)) {
        return res.status(400).send({
          staus: false,
          msg: "Title is required and should be in  Mr, Mrs, Miss ",
        });
      }
      if (!name) {
        return res.status(400).send({ staus: false, msg: "Name is required" });
      }
      if (!onlyAplha(name)) {
        return res
          .status(400)
          .send({ staus: false, msg: "Name can be in Alphabets only" });
      }
      if (!isValid(name)) {
        return res
          .status(400)
          .send({ staus: false, msg: "Name can not be empty" });
      }
      if (!phone) {
        return res
          .status(400)
          .send({ staus: false, msg: "Phone number is required" });
      }
      if (!email) {
        return res.status(400).send({ staus: false, msg: "Email is required" });
      }
      if (!password) {
        return res
          .status(400)
          .send({ staus: false, msg: "Password is required" });
      }
      if (password.length < 8 || password.length > 15) {
        return res.status(400).send({
          staus: false,
          msg: "Length of the password must be between 8 to 15 charaxters",
        });
      }
      if (!validateMobile(phone)) {
        return res
          .status(400)
          .send({ status: false, msg: "Please provide valid phone number" });
      }
      if (!validateEmail(email)) {
        return res
          .status(400)
          .send({ status: false, msg: "Please provide valid email" });
      }
      let alreadyUsedEmail = await userModel.findOne({ email });
      if (alreadyUsedEmail) {
        return res
          .status(400)
          .send({ status: false, msg: "This email is already registerd" });
      }
      let alreadyUsedPhone = await userModel.findOne({ phone });
      if (alreadyUsedPhone) {
        return res.status(400).send({
          status: false,
          msg: "This phone number is already registerd",
        });
      }
      return next();
    } catch (e) {
      res.status(500).send({ status: false, error: e.message });
    }
  },

  userLogin: async (req, res, next) => {
    try {
      let { email, password } = req.body;

      //Cant accept Empty Request
      if (!isvalidRequestBody(req.body)) {
        return res
          .status(400)
          .send({ status: false, msg: " cant accept empty Request" });
      }

      //Email && PassWord (required)
      if (!email || !password) {
        return res
          .status(400)
          .send({ status: false, msg: "Email and  Password is required" });
      }

      next();
    } catch (err) {
      res.status(500).send({ status: false, error: err.message });
    }
  },

  createBook: async (req, res, next) => {
    try {
      let data = req.body;
      let {
        title,
        excerpt,
        userId,
        ISBN,
        category,
        subcategory,
        releasedAt,
        deletedAt,
      } = data;
      if (!isvalidRequestBody(data)) {
        return res.status(400).send({
          status: false,
          message: "Invalid request parameters. Please provide book details",
        });
      }
      if (!isValid(title)) {
        return res
          .status(400)
          .send({ status: false, message: "Book Title is required" });
      }
      if (!isValid(excerpt)) {
        return res
          .status(400)
          .send({ status: false, message: "Book excerpt is required" });
      }

      if (!isValid(userId)) {
        return res
          .status(400)
          .send({ status: false, message: "User id is required" });
      }
      if (!isvalidObjectId(userId)) {
        return res
          .status(400)
          .send({ status: false, message: `${userId} is not a valid user id` });
      }
      if (!isValid(ISBN)) {
        return res
          .status(400)
          .send({ status: false, message: "Book ISBN is required" });
      }
      if (!isValid(category)) {
        return res
          .status(400)
          .send({ status: false, message: "Book Category is required" });
      }
      if (!isValid(subcategory)) {
        return res
          .status(400)
          .send({ status: false, message: "Book subcategory is required" });
      }
      if (!releasedAt) {
        return res
          .status(400)
          .send({ status: false, message: "releasedAt is required" });
      }
      if (!isValidDate(releasedAt)) {
        return res
          .status(400)
          .send({ status: false, message: "releasedAt can be a DATE only" });
      }
      //**Db calls
      let user = await userModel.findById(userId);
      if (!user) {
        res.status(400).send({ status: false, message: "User does not exit" });
      }
      let alreadyUsedTitle = await bookModel.findOne({ title });
      if (alreadyUsedTitle) {
        return res
          .status(400)
          .send({ status: false, msg: "Title should be unique" });
      }
      let alreadyUsedISBN = await bookModel.findOne({ ISBN });
      if (alreadyUsedISBN) {
        return res
          .status(400)
          .send({ status: false, msg: "ISBN id should be unique" });
      }
      return next();
    } catch (e) {
      res.status(500).send({ status: false, error: e.message });
    }
  },

  getBookByID: async (req, res, next) => {
    try {
      let bookId = req.params.bookId;
      if (!isvalidObjectId(bookId)) {
        return res
          .status(400)
          .send({ status: false, message: "BookId is not Valid" });
      }
      next();
    } catch (e) {
      res.status(500).send({ status: false, error: e.message });
    }
  },

  reviews: function (req, res, next) {
    //storing Data in object
    let { bookId, reviewedBy, reviewedAt, rating } = req.body;
    //bookId (Madatory)
    if (!bookId) {
      return res
        .status(400)
        .send({ status: false, msg: "bookId Is required !!" });
    }

    //reviewedBy (Madatory)
    if (!reviewedBy) {
      return res
        .status(400)
        .send({ status: false, msg: "reviewedBy Is required !!" });
    }
    //reviewedAt (Madatory)
    if (!reviewedAt) {
      return res
        .status(400)
        .send({ status: false, msg: "reviewedAt Is required !!" });
    }
    //rating (Madatory)
    if (!rating) {
      return res
        .status(400)
        .send({ status: false, msg: "rating Is required !!" });
    }
    next();
  },
};