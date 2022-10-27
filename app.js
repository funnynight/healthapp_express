const express = require("express");
const validator = require("validator");
const cookieParser = require("cookie-parser");
// const bodyparser=require("body-parser")
const cors = require("cors");
// const { urlencoded } = require("body-parser");
const app = express();
const fs = require("fs");
const path = require("path");
const https=require('https')

app.use(express.json());
// app.use(express.urlencoded())
// app.use(bodyparser.json())
require("./src/db/conn");
app.use(cookieParser());
app.use(cors());

const port = process.env.PORT || 8000;

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, GET, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.use(require("./src/routes/auth"));
app.use(require("./src/controllers/mainLogin"));
app.use(require("./src/controllers/adminController"));
app.use(require("./src/controllers/userController"));
app.use(require("./src/controllers/superAdminController"));
app.use(require("./src/controllers/uploadCsv"));
app.use(require("./src/controllers/ecgController"));

const options = {
  key: fs.readFileSync(path.join(__dirname, "./cert/key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "./cert/cert.pem")),
};
const sslServer = https.createServer(options, app);
sslServer.listen(port, () => {
  console.log(`Secure server is listening on port ${port}`);
});

// app.listen(port, () => {
//   console.log(`server is running on port ${port}`);
// });
