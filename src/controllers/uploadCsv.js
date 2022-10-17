const express = require("express");
const app = express();
const multer = require("multer");
const router = express.Router();

const { IncomingForm } = require("formidable");
const fs = require("fs");

// const upload = multer()

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./csv");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname);
  },
});

const upload = multer({ storage: fileStorageEngine });

router.post("/uploadfile", upload.single("file"), function (req, res, next) {
  console.log(req.file);
  res.send("single file uploaded successfully");
  // console.log("file uploaded successfully");
});

router.post("/uploadCSV", async function (req, res, next) {
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm({ maxFileSize: 2000 * 1024 * 1024 });

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
  console.log(data);
  
  const oldpath = data.files.file.filepath;
  const newpath = "upload.csv";

  const source = fs.createReadStream(oldpath);
  const dest = fs.createWriteStream(newpath);

  source.pipe(dest);
  source.on("end", async function () {
    console.log("upload " + newpath);
  });
  source.on("error", function (err) {
    console.log("move error");
  });

  res.status(200).json({ name: "Bambang" });
});

router.get("/get_plot", async function (req, res, next) {
  const value = parseInt(req.query.value);
  const path = "upload.csv";
  const stat = fs.statSync(path);
  const fileSize = stat.size;

  const position = Math.floor((fileSize * value) / 100_000);

  fs.open(path, "r+", function (err, f) {
    if (err) throw err;

    const buffer = Buffer.alloc(52_000);
    fs.read(f, buffer, 0, 50_000, position, function (err, bytesRead, buffer) {
      const lines = buffer.toString().split("\n");

      if (lines.length >= 2) {
        const json = [];
        for (let i = 1; i < lines.length - 1; i++) {
          const values = lines[i].replaceAll("\r", "").split(",");
          json.push({
            x: Math.floor(parseFloat(values[0]) * 1000),
            y: parseInt(values[1]),
            z: parseInt(values[2]),
            bpm: parseInt(values[3]),
            asp: parseInt(values[4]),
            cvp: parseInt(values[5]),
            p02: parseInt(values[6]),
            bVol: parseInt(values[7]),
          });
        }
        res.status(200).json(json);
      } else {
        res.status(200).json([]);
      }
    });
  });
});
module.exports = router;
