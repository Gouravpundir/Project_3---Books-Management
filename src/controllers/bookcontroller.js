const bookModel = require("../models/bookModel");
const reviewModel = require("../models/reviewModel");

//==============================create book====================================//

const createBook = async (req, res) => {
  try {
    
    req.body.title = req.body.title.replace(/\s+/g, " ");

    let newBookCreated = await bookModel.create(req.body);
    res.status(201).send({
      status: true,
      message: "Book created successfully",
      data: newBookCreated,
    });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//===============================get books==========================================//

const getBooks = async function (req, res) {
  try {
    let { userId, category, subcategory } = req.query;
    let filter = {};

    if (Object.keys(req.query).length) {
      if (userId) {
        filter.userId = userId;
      }
      if (category) {
        filter.category = category;
      }
      if (subcategory) {
        filter.subcategory = subcategory;
      }
      //------if user provide any other filter any these---------//
      if (!Object.keys(filter).length) {
        return res.status(404).send({
          status: false,
          msg: "No Book Found!!",
        });
      }
    }

    filter.isDeleted = false;
    let allBooks = await bookModel
      .find({ $and: [filter] })
      .select({
        title: 1,
        excerpt: 1,
        userId: 1,
        category: 1,
        releasedAt: 1,
        reviews: 1
      }).collation({locale: "en"})
      .sort({ title: 1 });
    //-----if no book found--------//
    if (!allBooks.length) {
      return res.status(404).send({
        status: false,
        msg: "No Book Found!!",
      });
    }
    res.status(200).send({
      status: true,
      msg: "Books List !!",
      data: allBooks,
    });
  } catch (err) {
    res.status(500).send({
      status: false,
      msg: err.message,
    });
  }
};

//=============================get book by bookID===============================//
let getBookById = async (req, res) => {
  try {
    let bookId = req.params.bookId;
    let bookData = await bookModel.findOne({ _id: bookId, isDeleted: false });
    //----------if no Data found -------//
    if (!bookData) {
      return res.status(404).send({
        status: false,
        msg: "No Such Book Exists",
      });
    }
    //getting the data from review Model
    let reviews = await reviewModel
      .find({ bookId: bookId, isDeleted: false })
      .select({
        _id: 1,
        bookId: 1,
        reviewedBy: 1,
        reviewedAt: 1,
        rating: 1,
        review: 1,
      });

    let bookReviews = {
      bookData,
      reviewsData: reviews,
    };

    return res
      .status(200)
      .send({ status: true, message: "Books list", data: bookReviews });
  } catch (error) {
    return res.status(500).send({ status: false, Error: error.message });
  }
};

//============================update book========================================//

const updateBook = async (req, res) => {
  try {
    let requestBody = req.body;
    let bookId = req.params.bookId;

    let book = await bookModel.findOne({ _id: bookId, isDeleted: false });
    if (!book) {
      return res.status(404).send({ status: false, msg: "No Such Book found" });
    }

    let uniqueTitleAndIsbn = await bookModel.findOne({
      $or: [{ title: requestBody.title }, { ISBN: requestBody.ISBN }],
    });
    if (uniqueTitleAndIsbn) {
      if (uniqueTitleAndIsbn.title == requestBody.title)
        return res.status(400).send({
          status: false,
          msg: "Title Already Exists. Please Input Another title",
        });
      else {
        return res.status(400).send({
          status: false,
          msg: "ISBN Number Already Exists. Please Input Another ISBN Number",
        });
      }
    }
    let updatedBookData = await bookModel.findByIdAndUpdate(
      bookId,
      {
        title: requestBody.title,
        excerpt: requestBody.excerpt,
        releasedAt: requestBody.releasedAt,
        ISBN: requestBody.ISBN,
      },
      { new: true }
    );
    res.status(200).send({
      status: true,
      msg: "Book updated Successfulyy",
      data: updatedBookData,
    });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

//===========================delete book by bookID in path params========================//

const deleteBook = async (req, res) => {
  try {
    let bookId = req.params.bookId;
    let checkBook = await bookModel.findOne({ _id: bookId, isDeleted: false });
    if (!checkBook) {
      return res
        .status(404)
        .send({ status: false, msg: "No such book exists !" });
    }
    let delBook = await bookModel.findByIdAndUpdate(
      bookId,
      { isDeleted: true, deletedAt: Date() },
      { new: true, upsert: true }
    );
    res.status(200).send({
      status: true,
      msg: "Book deleted successfully",
      data: delBook,
    });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

module.exports = { createBook, getBooks, getBookById, updateBook, deleteBook };
