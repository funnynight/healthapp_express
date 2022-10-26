const express = require("express");
const app = express();
const multer = require("multer");
const router = express.Router();

const { IncomingForm } = require("formidable");
const fs = require("fs");
const scaler = require("minmaxscaler");

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
  if (!fs.existsSync(path)) {
    res.status(200).json([]);
    return;
  }
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

router.post("/uploadHEX", async function (req, res, next) {
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm({ maxFileSize: 2000 * 1024 * 1024 });

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
  console.log(data);

  const oldpath = data.files.file.filepath;
  const newpath = "upload.hex";

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

router.get("/get_ecg", async function (req, res, next) {
  const value = parseInt(req.query.value);
  const path = "upload.hex";
  if (!fs.existsSync(path)) {
    res.status(200).json([]);
    return;
  }
  const stat = fs.statSync(path);
  const headerSize = 0x1a;
  const leadNumber = 2;
  const totalCount = (stat.size - headerSize) / (3 * leadNumber);
  const position = Math.floor((totalCount * value) / 100_000);
  const resCount = 2000;

  fs.open(path, "r+", function (err, f) {
    if (err) throw err;

    const buffer = Buffer.alloc(52_000);
    fs.read(
      f,
      buffer,
      0,
      50_000,
      position * 3 * leadNumber + headerSize,
      function (err, bytesRead, buffer) {
        const lead1 = [],
          lead2 = [];
        for (let i = 0; i < resCount; i++) {
          if ((i + 1) * 3 * leadNumber < bytesRead) {
            let v1 = buffer.readUint8(i * 3 * leadNumber);
            let v2 = buffer.readUint8(i * 3 * leadNumber + 1);
            let v3 = buffer.readUint8(i * 3 * leadNumber + 2);

            let value = (v1 << 16) + (v2 << 8) + v3;
            lead1.push(value);

            v1 = buffer.readUint8(i * 3 * leadNumber + 3);
            v2 = buffer.readUint8(i * 3 * leadNumber + 4);
            v3 = buffer.readUint8(i * 3 * leadNumber + 5);

            value = (v1 << 16) + (v2 << 8) + v3;
            lead2.push(value);
          }
        }

        // function compareNumbers(a, b) {
        //   return a - b;
        // }
        // temp.sort(compareNumbers);
        // const min = temp[resCount / 4];
        // const max = temp[(resCount / 4) * 3];
        // console.log(min, max);

        // const fit = scaler.fit_transform(data, -1, 1);
        res.status(200).json({lead1, lead2});
      }
    );
  });
});

module.exports = router;
