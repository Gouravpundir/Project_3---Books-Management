const express = require("express");
const router = express.Router();

//controller
const userController = require("../controllers/userController");
const loginController = require("../controllers/loginController");
const bookController = require("../controllers/bookcontroller");
const validator = require("../validations/validations");
const reviewController = require("../controllers/reviewController");

//middleware
const middleware = require("../middleware/auth");

//Create User API
router.post(
  "/register",
  validator.createUser,
  userController.createUser);

//logIn API
router.post(
  "/login",
  validator.userLogin,
  loginController.loginUser);

//Create book
router.post(
  "/books",
  middleware.authentication,
  middleware.autherization,
  validator.createBook,
  bookController.createBook
);

//Get Books
router.get(
  "/books",
  middleware.authentication,
  validator.getBookByQuery,
  bookController.getBooks
);

//Get Book by BookID
router.get(
  "/books/:bookId",
  middleware.authentication,
  validator.getBookByID,
  bookController.getBookById
);

//Update books by bookId
router.put(
  "/books/:bookId",
  middleware.authentication,
  middleware.autherization,
  validator.updateBook,
  bookController.updateBook
);

//delete by BookId
router.delete(
  "/books/:bookId",
  middleware.authentication,
 // middleware.autherization,
  validator.delBookbyBookId,
  bookController.deleteBook
);


//Creating Reviews
router.post(
  "/books/:bookId/review",
  validator.reviews,
  reviewController.reviews
);

//update review

router.put(
  "/books/:bookId/review/:reviewId",
  validator.updateReviews,
  reviewController.updateReviews
);

//delete review

router.delete(
  "/books/:bookId/review/:reviewId",
  validator.deleteReview,
  reviewController.deleteReview
);
//=========================== if endpoint is not correct==========================================

router.all("/*", function (req, res) {
  res.status(400).send({
    status: false,
    message: "Make Sure Your Endpoint is Correct !!!",
  });
});

module.exports = router;
