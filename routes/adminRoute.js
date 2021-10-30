const router = require('express').Router();
const multer = require('multer');
const { verifyAuth, verifyAdminToken } = require('../services/verifyToken');

// IMPORT EXTERNAL FILES (Controller - Utility - ...)
const adminControll = require('../controllers/adminControll');
const services = require('../services/staticsRoutes');

// MIDLLWARES
/*const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'ads_uploads');
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, file.fieldname + '-' + Date.now());
    }
})*/
// MULTER MIDDLWWARE
//const ad_upload = multer({ storage: storage });

// GET ADS DASHBOARD ROUTER
router.get('/ads-manager', services.ads_dashboard);

/*========  ADMIN APIs (PRIVATE) =========*/
// GET ALL URLs SOURCES API
router.get('/api/urls-sources', verifyAdminToken, adminControll.urlsSources);

// POST MESSAGE TO USER API ENDPOINT 
router.post('/api/v1/send-message', adminControll.sendMessage);

// DOWNLOAD LOGGER ROUTE
router.get('/logger/download', adminControll.downloadFile);

/*++++++++ ADS SYSTEM API ROUTES +++++++++*/
/*++++++++                       +++++++++*/
// RETRIEVE ALL ADS ROUTE
router.get('/api/v1/ads', adminControll.allAds);

// GET ALL PENDING PLANS SUBSCRIPTION AS (PENDING) STATUS 
router.get('/api/v1/pending_plans', adminControll.pendingPlans);

// CREATE NEW AD BANNER ROUTE
router.post('/api/v1/ads/create', adminControll.newAds);

// UPDATE AD WITH GIVEN ID ROUTE
router.put('/api/v1/ads/update/:id', adminControll.patchAds);

// DELETE AD WITH GIVEN ID ROUTE
router.delete('/api/v1/ads/destroy/:id', adminControll.destroyAds);

module.exports = router;