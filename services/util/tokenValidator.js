const jwt = require('jsonwebtoken')

// TOKEN VALIDATOR FOR USERS & ADMIN
const tokenValidator = async(req, res, tokenName, callback) => {
    // GET TOKEN FROM REQ OBJECT
    const Token = req.cookies[tokenName];
    // CHECK IF THE TOKEN EXIST OR NOT
    if (!Token || Token === null || Token === undefined) {
        //return next(CreateError(401, 'Unauthorized Access STATUS_401'));
        return callback(new Error('Unauthorized Access STATUS_401'), null);
    }

    // CHECK IF TOKEN IS BELONG TO REGULAR USER OR ADMIN TOKEN
    const SECRET_KEY = tokenName === 'Token' ? process.env.AUTH_SECRET : process.env.REFRESH_TOKEN;
    console.log(SECRET_KEY)
        // VERIFY THE GIVEN TOKEN
    const token_payload = await jwt.verify(Token, SECRET_KEY, (err, payload) => {
        if (err) return callback(new Error(err.message), null);

        // CONSOLE THE TOKEN PAYLOAD 
        console.log(payload);

        // RETURN VALID TOKEN PAYLOAD
        return callback(null, payload);
    });
};

module.exports = tokenValidator;