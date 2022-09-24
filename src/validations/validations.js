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
  return /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/.test(value)
}

function isValidISBN(value) {
  return /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)/.test(value)
}

//===============================create user=================================//

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

//==============================user login==================================//

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

//===================================create book====================================//

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
      if (!isValidISBN(ISBN)) {
        return res
          .status(400)
          .send({ status: false, message: "Book ISBN is inValid" });
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
//=============================Db calls===============================//
      let user = await userModel.findById(userId);
      if (!user) {
        res.status(400).send({ status: false, message: "User does not exit" });
      }

      title = title.replace(/\s+/g, " ");
      title = title.trim()
      let alreadyUsedTitle = await bookModel.findOne({ title: { $regex: title, $options: 'i' } });
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

//========================get books============================//

  getBookByQuery: async (req, res, next) => {
    try {
      if (req.query.userId) {
        if (!isvalidObjectId(req.query.userId)) {
          return res
            .status(400)
            .send({ status: false, message: "UserId is not Valid" });
        }
      }
      next();
    } catch (e) {
      res.status(500).send({ status: false, error: e.message });
    }
  },

//==========================get book by id=================================//

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

//=========================create review=================================//

  reviews: function (req, res, next) {
    try {
      //storing Data in object
      let { bookId, reviewedBy, reviewedAt, rating } = req.body;
      //bookId (Madatory)
      if (!bookId) {
        return res
          .status(400)
          .send({ status: false, msg: "bookId Is required !!" });
      }
      if (!isvalidObjectId(bookId) || !isvalidObjectId(req.params.bookId)) {
        return res
          .status(400)
          .send({ status: false, msg: "Not a valid BookID !!" });
      }
      if (req.params.bookId != bookId) {
        return res
          .status(400)
          .send({ status: false, msg: "Provide same BookID in params and body" })
      }
      //reviewedAt (Madatory)
      if (!reviewedAt) {
        return res
          .status(400)
          .send({ status: false, msg: "reviewedAt Is required !!" });
      }
      if (!isValidDate(reviewedAt)) {
        return res
          .status(400)
          .send({ status: false, msg: "Provide a valid date in reviwedAt !!" });
      }
      //rating (Madatory)
      if (!/^[1-5]$/.test(rating)) {
        return res
          .status(400)
          .send({ status: false, msg: "rating should be from 1-5 !!" });
      }
      if (!rating) {
        return res
          .status(400)
          .send({ status: false, msg: "rating Is required !!" });
      }
      next();
    } catch (e) {
      res.status(500).send({ status: false, error: e.message });
    }
  },

//====================================update book=================================//

  updateBook: (req, res, next) => {
    try {
      let requestBody = req.body;
      if (!isvalidRequestBody(requestBody)) {
        return res
          .status(400)
          .send({ statua: false, msg: `Request body can't be empty` });
      }
      if (req.body.ISBN) {
        if (!isValidISBN(req.body.ISBN)) {
          return res
            .status(400)
            .send({ status: false, message: "Book ISBN is inValid" });
        }
      }
      next();
    } catch (e) {
      res.status(500).send({ status: false, error: e.message });
    }
  },

//=======================delete book by id===========================//

  delBookbyBookId: (req, res, next) => {
    try {
      if (!isvalidObjectId(req.params.bookId)) {
        return res.statua(400).send({
          status: false,
          msg: "Not a valid BookID",
        });
      }
      next();
    } catch (e) {
      res.status(500).send({ status: false, error: e.message });
    }
  },

//======================update review===========================================//

  updateReviews: function (req, res, next) {
    //Checking Format of id
    if (!isvalidObjectId(req.params.bookId)) {
      return res.status(400).send({
        status: false,
        msg: " BookID is not a valid book id",
      });
    }

    //Checking Format of id
    if (!isvalidObjectId(req.params.reviewId)) {
      return res.status(400).send({
        status: false,
        msg: "review is not a valid book id",
      });
    }
    if (req.body.rating) {
      if (!/^[1-5]$/.test(req.body.rating)) {
        return res
          .status(400)
          .send({ status: false, msg: "rating should be from 1-5 !!" });
      }
    }

    //
    if (!req.params.bookId || req.params.bookId == ":bookId") {
      return res.status(400).send({
        status: false,
        msg: " BookId required Id And its Required Field",
      });
    }
    if (!req.params.reviewId || req.params.reviewId == ":reviewId") {
      return res.status(400).send({
        status: false,
        msg: " reviewId required Id  And its Required Field 2",
      });
    }
    next();
  },

//==============================delete review======================================//

  deleteReview: (req, res, next) => {
    try {
      let reviewID = req.params.reviewId;
      let bookID = req.params.bookId;

      if (!isvalidObjectId(bookID)) {
        return res
          .status(400)
          .send({ status: false, message: "BookID is not a valid book id" });
      }

      //
      if (!isvalidObjectId(reviewID)) {
        return res.status(400).send({
          status: false,
          message: "ReviewID is not a valid review id",
        });
      }
      next();
    } catch (e) {
      res.status(500).send({ status: false, error: e.message });
    }
  },
};
