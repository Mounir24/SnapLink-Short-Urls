const express = require('express');
const router = express.Router();
const multer = require('multer'); // UPLOADING FILES MODULE
const session = require('express-session');

// IMPORT CONTROLLERS MODULE
const articlesCtrl = require('../controllers/articleController'); // ARTICLES CONTROLLER

// IMPORT SERVICES FILES
const services = require('../services/staticsRoutes');

// MIDDLWARES
const session_store = session({ secret: process.env.SESSION_KEY, resave: true, saveUninitialized: true });


// INITIALE THE MULTER DISK STORAGE
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
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
router.get('/blog', session_store, articlesCtrl.getSingleBlog);

// CREATE NEW ARTICLE ROUTE
router.post('/create', upload.single('poster'), articlesCtrl.createArticle)

// DELETE ARTICLE CONTROLLER
router.delete('/delete', articlesCtrl.removeBlog);

// UPDATE ARTICLE CONTROLLER

/*----- END ARTICLE API ROUTES ------*/
module.exports = router;