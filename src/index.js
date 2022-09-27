const express = require("express");
const route = require("./route/route.js");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://gourav-pundir:7HztUn9Bz3zFfxDT@cluster0.tnf1yk0.mongodb.net/gourav-22?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("MongoDB is connected"))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});
