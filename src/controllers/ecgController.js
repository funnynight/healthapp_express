const express = require("express");
const router = express.Router();
const axios = require('axios');

axios.interceptors.request.use(config => {
	config.headers['cookie'] = 'JSESSIONID=35CB8CDD7ADAC4631D679C29AE1C4D4E';
    config.headers['authorization']="basic d2ViX2swcDo=";
    config.headers['content-type']="multipart/form-data; boundary=----WebKitFormBoundaryA0qE3dOdL1ZowZTk";
	return config;
});
router.post("/ecg", async (req, res) => {
    console.log(req.body)
    try {
        axios.post('https://ecg.cardiolyse.com/v2/auth/oauth/token',req.body)
            .then(_res => {
                console.log('Date in Response header:', _res.data);
                res.redirect('https://ecg.cardiolyse.com')

            })
            .catch(err => {
                console.log('Error: ', err.response);
            });
    }
    catch (err) {
        console.log(err);
    }
});

module.exports = router;