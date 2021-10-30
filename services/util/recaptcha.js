const axios = require('axios');

exports.recaptchaValidation = async (req, res, captcha) => {
    try {
        // CAPCTHA VALIDATION
        if (!captcha || captcha === undefined || captcha === '' || captcha === null) {
            console.log({ responseCode: 1, responseDesc: "Please Select Captcha" })
            return res.status(400).json({ responseCode: 1, confirmation: 'warning', responseDesc: "Please Select Captcha" })
        }

        // SECRET KEY
        const secretKey = '6Lfj2tYaAAAAANlcCSSYM2pA-wPxW3l6I-e5thrR';

        // VERIFY URL
        const verifyUrl = `https://google.com/recaptcha/siteverify?secretkey=${secretKey}&response=${captcha}&remoteip=${req.connection.remoteAddress}`;

        // MAKE REQUEST TO VERIFY URL
        const CAP_RESP = await axios.get(verifyUrl).then(data => data);
        // Success Will Be True or False Depending upon Captcha Validation
        if (CAP_RESP.success !== undefined && !CAP_RESP.success) {
            return res.status(400).json({ responseCode: 1, confirmation: 'failed', responseDesc: 'Failed Captcha Verification' })
        }

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ status: 500, msg: 'Internal Server Error' })
    }
}