const express = require("express");
const validator = require("validator");
const cookieParser = require("cookie-parser");
// const bodyparser=require("body-parser")
const cors = require('cors');
// const { urlencoded } = require("body-parser");
const app = express();


app.use(express.json())
// app.use(express.urlencoded())
// app.use(bodyparser.json())
require("./src/db/conn");
app.use(cookieParser());
app.use(cors())

const port = process.env.PORT || 80;


app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
  next();
});

app.use(require("./src/routes/auth"))
app.use(require("./src/controllers/mainLogin"))
app.use(require("./src/controllers/adminController"))
app.use(require("./src/controllers/userController"))
app.use(require("./src/controllers/superAdminController"))
app.use(require("./src/controllers/uploadCsv"))
app.use(require("./src/controllers/ecgController"))




app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
