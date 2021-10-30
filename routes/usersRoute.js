const router = require('express').Router();
const { verifyAuth, verifyAdminToken } = require('../services/verifyToken');
const csrf = require('csurf'); // CSRF PROTECTION MODULE 


// START MIDDLWARES
const csrfProtection = csrf({ cookie: true });

// IMPORT CONTROLLERs
const useControll = require('../controllers/usersController');
const services = require('../services/staticsRoutes');

// HOME PAGE ROUTE
router.get('/', useControll.homeStatics);

// SHORT URL ROUTE
router.get('/short-url', verifyAuth, useControll.urlsData)

// SUPPORT PAGE 
router.get('/support', services.support);

// ABOUT PAGE
router.get('/about', services.aboutUs);

// ADVERTISING PAGE 
router.get('/advertising', services.adsReq);

// SIGN UP PAGE
router.get('/sign-up', csrfProtection, services.signUp);

// Login PAGE 
router.get('/login', csrfProtection, services.login);

// USER LOG OUT ROUTE
router.get('/logout', useControll.logoutUser);

// USER PROFILE
router.get('/profile', useControll.userProfile)

// FORGOT PASSWORD ROUTE 
router.get('/forgot-password', services.forgotPass);

// VERIFY ACCESS TOKEN ROUTE
router.get('/verify_Token', services.verifyToken);

// RESET PASSWORD ROUTER
router.get('/reset-password/:token', useControll.resetPass);

// ADMIN PANNEL ROUTE 
router.get('/admin-login', services.adminLogin);

// ADMIN SIGN UP ROUTE
router.post('/admin-signup', useControll.adminSignup);

// BLOGS PAGE ROUTE
router.get('/blogs', services.blogsPage);

//ADMIN SIGN OUT ROUTE
router.get('/sign-out', useControll.signOut)

// PANNEL AREA ROUTE 
router.get('/admin-panel', verifyAdminToken, useControll.adminPannel)

// URLS LIST PANNEL AREA
router.get('/urls-list', useControll.urlsList);

// GET SINGLE URL ROUTE
router.get('/:inputShort', useControll.singleUrl);

/*-------------- USERS API -------------*/

// CREATE NEW URL ENDPOINT (SHORT URL)
router.post('/v1/api/new', useControll.createUrl)

// DISPLAY - GRAPHICING  DATA API 
router.get('/v1/api/all', useControll.flyData);

// CREATE NEW USER ENDPOINT
router.post('/api/register', csrfProtection, useControll.registerUser);

// LOGIN USER ENDPOINT
router.post('/api/login', csrfProtection, useControll.loginUser);

// REMOVE USER ENDPOINT
router.post('/api/remove', useControll.removeUser);

// BLOCK USER ENDPOINT 
router.put('/api/block', useControll.blockUser);

// UNBLOCK USER ENDPOINT
router.put('/api/unblock', useControll.unblockUser);

// REMOVE URLS ENDPOINT 
router.delete('/api/remove/url', useControll.removeUrls);

// FORGOT PASSWORD ENDPOINT
router.post('/api/auth/forgot-password', useControll.forgotPass);

// CHANGE PASSWORD ENDPOINT
router.put('/api/auth/reset-password', useControll.changePass);

// LOGIN ADMIN (PRIVATE ROUTER)
router.post('/api/admin/login', useControll.adminLogin);

// ACTIVATE USER ACCOUNT ROUTE
router.get('/activate/:token', useControll.activateUser);

// NEWSLETTER SUBSCRIBERS ROUTE API 
router.post('/api/newsletter/add', useControll.addSubscriber);

// VERIFY TOKEN ACCESS ROUTER API
router.post('/api/verify/token_access', useControll.verifyTokenAccess);

// CREATE A PLAN REQUEST ROUTE
router.post('/api/v1/plan_request', useControll.planRequest);

// EXPORT ROUTES MODULE
module.exports = router;