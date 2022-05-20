const express = require('express');
const router = express.Router({ mergeParams: true });
const multer = require('multer'); // UPLOADING FILES MODULE
//const session = require('express-session');

// IMPORT CONTROLLERS MODULE
const articlesCtrl = require('../controllers/articleController'); // ARTICLES CONTROLLER

// IMPORT SERVICES FILES
const services = require('../services/staticsRoutes');

// MIDDLWARES
//const session_store = session({ secret: process.env.SESSION_KEY, resave: true, saveUninitialized: true });


// INITIALE THE MULTER DISK STORAGE
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const FILE_MIME_TYPE = {
            "image/png": "png",
            "image/jpeg": "jpeg",
            "image/jpg": "jpg"
        };

        // CHECK / VALID THE FILE MIME TYPE
        const FILE_TYPE = file.mimetype;
        console.log(FILE_TYPE)
        const isValid = FILE_MIME_TYPE[FILE_TYPE] ? true : false;

        // CUSTOM UPLOAD ERROR
        let uploadError = new Error('Failed: File Mime Type Not Allowed :(');

        if (isValid) {
            uploadError = null;
        }

        cb(uploadError, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
})

// Multer Middleware 
const upload = multer({ storage: storage })

/*----- START ARTICLE API ROUTES ------*/

// GET ALL ARTICLES ROUTE
//router.get('/', articlesCtrl.getArticles);

// GET SINGLE ARTICLE CONTROLLER
router.get('/blog', articlesCtrl.getSingleBlog);

// GET (TEST)
router.get('/:blog_id/', (req, res, next) => {
    return res.status(200).json({ status: 200, data: req.params });
})

// CREATE NEW ARTICLE ROUTE
router.post('/create', upload.single('poster'), articlesCtrl.createArticle)

// DELETE ARTICLE CONTROLLER
router.delete('/delete', articlesCtrl.removeBlog);

// UPDATE ARTICLE CONTROLLER

/*----- END ARTICLE API ROUTES ------*/
module.exports = router;