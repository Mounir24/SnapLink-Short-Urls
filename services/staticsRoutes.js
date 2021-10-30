const jwt = require('jsonwebtoken'); // AUTHENTICATION TOKEN MODULE
const Articles = require('../model/articleSchema');
const createError = require('http-errors');
const csrf = require('csurf'); // CSRF PROTECTION MODULE 
const isMongoID = require('mongoose').Types.ObjectId.isValid; // METHOD TO CHECK FOR VALID MONGO  OBJECT

// IMPORT HELPERS FILES
const tokenValidator = require('../services/util/tokenValidator');

// START MIDDLWARES
const csrfProtection = csrf({ cookie: true });

// HOME PAGE
exports.support = (req, res) => {
    return res.status(200).render('maintenance');
}

// SUPPORT PAGE
exports.aboutUs = (req, res) => {
    return res.status(200).render('maintenance')
}

// SIGN UP PAGE
exports.signUp = (req, res) => {
    return res.status(200).render('signup', { csrfToken: req.csrfToken() });
}

// LOGIN PAGE 
exports.login = async (req, res) => {
    return res.status(200).render('login', { csrfToken: req.csrfToken() })
}

// ADVERTISING PAGE STATIC ROUTE
exports.adsReq = (req, res) => {
    return res.status(200).render('advertising');
}

// USER PROFILE PAGE
/*exports.userProfile = (req, res) => {
    return res.status(200).render('profile');
}*/

// VERIFY ACCESS TOKEN PAGE
exports.verifyToken = (req, res) => {
    return res.status(200).render('verify_token');
}

// FORGOT PASSWORD PAGE
exports.forgotPass = (req, res) => {
    return res.status(200).render('forgot_password');
}

// RESET PASSWORD PAGE
/*exports.resetPass = (req, res) => {
    return res.status(200).render('reset_password')
}*/

// ADMIN LOGIN PAGE 
exports.adminLogin = (req, res) => {
    return res.status(200).render('adminLogin');
}

// ADMIN: BLOGS SECTION PAGE
exports.blogsPage = (req, res, next) => {
    // CATCH TOKEN 
    const token = req.cookies['Token'];
    // CHECK IF TOKEN NOT EXIST
    if (!token) {
        return next(createError(404, 'Token Not Found!'));
        //return res.status(404).json({ status: 404, error: 'Token Not Found!' })
    }

    try {
        // VERIFY THE TOKEN
        jwt.verify(token, process.env.AUTH_SECRET, async (err, admin) => {
            // CHECK IF ERROR EXIST
            if (err) {
                return next(createError(400, 'Incorrect / Token Expires'));
                //return res.status(400).json({ status: 400, error: 'Incorrect / Token Eexpires' })
            }

            // GET ADMIN USERBNAME
            const { username } = admin;

            await Articles.find((err, payload) => {
                // Check if errors throws
                if (err) {
                    return next(createError(400, 'Error While Loading Blogs!!'))
                    //return res.status(400).json({ status: 400, msg: 'Error Throws While Getting Articles' })
                }

                console.log('Payload Served To The Target!')
                res.status(200).render('blogs', { blogs: payload, adminName: username });

            })
        })
    } catch (err) {
        next(err);
        //res.status(500).json({ status: 500, error: 'INTERNAL_SERVER_ERROR' })
    }
}

// ADMIN ADS MANAGER DASHBOARD
exports.ads_dashboard = async (req, res, next) => {
    try {
        // CHECK TOKEN IF EXIST OR NOT
        await tokenValidator(req, res, 'Token', (err, payload) => {
            if (err) return res.status(401).redirect('/404');

            // CHECK IF THE ADMIN TOKEN PAYLOAD
            const { _id, username } = payload;
            // CHECK IF ADMIN TOKEN ID IS VALID MONGO ID
            if (!isMongoID(_id)) {
                conosle.log('FAILED: TOKEN ID NOT VALID ONE!')
                return res.status(400).render('home');
            }

            // GRANT ACCESS TO THE PROTECTED PAGE AS (ADS MANAGER ROUTE)
            return res.status(200).render('./ads_views/dashboard');
        })
    } catch (err) {
        console.error(err.messsage);
        next(err);
    }
}