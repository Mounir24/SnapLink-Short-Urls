const jwt = require('jsonwebtoken');

//CREATING A TOKEN VERIFYICATION MIDDLEWARE
const verifyAuth = (req, res, next) => {
    // CATCH TOKEN FOM USER COOKIES
    const token = req.cookies['Auth-Token'];

    // VALIDATE THE TOKEN
    if (!token) {
        console.log('Access Denied');
        return res.status(401).redirect('/sign-up');
    }

    // CHECK IF IN CASE USER HAS BEEN BLOCKED -- PREVENT ACCESS
    const USER_TN = jwt.verify(token, process.env.REFRESH_TOKEN);
    const { username, isBlocked } = USER_TN;
    //CHECKING 
    if (isBlocked) {
        return res.status(401).render('login', { status: 401, message: `${username} Has Been Blocked!` })
    }
    // PROCESSING...
    next();
    try {
        // VERIFY TOKEN
        const verified = jwt.verify(token, process.env.REFRESH_TOKEN);
        req.user = verified;
    } catch (err) {
        console.log({ status: 500, message: 'Internal Server Error' });
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }

}

// ADMIN TOKEN VERIFICATION MIDDLEWARE
const verifyAdminToken = async (req, res, next) => {
    // CATCH TOKEN
    const Token = req.cookies['Token'];
    // CHECK IF TOKEN EXIST OR NOT
    if (!Token) {
        console.log('Token Not Exist')
        return res.status(401).redirect('/admin-login');
    }
    next();
    try {
        // VERIFY THE TOKEN
        const verifiedAdmin = jwt.verify(Token, process.env.AUTH_SECRET);
        req.user = verifiedAdmin;
    } catch (err) {
        res.status(500).json({ status: 500, msg: err.message })
    }
}

// EXPORT MODULE
module.exports.verifyAuth = verifyAuth;
module.exports.verifyAdminToken = verifyAdminToken;