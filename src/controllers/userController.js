const userModel = require("../models/userModel");

//==============================create user====================================//
const createUser = async (req, res) => {
  try {

    req.body.name = req.body.name.replace(/\s+/g, " ");
    let userData = await userModel.create(req.body);
    res.status(201).send({
      status: true,
      message: "Success",
      data: userData
    });
  } catch (error) {
    res.status(500).send({
      status: false,
      error: error.message
    });
  }
};

module.exports.createUser = createUser;
