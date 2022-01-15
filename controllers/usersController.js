const Url = require('../model/urlSchema');
const shortId = require("shortid"); // Short Id generator
const QRcode = require('qrcode'); // Qrcode module
const moment = require("moment");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const fetch = require('node-fetch');
const createError = require('http-errors');
const csrf = require('csurf'); // CSRF PROTECTION MODULE 
const SHORT_ID = require('shortid');

// IMPORT MODELS AND HELPERS
const User = require('../model/userSchema'); // USER SCHEMA
const Articles = require('../model/articleSchema'); // ARTICLES MODEL MODULE
const Admins = require('../model/adminSchema'); // ADMIN SCHEMA
const Ads_Banners = require('../model/adsSchema'); // ADS SCHEMA MODEL
const Subscribers = require('../model/subscriberSchema'); // NewsLetter Model / Schema
const mail = require('../configuration/mail'); // MAILER
const validator = require('../services/util/validator'); // VALIDATOR
const { TOKEN_LOGGER } = require('../services/util/logger/token-logger');
const isMongoID = require('mongoose').Types.ObjectId.isValid; // METHOD TO CHECK FOR VALID MONGO  OBJECT

// START MIDDLWARES

// REGISTER CONTROLL
exports.registerUser = async (req, res, next) => {
    //CATCH PAYLOAD FROM CLIENT-SIDE
    const { email, username, password, captcha } = req.body;

    // BASE URL ---> SNAPLINK 
    const BASE_URL = "http://www.snplnk.link";
    /*recaptchaValidation(req, res, captcha);*/
    try {
        // CAPCTHA VALIDATION
        if (!captcha || captcha === undefined || captcha === '' || captcha === null) {
            console.log({ responseCode: 1, responseDesc: "Please Select Captcha" })
            return res.status(400).json({ responseCode: 1, confirmation: 'warning', responseDesc: "Please Select Captcha" })
        }

        // SECRET KEY
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;

        // VERIFY URL
        const verifyUrl = `https://google.com/recaptcha/siteverify?secretkey=${secretKey}&response=${captcha}&remoteip=${req.connection.remoteAddress}`;

        // MAKE REQUEST TO VERIFY URL
        const CAP_RESP = await fetch(verifyUrl).then(data => data);
        // Success Will Be True or False Depending upon Captcha Validation
        if (CAP_RESP.success !== undefined && !CAP_RESP.success) {
            return res.status(400).json({ responseCode: 1, confirmation: 'failed', responseDesc: 'Failed Captcha Verification' })
        }

    } catch (err) {
        next(err)
    }

    // CHECK USER INPUTS IF NOT EMPTY
    if (req.body === null) {
        return res.status(400).json({ message: 'Inputs Cannot Empty!' })
    }

    // VALIDATE INPUTS (USER INFO)
    if (!validator.isEmail(email)) {
        console.log(`${email}: E-mail Field Must Be Valid!`);
        return res.status(400).json({ status: 400, msg: `${email}: E-mail Field Must Be Valid!` })
    }

    if (validator.isLength(username, 6)) {
        console.log(`${username}: is too short! Must Be More Than 6 Characters`);
        return res.status(400).json({ status: 400, msg: `${username}: is too short! Must Be More Than 6 Characters` })
    }
    try {
        // CHECK IF USER EMAIL EXIST OR NOT
        await User.findOne({ email }, (err, user) => {
            // CHECK FOR ERROR
            if (err) return next(createError(400, "Failed: Something went wrong!"));
            if (user) {
                return res.status(400).json({ message: { status: 'exist', msg: `${user.username} Already Exist` } });
            }
            //GET USER IP 
            //let userIp;
            (async function () {
                let user_geo = {};

                try {
                    /*user_geo.ip = req.headers['X-Forwarded-For'] || req.connection.remoteAddress;
                    await axios.get(`https://ipapi.co/${user_geo.ip}/json/`)
                        .then(async (data) => {
                            user_geo.country = data.data.country_name;
                            user_geo.country_flag = `https://flagcdn.com/w320/${data.data.country.toLowerCase()}.png`;
                            await axios.get(`https://flagcdn.com/w320/${data.data.country.toLowerCase()}.png`)
                                .then(data => {
                                    user_geo.country_flag = data.data[0].flag;
                                })
                        })*/
                    await axios.get('https://api.ipify.org?format=json')
                        .then(async (data) => {
                            user_geo.ip = data.data.ip;
                            await axios.get(`https://ipapi.co/${data.data.ip}/json/`)
                                .then(async (data) => {
                                    user_geo.country = data.data.country_name;
                                    user_geo.country_flag = `https://flagcdn.com/w320/${data.data.country.toLowerCase()}.png`;
                                    /*await axios.get(`https://flagcdn.com/w320/${data.data.country.toLowerCase()}.png`)
                                        .then(data => {
                                            user_geo.country_flag = data.data[0].flag;
                                        })*/
                                })
                        })
                } catch (err) {
                    const optsMail = {
                        from: process.env.EMAIL,
                        to: 'M.brtouli997@gmail.com',
                        subjetc: `SnapLink: System Error - Date: ${new Date().toLocaleDateString()}`,
                        html: `
                         <h2>SnapLink System Error: ${err.message}</h1>
                         <p>${err}</p>
                         <a 
                         style="
                         padding: 10px 45px;
                         border: none;
                         outline: none;
                         border-radius: 24px;
                         background: linear-gradient(45deg, hsl(210, 85%, 48%), hsl(141, 84%, 56%));
                         color: #fff;
                         "
                         href="${BASE_URL}/admin-login"
                         >
                         LOGIN AS ADMIN
                         </a>
                        `
                    }
                    mail(optsMail)
                    next(createError(500, 'Error: Third Party Connection Failed!'))
                }

                /*console.log(country_flag.flag)
                if (!user_ip || user_ip === null) {
                    return;
                }*/
                // HASHING PASSWORD
                const salt = bcrypt.genSaltSync(10);
                const hashPass = bcrypt.hashSync(password, salt);
                // GENERATE JWT TOKEN
                const token = jwt.sign({ email: email, username: username, password: hashPass, location: user_geo }, process.env.AUTH_SECRET, { expiresIn: '10m' });
                // SEND IT AS EMAIL TO USER
                // MAIL OPTIONS
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: `SnapLink: ${username}, Your Activation Link`,
                    html: `
            <h1>Activation Link for SnapLink</h1>
            <p><strong>Note</string>: The activation link its available for 10 minutes only!</p> 
            <a href="${process.env.BASE_URL}/activate/${token}" >Activate Your Account</a>
        `
                }
                mail(mailOptions);
            })();

            res.status(201).json({ message: { status: 'ok', msg: `Activation Link Has Been Sent to: ${email}` } });
        })
    } catch (err) {
        console.error(err.message);
        next(err)
        //res.status(500).json({ status: 500, msg: 'Internal Server Error' })
    }
}


// ACTIVATE USER CONTROLL
exports.activateUser = async (req, res, next) => {
    // CATCH TOKEN FROM USER
    const { token } = req.params;

    // CHECK IF TOKEN EXIST OR NOT
    if (!token) {
        next(createError(401, 'Unauthorized!! Token Not Found / Token Expires.'));
    }
    try {
        // Verify Token
        jwt.verify(token, process.env.AUTH_SECRET, { algorithms: ['SHA256', 'HS256'] }, (err, payload) => {
            if (err) {
                return next(createError(400, 'Incorrect Token / Token Invalid!'));
            }
            // EXTRACT DATA 
            const { username, email, password, location } = payload;
            // CHECK IF USERNAME EXIST IN DB 
            User.findOne({ username }, (err, user) => {
                //CHECK IF ERROR EXIST 
                if (err) {
                    return res.status(400).redirect('/login')
                }

                if (user) {
                    console.log(`User: ${user.username} Already Exist`);
                    return res.status(400).redirect('/login')
                }
                return;
            })

            // CREATE NOW USER
            const newUser = new User({
                email: email,
                username: username,
                password: password,
                geo: location
            })

            // Save User To DB
            newUser.save((err, payload) => {
                // HANDLE ERROR
                if (err) {
                    return next(createError(401, 'ERROR: Failed To Create A User Account!'));
                    // return res.status(400).json({ message: 'Error Throws While Creating User' });
                }
                // CREATE A WELCOME PAGE FOR THIS ROUTE
                res.status(200).render('greeting', { username: payload.username, email: payload.email });
            })

        })
    } catch (err) {
        next(err);
    }
}

// LOGIN USER CONTROLL
exports.loginUser = async (req, res, next) => {
    // CATCH USER INFO 
    const { username, password, captcha } = req.body;
    try {
        // CAPCTHA VALIDATION
        if (!captcha || captcha === undefined || captcha === '' || captcha === null) {
            return res.status(400).json({ responseCode: 1, confirmation: 'warning', responseDesc: "Please Select Captcha" })
        }

        // SECRET KEY
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;

        // VERIFY URL
        const verifyUrl = `https://google.com/recaptcha/siteverify?secretkey=${secretKey}&response=${captcha}&remoteip=${req.connection.remoteAddress}`;

        // MAKE REQUEST TO VERIFY URL
        const CAP_RESP = await fetch(verifyUrl).then(data => data);
        // Success Will Be True or False Depending upon Captcha Validation
        if (CAP_RESP.success !== undefined && !CAP_RESP.success) {
            return res.status(400).json({ responseCode: 1, confirmation: 'failed', responseDesc: 'Failed Captcha Verification' })
        }

    } catch (err) {
        return next(createError(500, 'ERROR: INTERNALE_SERVER_ERROR_500!'));
    }

    try {
        // CHECK USER IF EXIST IN DB || NOT
        await User.findOne({ username: username }, async (err, user) => {
            // CATCH ERROR
            if (err) {
                return next(createError(400, 'ERROR: FAILED TO FETCH USER DATA'));
            }
            if (!user || user === undefined) {
                return res.status(400).json({ status: 400, message: `${username} Not Exist! Please Sign up` })
            }

            // COMPARE PASSWORDs
            const validPass = await bcrypt.compare(password, user.password);

            //CHECK IF VALIDE PASS
            if (!validPass) {
                return res.status(400).json({ status: 400, message: 'Invalid Username / Password!' })
            }

            // CHECK IF THE USER ENABLE 2-FACTOR OPTION OR NOT
            if (user.is2FEnable === false) {
                // SIGN NEW TOKEN
                const token = jwt.sign({ id: user._id, username, isBlocked: user.isBlocked, privateUrls: user.private_urls }, process.env.REFRESH_TOKEN, { expiresIn: '7d' });
                // SEND TOKEN AS COOKIE
                res.cookie('Auth-Token', token, { maxAge: 180000 * 24, httpOnly: true });
                return res.status(200).json({ status: 200 });
            } else if (user.is2FEnable === true) {
                // IP CHECKER --> SECURITY REASON -- TOKEN AUTH
                // GET USER ID 
                (async function () {
                    await axios.get('https://api.ipify.org?format=json')
                        .then(async data => {
                            const CURRENT_IP = data.data.ip;
                            const { geo } = user;
                            //console.log(geo[0]["ip"])
                            // CHECK IF THE CURRENT IP MATCHED WITH THE GIVEN IP 
                            if (CURRENT_IP == geo[0]["ip"]) {
                                console.log(`IP: ${CURRENT_IP} MATCHED WITH ---> ${geo[0]["ip"]}`);
                                // CHECK IF IN CASE USER HAS BEEN BLOCKED -- PREVENT ACCESSING
                                if (user.isBlocked) {
                                    return res.status(401).json({ status: 401, message: `user: ${user.username} Has Been Blocked!` })
                                }

                                // SIGN NEW TOKEN
                                const token = jwt.sign({ id: user._id, username, isBlocked: user.isBlocked, privateUrls: user.private_urls }, process.env.REFRESH_TOKEN, { expiresIn: '7d' });
                                // SEND TOKEN AS COOKIE
                                res.cookie('Auth-Token', token, { maxAge: 180000 * 24, httpOnly: true });
                                return res.status(200).json({ status: 200 });

                            } else {
                                //console.log(`${CURRENT_IP} DOESN\'t MATCH !!`);
                                // CREATE A SIMPLE TOKEN THAT CONTAINS 8 CHARACTERS
                                const TOKEN = SHORT_ID.generate();
                                // UPDATE THE USER ENTRY: LOGIN_TOKEN 
                                user.login_token = TOKEN;
                                // UPDATE USER GEO IP ENTRY
                                user.geo[0]['ip'] = CURRENT_IP;
                                await user.save((err, payload) => {
                                    if (err) {
                                        console.error(err.message)
                                        next(createError(400, err.message))
                                    }
                                    // LOG THE TOKEN TO THE LOGGER FILE
                                    TOKEN_LOGGER(req.url, TOKEN, username);
                                    // SEND THE TOKEN TO LIGITIMATE USER
                                    const mailOpts = {
                                        from: process.env.EMAIL,
                                        to: user.email,
                                        subject: 'SnapLink: Access TOKEN For Your SnapLink Account',
                                        html: `
                                        <h2>SnapLink Access Token - Important For Accessing Your SnapLink</h2>
                                        <p>Maybe Someone Wanna Access Your Account From This IP: ${CURRENT_IP}</p>
                                        <span>Your Access Token: ${TOKEN}</span>
                                    `
                                    };
                                    mail(mailOpts);
                                    //res.status(302).render('verify_token', { email: user.email, username: user.username });
                                    //res.cookie('SESSID', user._id, { maxAge: 180000 * 24, httpOnly: false });
                                    res.status(302).json({ status: 302, uid: user._id });
                                })

                            }
                        });
                })()
            }
        })
    } catch (err) {
        next(err);
    }
}
// HOME STATICS CONTROLL
exports.homeStatics = async (req, res, next) => {
    /*const token = res.get('Auth-Token');
    console.log(token)*/
    /*await axios.get(process.env.VISITORS_API).then(data => {
        console.log(data.data.value);
    })*/
    try {
        //let totalUsers;
        const totalUsers = await User.find().select('username geo');
        const articles = await Articles.find();

        await Url.find().select('original_url clicks createdBy')
            .exec((err, payload) => {
                if (err) {
                    return res.status(400).json('Error occuarte while getting payload!')
                }
                // calc total urls & clicks to display result in Home page
                const ttUrls = payload.map(url => url.original_url);
                const clicks = payload.map(clicks => clicks.clicks);
                // Total Clicks 
                const ttClicks = clicks.reduce((acc, curr) => acc + curr);
                return res.status(200).render('home', { totalUrls: ttUrls.length, totalClicks: ttClicks, totalUsers: totalUsers.length, users: totalUsers, articles: articles });
            })
    } catch (err) {
        console.log(err.message);
        next(err)
    }

}

// GRAB ALL USRLS
exports.urlsData = async (req, res) => {
    // IF THE CURRENT URL PROTOCOL NOT CORRECT USE: req.protocol
    const originUrl = 'https://' + req.get('host') + '/';

    // CHECK IF ERROR EXIST 
    /*if (err === 401) {
        return res.status(err.status || 401).json({ status: err.status, msg: 'You Have Been Blocked' })
    }*/

    // GET QUERIES
    const page = parseInt(req.query.page) || 1; // PAGE
    const limit = parseInt(req.query.limit) || 10; // LIMIT
    const skip = (page - 1) * limit;
    // GET TOTAL RECORDS
    const totalDocs = await Url.countDocuments();
    // GET TOTAL PAGES 
    const pages = Math.ceil(totalDocs / limit);
    // CHECK IF THE PAGE NUMBER MORE THAN TOTAL PAGES 

    if (page > pages) {
        return res.status(400).json({ status: 400, message: 'Page: ' + page + ' Not Found!' })
    }

    // PARSE PAGES 
    try {
        await Url.find().
            limit(limit).skip(skip).sort({ clicks: "desc" })
            //.select("original_url", "clicks")
            .exec((err, results) => {
                //!err && results !== null
                if (!err && results !== null) {
                    // Total Urls
                    const urls = results.map(url => {
                        return url.original_url;
                    });
                    const totalUrls = urls.length;
                    //console.log(urls.length);
                    const clicks = results.map(click => click.clicks);
                    const totalClicks = clicks.reduce((acc, current) => {
                        return acc + current;
                    })
                    return res.status(200).render("short-url", { urls: results, originUrl: originUrl, totalClicks: totalClicks, totalUrls: totalUrls, pages: pages, username: req.user.username });
                } else {
                    res.status(400).json({ status: 400, message: 'Bad Request' })
                }

            });
    } catch (err) {
        next(err);
    }


}

// CREATE NEW URL
exports.createUrl = async (req, res, next) => {
    const { url, slug } = req.body;
    // CATCH USERNAME FROM COOKIE 
    const token = req.cookies['Auth-Token'];

    //CHECK TOKEN IF VALIDE OR NOT
    if (!token) {
        console.log('Token Not Found! Please Sign up / Log in')
        return res.status(400).redirect('/sign-up')
    }

    // Global Variable
    let USER;

    // VERIFY THE TOKEN
    jwt.verify(token, process.env.REFRESH_TOKEN, { algorithms: ['SHA256', 'HS256'] }, (err, payload) => {
        // CHECK ERRORS
        if (err) {
            return next(createError(400, 'Incorrect Token ! Login / Sign up'));
            /*console.log('Incorrect Token')
            return res.status(400).json({ message: 'Incorrect Token! Login / Signup' })*/
        }

        // CHECK IF THE PAYLOAD EMPTY
        if (!payload || payload === null || payload === undefined) {
            console.log('Payload Empty! Something Went Wrong!');
            return next(createError(400, 'Payload Empty! Something Went Wrong!'));
        }

        // EXTRACT USERNAME --- > TOKEN
        USER = payload;
    })

    async function is_Blocked() {
        try {
            /*await User.findById(USER.id, (err, payload) => {
                if (err) {
                    return next(createError(400, 'Error: Thrown While Gathering User Payload!'));
                }

                if (!payload.isBlocked) {
                    return false;
                } else {
                    return true;
                }
            })*/
            const user_state = await User.findById(USER.id);
            // CHECK IF THE USER PAYLOAD NULL 
            if (!user_state || user_state === null || user_state === undefined) {
                return next(createError(404, 'Error: Misatke Thrown While Getting User Payload!'))
            }

            if (user_state.isBlocked) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            next(err);
        }
    }

    const urlRegex = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

    if (!url.match(urlRegex)) {
        // IF THE URL NOT MACTHED WITH URL PATTERN -- SEND RESPONSE 400
        res.status(400).json({ status: 400, respondeCode: 0, respondeDesc: 'Invalid URL: Ex(HTTP(S)://example.com)' })
        return;
    }
    // CHECK IF IN CASE USER HAS BEEN BLOCKED
    const check_is_blocked = await is_Blocked();
    if (check_is_blocked) {
        res.clearCookie('Auth-Token');
        return res.status(403).json({ status: 403, respondeCode: 0, respondeDesc: `${USER.username} Has Been Blocked!` })
    }

    // BASE URL
    const BASE_URL = req.protocol + '://' + req.get('host') + '/';

    async function IS_SLUG_EXIST() {
        try {
            // CHECK IF THE SLUG ALREADY EXIST IN URLs COLLECTION
            const isSlugExist = await Url.findOne({ short_url: slug });
            // CHECK IF THE RESPONSE NULL OR OPPOSITE
            if (!isSlugExist || isSlugExist === null || isSlugExist === undefined) {
                return false;
            } else {
                return true;
            }
        } catch (err) {
            next(err);
        }
    }


    // CREATE QR CODE && PROCESSING SHORTING URL 
    QRcode.toDataURL(url, async (err, qrcode_url) => {
        if (err) {
            return next(createError(400, 'ERROR: QRcode Failed! Try again later!'))
        }

        // SLUG OPERATION CODE GOES HERE
        // CHECK IF THE SLUG NOT PROVIDED IN THE REQUEST OBJECT BODY
        let URL_ID;
        if (!slug) {
            // GENERATE NEW RANDOM ID
            URL_ID = shortId.generate();
        } else {
            // CHECK THE LENGTH OF THE SLUG
            if (validator.isMax(slug, 10)) {
                return res.status(400).json({ status: 400, respondeCode: 0, respondeDesc: 'Slug Length Must Be Equal To: 10 Characters!' });
            }

            // CHECK IF THE SLUG EXIST
            const isExist = await IS_SLUG_EXIST();
            if (!isExist) {
                URL_ID = slug;
            } else {
                //URL_ID = shortId.generate();
                return res.status(400).json({ status: 400, respondeCode: 400, respondeDesc: 'Sorry! Slug Already On Use! Try Another One!' });
            }

        }

        // ASIGN PRIVATE URLS TO SEPECIFIC USER
        const USER_PV = USER;
        let newPv_Arr = USER_PV.privateUrls;

        // ADDING NEW ENTRY TO THE PRIVATE URLs (SOURCES - CLICKS) TO KEEP TRACK OF THE URLS
        /*function added_entry() {
            newPv_Arr.clicks = 0;
            newPv_Arr.sources = [];
            return newPv_Arr;
        };

        console.log('New Entry Added: ' + newPv_Arr.clicks, newPv_Arr.sources);
        const new_pv_state = added_entry();*/

        // CREATE NEW URL INSTANCE
        const newUrl = new Url({
            original_url: url,
            short_url: URL_ID,
            /*private_urls:
            {
                url: BASE_URL + URL_ID,
                original_url: url
            }*/
            createdBy: USER.username,
            qrcode: qrcode_url,
            date: moment().format('DD/MM/YYYY')
        });

        function add_private_url() {
            let pv_urls_clone = [...newPv_Arr];
            pv_urls_clone.push({ url: BASE_URL + newUrl.short_url, original_url: newUrl.original_url, date: newUrl.date });
            console.log('Cloned Array: ' + pv_urls_clone.clicks, pv_urls_clone.sources);
            return pv_urls_clone;
        }

        const private_url = add_private_url();
        console.log(private_url)

        try {
            await newUrl.save(async (err, payload) => {
                //CHECK IF ERROR EXIST
                if (err) {
                    return next(createError(400, 'ERROR: Bad Request While Creating URl!'));
                    //return res.status(400).json({ status: 400, msg: 'Bad Request While Createing URL!' })
                }

                // CHECK IF THE PAYLOAD FALSE 
                if (payload && (payload !== null || payload !== undefined)) {
                    await User.findOne({ _id: USER_PV.id }, async (err, payload) => {
                        if (err) {
                            console.error(err)
                            return next(createError(400, 'ERROR: Failed To Added URL To Private URLs Entry!'));
                            //return res.status(400).json({ status: 400, msg: 'Failed To Add URL to Private Entry!' })
                        }

                        /*payload.private_urls.push({
                            url: BASE_URL + newUrl.short_url,
                            original_url: newUrl.original_url,
                            date: newUrl.date,
                            clicks: 0,
                            sources: []
                        });*/

                        await User.updateOne({ _id: USER_PV.id }, { private_urls: private_url }, (err, updated_entry) => {
                            if (err) {
                                return next(createError(400, 'ERROR: Mistake While Updating User Private Url'))
                            }

                            /*(async function () {
                                const keys = Object.keys(updated_entry);
                                if (!keys.includes('sources')) {
                                    updated_entry.sources = [];
                                    updated_entry.clicks = 0;

                                    await updated_entry.save((err, result) => {
                                        if (err) {
                                            return next(createError(400, 'ERROR; Failed To Update User Docs!'))
                                        }

                                        
                                    })
                                }
                            })();*/
                            console.log('New Entries has Been Added: ' + updated_entry);
                        })
                    })
                }

                // ALERT SUCCESS MESSAGE
            });

            res.status(201).json({ respondeCode: 1, status: 201, respondeDesc: 'New URL Has Been Added Successfully!' })
        } catch (err) {
            console.error(err.message);
            next(err);
            //res.status(500).json({ status: 50, msg: 'Internal Server Error' });
        }
    })
}

// GET SINGLE URL 
exports.singleUrl = async (req, res, next) => {
    const inputShort = req.params.inputShort;
    let referer_source = req.headers.referer;
    const BASE_URL2 = req.protocol + '://' + req.get('host') + '/';

    await axios.get(process.env.VISITORS_API).then(data => {
        console.log(data.data.value);
    })

    // CHECK IF THE URL SOURCE NULL || UNDEFINED
    if (!referer_source || referer_source === null || referer_source === undefined) {
        referer_source = 'https://www.snaplink.com';
    }

    const get_url_country = async () => {
        let url_location;
        try {
            await axios.get(`https://api.ipify.org?format=json`)
                .then(async data => {
                    await axios.get(`https://ipapi.co/${data.data.ip}/json/`)
                        .then(data => {
                            console.log(data.data.country_name)
                            url_location = data.data.country_name;
                        })
                })
        } catch (err) {
            console.log(err)
            return;
        }
        console.log('URL Country (1): ' + url_location);
        return url_location;
    };
    const url_country = await get_url_country();
    //console.log(referer_source);
    // URL SOURCE INITAITE 
    const url_structure_source = (col, url_src) => {
        let sources_arr = col.sources;
        let mutable_sources_arr = [...sources_arr];
        mutable_sources_arr.push(url_src);
        return mutable_sources_arr;
    }

    // KEEP TRACK OF THE USER's PRIVATE-URLS  (CLICKS-SOURCES)
    const find_user_by_url_id = async () => {
        let user;
        try {
            await Url.findOne({ short_url: inputShort }, (err, user_payload) => {
                if (err) {
                    return next(craeteError(400, 'ERROR: Something Went Wrong While Getting User By URL ID!'));
                }

                if (!user_payload || user_payload === null || user_payload === undefined) {
                    return next(createError(404, 'USER NOT FOUND WITH GIVEN URL ID!'));
                }
                user = [user_payload.createdBy, user_payload._id];
            })
            return user;
        } catch (err) {
            console.log(err);
            s
            return next(err);
        }
    };


    const track_sources_urls = async () => {
        // GET RETURNED VALUE FROM THE BELOW FUNCTION
        const user_name = await find_user_by_url_id();

        try {
            await User.findOne({ username: user_name[0] }, async (err, payload) => {
                // CHECK IF THE ERROR THROWN
                if (err) {
                    console.log(err.message);
                    return next(createError(400, 'ERROR: Something Went Wrong While Getting USER!'));
                }

                // RE-CHECK IF THE USER PAYLOAD NOT FOUND IN DB
                if (!payload || payload === null || payload === undefined) {
                    console.log('Payload Empty!')
                    return next(createError(404, 'USER NOT FOUND WITH GIVEN USERNAME!'));
                }

                // CHECK IF THE URL SOURCE ALREADY EXIST IN SOME OBJECT IN SOURCES ARRAY
                const isSrcExist = () => {
                    // ITERATE THROUGH THE SOURCES ARRAY
                    let obj_indx;
                    payload.sources.map(async (source, index) => {
                        if (source.source === referer_source) {
                            obj_indx = [true, index];
                        } else {
                            return false;

                        }
                    });

                    return obj_indx;
                };

                const srcObj = isSrcExist();

                if (Array.isArray(srcObj)) {
                    if (srcObj[0]) {
                        payload.sources[srcObj[1]].visites = payload.sources[srcObj[1]].visites++;
                        try {
                            const updated_src_entry = await payload.save();
                            console.log('Updated Source Visites: ' + updated_src_entry);
                        } catch (err) {
                            return next(err);
                        }
                    }
                } else {
                    const update_src_url = () => {
                        // CHEKCK THE RETURNED VALUE FROM (isSrcExist) FUNCTION
                        let newPvClone = [...payload.sources];
                        // GETTING THE CLICKED URL COUNTRY (JUST FOR ANALYTICS PURPOSES)

                        console.log('Current Sources State: ' + newPvClone)
                        // NEW SOURCE OBJECT 
                        const src_obj = {
                            source: referer_source,
                            visites: 1,
                            country: url_country
                        };

                        console.log('New obj Source: ' + src_obj);

                        newPvClone.push(src_obj);
                        console.log(newPvClone);
                        return newPvClone;
                    }

                    // UPDATED SOURCES ARRAY --> SOURCE OBJECT {...}
                    const updated_sources_arr = update_src_url();
                    payload.sources = updated_sources_arr;
                    await payload.save((err, updatedUser) => {
                        if (err) {
                            return next(createError(400, 'ERROR: Failed To Update The Sources Entry!'))
                        }

                        console.log(updatedUser);
                    })
                }

            })
        } catch (err) {
            console.log(err);
            return next(err);
        }
    };

    // ADDING URL CLICKED SOURCE (www.snaplink.com)
    const push_url_source = (collection, refer) => {
        // URLs SOURCES CONTAINER []
        const sources_urls = url_structure_source(collection, referer_source);
        try {
            Url.updateOne(refer, { sources: sources_urls }, (err, url) => {
                if (err) {
                    return next(createError(404, 'ERROR: While Updating URL!'));
                }

                if (url) {
                    track_sources_urls();
                    return true;
                } else {
                    return false;
                }
            })
        } catch (err) {
            console.log(err);
            return next(err);
        }
    }
    try {
        await Url.findOne({ short_url: inputShort }, (err, result) => {
            if (!err && result !== null) {
                result.clicks++;
                if (!push_url_source(result, { short_url: inputShort })) {
                    result.save();
                    res.render('redirect', { url: result.original_url });
                } else {
                    console.log('URL SOURCE NOT UPDATED!')
                    return next(createError(400, 'URL SOURCE NOT UPDATED!'));
                }
                //result.sources.push(referer_source);
            } // Success
            else {
                res.status(404);
                //let outputRes = { id: inputShort };
                return res.render("404", { shortId: inputShort });
                //res.json({ message: "URL Doesn't Exist!" });
            }
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
}

// LOGOUT CONTROLL
exports.logoutUser = (req, res) => {
    // REMOVE TOKEN FROM CLIENT BROWSER STORAGE
    res.clearCookie('Auth-Token');
    return res.status(200).redirect('/');
}

// USER PROFILE CONTROLL
exports.userProfile = async (req, res) => {
    // CHATCH USER TOKEN 
    const token = req.cookies['Auth-Token'];

    await axios.get(process.env.VISITORS_API).then(data => {
        console.log(data.data.value);
    })
    //CHECK IF TOKEN EXIST
    if (!token) {
        console.error('Token Not Found!')
        return res.status(401).redirect('/login');
    }

    try {
        // VERIFY TOKEN 
        jwt.verify(token, process.env.REFRESH_TOKEN, { algorithms: ['SHA256', 'HS256'] }, async (err, payload) => {
            //CHECK IF ERROR EXIST
            if (err) {
                console.error(err.message);
                return res.status(401).json({ status: 401, msg: 'Unauthorized Access!' })
            }

            // EXTRACT ID --> payload
            const { id } = payload;

            // GET FULL INFO WITH GIVEN ID
            await User.findById(id).select('username email private_urls joined_at').exec((err, user) => {
                //CHECK IF ERROR EXIST
                if (err) {
                    console.error(err.message);
                    return res.status(400).json({ status: 400, msg: 'Error Occuart While Quering Operation' })
                }

                // SEND RESPONSE --> (PROFILE PAGE )
                console.log(user)
                res.status(200).render('profile', { user: user });
            })

        })
    } catch (err) {
        res.status(500).json({ status: 500, msg: 'Internal Server Error!' })
    }

}

// REMOVE URLs CONTROLL
/*exports.removeUrls = async (req, res) => {
    // CATCH URL ID 
    const { id } = req.body;
    try {
        // CHECK IF ID NULL
        if (!id || id === null) {
            console.log('Empty Value');
            return res.status(400).json({ status: 400, msg: 'Bad request While Processing Removing URL' });
        }

        // CHECK IF ID EXIST IN DB &
        // PROCESS REMOVE URL
        await Url.findByIdAndDelete(id, (err, payload) => {
            //CHECK ERROS IF EXIST
            if (err) {
                console.error(err.message);
                return res.status(400).json({ status: 400, msg: 'The Given ID Not Exist!' })
            }

            // SEND RESPONSE 
            res.status(200).json({ status: 200, msg: `URL ID: ${id} Has Been Removed!` });

        })
    } catch (err) {
        res.status(500).json({ status: 500, msg: 'Internal Server Error!' })
    }
}*/

// BLOCK USER CONTROLL
exports.blockUser = async (req, res) => {
    // CATCH USER ID 
    const { id } = req.body;
    console.table(req.body)
    try {
        // VALIDATE USER ID 
        if (!id || id === null) {
            return res.status(400).json({ status: 400, msg: 'The Given ID Not Valid!' })
        }

        // CHECK IF EXIST IN DB 
        await User.findByIdAndUpdate(id, { isBlocked: !false }, { new: true }, async (err, payload) => {
            // CHECK ERROR 
            if (err) {
                console.log('Something Went Wrong , While Gathering User Payload')
                return res.status(400).json({ status: 400, msg: 'Something Went Wrong , While Gathering User Payload' })
            }

            // UPDATE USER PAYLOAD -- (isBlocked Key)
            /*const { isBlocked } = payload;*/
            /*const updatedUserKey = {
                isBlocked: !false
            }*/

            /*await User.updateOne(id, updatedUserKey, { new: true }, (err, payload) => {
                if (err) {
                    return res.status(400).json({ status: 400, msg: 'Erro While Updating User' })
                }
            
                //FLY RESPONSE _-_-_-_-_-_
                console.log('User Has Been Blocked: ' + id)
                res.status(200).json({ status: 200, msg: `User: ${payload.username} Has Been Blocked!` });
            })*/

            //FLY RESPONSE _-_-_-_-_-_
            console.log('User Has Been Blocked: ' + id)
            res.status(200).json({ status: 200, msg: `User: ${payload.username} Has Been Blocked!` });

        })
    } catch (err) {
        res.status(500).json({ status: 500, msg: 'Internal Server Error' })
    }
}

// FORGOT PASSWORD CONTROLL 
exports.forgotPass = async (req, res) => {
    // CATCH USER E-MAIL
    const { email, captcha } = req.body;

    await axios.get(process.env.VISITORS_API).then(data => {
        console.log(data.data.value);
    })
    try {
        // CAPCTHA VALIDATION
        if (!captcha || captcha === undefined || captcha === '' || captcha === null) {
            console.log({ responseCode: 1, responseDesc: "Please Select Captcha" })
            return res.status(400).json({ responseCode: 1, confirmation: 'warning', responseDesc: "Please Select Captcha" })
        }

        // SECRET KEY
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;

        // VERIFY URL
        const verifyUrl = `https://google.com/recaptcha/siteverify?secretkey=${secretKey}&response=${captcha}&remoteip=${req.connection.remoteAddress}`;

        // MAKE REQUEST TO VERIFY URL
        const CAP_RESP = await fetch(verifyUrl).then(data => data);
        console.log(CAP_RESP)
        // Success Will Be True or False Depending upon Captcha Validation
        if (CAP_RESP.success !== undefined && !CAP_RESP.success) {
            return res.status(400).json({ responseCode: 1, confirmation: 'failed', responseDesc: 'Failed Captcha Verification' })
        }

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ status: 500, msg: 'Internal Server Error' })
    }

    // CHECK IF EMAIL TRUE 
    if (!email || email === null) {
        return res.status(400).json({ status: 400, msg: 'Unexpected Empty E-mail Input!' })
    }

    if (!validator.isEmail(email)) {
        console.log(`${email}: E-mail Field Must Be Valid!`);
        return res.status(400).json({ status: 400, msg: `${email}: E-mail Field Must Be Valid!` })
    }

    try {
        // VERIFY IF EMAIL EXIST
        await User.findOne({ email }, (err, payload) => {
            //CHECK IF ERROR EXIST
            if (err) {
                console.error(err);
                return res.status(400).json({ status: 400, msg: 'Something Went Wrong!' })
            }

            // CHECK IF PAYLOAD NOT EMPTY
            if (!payload || payload === null) {
                return res.status(400).json({ status: 400, msg: 'The Given E-mail Not Exist ! Please Sign up.' })
            }

            console.table(payload);
            //SIGN A UNIQUE TOKEN
            const token = jwt.sign({ id: payload._id }, process.env.AUTH_SECRET, { expiresIn: '30m' });

            // MAIL TOKEN TO TARGET
            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: 'SnapLink: Reset Link Activation',
                html: `
        <h1>Hey ${payload.username}, here's Your Reset Link Activation, Be Carefull its only Valid in 30 Minutes!!</h1> 
        <a href="${process.env.BASE_URL}/reset-password/${token}" >Activate Your Account</a>
    `
            }
            mail(mailOptions);

            // SEND RESPONSE 
            res.status(200).json({ status: 200, msg: `Reset Link Has Been Sent To: ${email}` });
        })
    } catch (err) {
        res.status(500).json({ status: 500, msg: 'Internal Server Error!' })
    }
}

// RESET PASSWORD CONTROLL
exports.resetPass = async (req, res) => {
    // CATCH TOKEN AS PARAMS
    const { token } = req.params;
    /*const Token = req.cookies['Auth-Token'];

    // CHECK IF TOKEN NOT EXIST
    if (!Token) {
        return res.status(401).json({ status: 401, warningMsg: 'Unauthorized Access!' })
    }*/

    // CHECK IF PARAMS NOT EXIT 
    if (!token || token === null) {
        return res.status(400).redirect('/');
    }


    try {
        // VERIFY & DECODE TOKEN
        jwt.verify(token, process.env.AUTH_SECRET, { algorithms: ['SHA256', 'HS256'] }, async (err, payload) => {
            // CHECK IF ERROR EXIST
            if (err) {
                return res.status(400).json({ status: 400, msg: 'Invalid Token / Expires!' })
            }

            // CHECK IF PAYLOAD NULL
            if (!payload || payload === null) {
                return res.status(400).json({ status: 400, msg: 'User Not Found With This Token' })
            }

            res.status(200).render('reset_password', { id: payload.id });

        })
    } catch (err) {
        res.status(500).json({ status: 500, msg: 'Internal Server Error!' })
    }
}

// CHANGE PASSWORD CONTROLL
exports.changePass = async (req, res) => {
    // CATCH USER INFO 
    //const Token = req.cookies['Auth-Token'];
    const { password, id, captcha } = req.body;

    // CHECK IF TOKEN NOT EXIST
    /*if (!Token) {
        return res.status(401).json({ status: 401, warningMsg: 'Unauthorized Access!' })
    }*/

    // CHECK ID IF NULL
    if (!id || id === null) {
        return next(createError(400, 'Unexepected Empty ID! (Important)'));
        //return res.status(400).json({ status: 400, msg: 'Unexepected Empty ID! (Important)' })
    }

    try {
        // CAPCTHA VALIDATION
        if (!captcha || captcha === undefined || captcha === '' || captcha === null) {
            console.log({ responseCode: 1, responseDesc: "Please Select Captcha" })
            return res.status(400).json({ responseCode: 1, confirmation: 'warning', responseDesc: "Please Select Captcha" })
        }

        // SECRET KEY
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;

        // VERIFY URL
        const verifyUrl = `https://google.com/recaptcha/siteverify?secretkey=${secretKey}&response=${captcha}&remoteip=${req.connection.remoteAddress}`;

        // MAKE REQUEST TO VERIFY URL
        const CAP_RESP = await fetch(verifyUrl).then(data => data);
        // Success Will Be True or False Depending upon Captcha Validation
        if (CAP_RESP.success !== undefined && !CAP_RESP.success) {
            return res.status(400).json({ responseCode: 1, confirmation: 'failed', responseDesc: 'Failed Captcha Verification' })
        }

    } catch (err) {
        next(createError(500, 'Error: Internal Server Error 500'))
    }
    try {
        // HASH PASSWORD 
        const hashedPass = bcrypt.hashSync(password, 10);

        // FIND USER & UPDATE BY ID
        await User.findByIdAndUpdate(id, { password: hashedPass }, (err, payload) => {
            // CHECK IF ERROR EXIST
            if (err) {
                return res.status(400).json({ status: 400, msg: 'Error Accuarte While Updating User! Try Later.' })
            }

            // SEND RESPONSE
            res.status(200).json({ status: 200, msg: `${payload.username} Has Been Change Password Successfully` })
        })
    } catch (err) {
        res.status(500).json({ status: 500, msg: 'Internal Server Error!' })
    }
}

// SIGN UP ADMIN ROUTE
exports.adminSignup = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // HASH PASSWORD
        const hashPass = await bcrypt.hashSync(password, 10);
        // CRATE ADMIN
        const newAdmin = new Admins({
            username: username,
            email: email,
            password: hashPass
        });

        //SAVE
        const savedAdmin = await newAdmin.save();
        console.log(savedAdmin)
        res.status(201).json(savedAdmin);
    } catch (err) {
        res.status(500).json(err.message);
    }

}

// ADMIN CONTROLL -- LOGIN API
exports.adminLogin = async (req, res) => {
    // CATCH ADMIN INFO
    const { username, password, captcha } = req.body;

    try {
        // CAPCTHA VALIDATION
        if (!captcha || captcha === undefined || captcha === '' || captcha === null) {
            console.log({ responseCode: 1, responseDesc: "Please Select Captcha" })
            return res.status(400).json({ responseCode: 1, confirmation: 'warning', responseDesc: "Please Select Captcha" })
        }

        // SECRET KEY
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;

        // VERIFY URL
        const verifyUrl = `https://google.com/recaptcha/siteverify?secretkey=${secretKey}&response=${captcha}&remoteip=${req.connection.remoteAddress}`;

        // MAKE REQUEST TO VERIFY URL
        const CAP_RESP = await fetch(verifyUrl).then(data => data);
        console.log(CAP_RESP)
        // Success Will Be True or False Depending upon Captcha Validation
        if (CAP_RESP.success !== undefined && !CAP_RESP.success) {
            return res.status(400).json({ responseCode: 1, confirmation: 'failed', responseDesc: 'Failed Captcha Verification' })
        }

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ status: 500, msg: 'Internal Server Error' })
    }

    // VALIDATE ADMIN INFO
    if (username && password === null) {
        return res.status(400).json({ status: 400, msg: 'Inputs Cannot Be Empty' })
    }

    try {
        // CHECK IF ADMIN USER EXIST IN DB
        await Admins.findOne({ username }, async (err, adminPayload) => {
            // ERROR HANDLING
            if (err) {
                return res.status(500).json({ status: 500, msg: 'Internal Server Error' })
            }
            //VALIDATE IF ADMIN NULL OR OPPOSITE
            if (adminPayload === null) {
                console.log(`Admin: ${req.body.username} Not Exist!`)
                return res.status(400).json({ status: 400, msg: `Admin: ${req.body.username} Not Exist!` })
            }

            // CHECK IF ADMIN HAS A ROLE OF (ADMIN), !IMPORTANT!

            // COMPARE ADMIN's HASHED PASSWORD
            const validatePass = await bcrypt.compare(password, adminPayload.password);
            console.log(`password: ${password} -- ${adminPayload.password}`)
            console.log(validatePass)
            // CHECK THE HASHED PASSWORD IF VALIDE
            if (!validatePass) {
                console.log('Incorrect Password / Username')
                return res.status(400).json({ status: 400, msg: 'Incorrect User / Password' });
            }

            // CHECK ADMIN ROLE (IN CASE IF HE DIDN'T Authorized as ADMIN)
            (async function () {
                if (!adminPayload.isAdmin) {
                    // GET IP BASED ON LOCATION
                    let AD_IP = null;
                    await axios.get('https://api.ipify.org?format=json').then(data => {
                        AD_IP = data.data.ip
                    });
                    // MAIL OPTIONS
                    const mailOptions = {
                        from: process.env.EMAIL,
                        to: 'M.brtouli997@gmail.com',
                        subject: `SnapLink: Alert!! ${adminPayload.email} Detected  Access To Admin Panel `,
                        html: `
            <h1>${adminPayload.username} has been Access Without Permissions!</h1> 
            <h2>Email: ${adminPayload.email}</h2>
            <h2>Username: ${adminPayload.username}</h2>
            <h2>IP: ${AD_IP}</h2>
        `
                    }
                    res.status(401).redirect('/')
                    mail(mailOptions);
                }

                return;
            })();

            // GRAB ADMIN INFO
            const { username, _id, email, isAdmin, isActive } = adminPayload;
            // SIGN THE TOKEN 4 ADMIN
            const token = jwt.sign({ username, _id, email, isAdmin, isActive }, process.env.AUTH_SECRET, { expiresIn: '1d' });

            // FLY TOKEN TO RES HEADERS
            res.cookie('Token', token, { maxAge: 18000 * 60 * 60, httpOnly: true });
            res.status(200).json({ status: 200, msg: 'Logging Successfully' })
        })
    } catch (err) {
        res.status(500).json({ status: 500, msg: 'Internal Server Error' })
    }

}

//ADMIN CONTROLL -- SIGN OUT / LOG OUT
exports.signOut = (req, res) => {
    // GRAB TOKEN FORM REQ OBJ
    res.clearCookie('Token');
    return res.status(200).redirect('/admin-login')
}

// ADMIN PANNEL CONTROLL
exports.adminPannel = async (req, res) => {

    // RETRIVE THE SPECIFIC DATA --> ADMIN PANNEL
    try {
        // INITIATE USERS VARIABLE
        let totalUsers;
        await User.find((err, users) => {
            // CHECK IF ERROR EXIST
            if (err) {
                return res.status(500).json(err.message)
            }

            totalUsers = users;

        })
        await Url.find((err, payload) => {
            //CHECK IF ERROR EXIST
            if (err) {
                return res.status(500).json({ status: 500, msg: 'Internal Server Error' })
            }

            // PARSING DATA FROM DB
            // Total Urls
            const urls = payload.map(url => {
                return url.original_url;
            });
            const totalUrls = urls.length;
            //console.log(urls.length);
            const clicks = payload.map(click => click.clicks);
            const totalClicks = clicks.reduce((acc, current) => {
                return acc + current;
            })
            // GET ALL URL's SOURCES FUNCTION
            function get_sources() {
                let urls_sources = [];
                payload.map(url => {
                    for (let source of url.sources) {
                        urls_sources.push(source);
                        return urls_sources;
                    };
                });

                return urls_sources;
            };

            // URLs SOURCES RESULT 
            const sources = get_sources();

            // RENDER DATA TO THE STATISTCS ADMIN PANNEL
            return res.status(200).render('admin_panel', { totalUrls: totalUrls, totalClicks: totalClicks, totalUsers: totalUsers, adminName: req.user.username, sources: sources })

        })
    } catch (err) {
        res.status(500).json({ status: 500, msg: 'Internal Server Error' })
    }
}

// URLS LIST PANNEL CONTROLL
exports.urlsList = async (req, res) => {
    // HOSTNAME URL
    const originUrl = req.protocol + '://' + req.get('host') + '/';
    // CATCH TOKEN 
    const token = req.cookies['Token'];

    // CHECK TOKEN IF EXIST
    if (!token) {
        return res.status(401).json({ status: 401, msg: 'Token Not Exist!' })
    }
    // INITIATE VARIBALE
    let user;
    // VALIDATE TOKEN
    jwt.verify(token, process.env.AUTH_SECRET, { algorithms: ['SHA256', 'HS256'] }, (err, payload) => {
        // CHECK ERRORS 
        if (err) {
            return res.status(400).json({ status: 400, msg: 'Invalid Token / Expires' })
        }

        // CEHCK IF PAYLOAD NULL
        if (!payload || payload === null) {
            return res.status(400).json({ status: 400, msg: 'Something Went Wrong! Try Later' })
        }

        // EXTRACT USER FROM PAYLOAD
        const { username } = payload;
        user = username;
    })
    try {
        // RETRIVE ALL URLS DATA
        await Url.find().sort({ clicks: 'desc' }).exec((err, payload) => {
            //CHECK ERRORS IF EXIST
            if (err) {
                console.error(err.message);
                return res.status(400).json({ status: 400, msg: 'Bad Request While Gathering URLS' });
            }

            // SEND RESPONSE WITH PAYLOAD (URLS)
            res.status(200).render('urls_list', { urls: payload, originUrl: originUrl, admin: user })
        })
    } catch (err) {
        res.status(500).json({ status: 500, msg: 'Inter Server Error' })
    }
}

// GRAPHING DATA API
exports.flyData = async (req, res) => {
    // CATCH TOKEN
    const Token = req.cookies['Token'];
    // CHECK IF EXIST
    if (!Token) {
        console.log('Unothorized Access')
        return res.status(401).json({ status: 401, msg: 'Unothorized Access!' })
    }

    // NOTE: IMPROVE THE PERFOMANCE OF THIS BLOCK LATER !!
    // VALIDATE TOKEN
    await jwt.verify(Token, process.env.AUTH_SECRET, { algorithms: ['SHA256', 'HS256'] }, async (err, payload) => {
        // CHECK ERROR
        if (err) {
            console.error(err.message);
            return res.status(400).json({ status: 400, msg: err.message })
        }

        // VALIDATE PAYLOAD
        if (payload === null) {
            return res.status(400).json({ status: 400, msg: 'Bad Request !' })
        }

        // EXTRACT DATA
        const { _id } = payload;

        // VALIDATE ADMIN CREDENTIALS
        await Admins.findOne({ _id }, async (err, adminPayload) => {
            // CHECK ERROR
            if (err) {
                return res.status(400).json({ status: 400, msg: 'Bad Request!' })
            }

            // VALIDATE ADMIN ROLES
            if (adminPayload.isAdmin) {
                // RETRIVE * DATA
                let ALL_USERS;
                User.find().select('username isBlocked').exec((err, payload) => {
                    //CHECK ERROR
                    if (err) {
                        return res.status(400).json({ status: 400, msg: 'Bad Request!' })
                    }

                    //CHECK PAYLOAD IF NULL
                    if (!payload || payload === null) {
                        return res.status(400).json({ status: 400, msg: 'Payload Empty! No Users Found.' })
                    }

                    ALL_USERS = payload;
                })

                await Url.find((err, urls) => {
                    //CHECK ERRORS IF EXISTS
                    if (err) {
                        console.error(err.message)
                        return res.status(400).json({ status: 400, msg: 'Bad Request ! Please Try again later...' });
                    }

                    // VALIDATE IF PAYLOAD TRUE NOT OPPOSITE
                    if (urls !== null) {
                        // calc total urls & clicks to display result in Home page
                        const ttUrls = urls.map(url => url.original_url);
                        const clicks = urls.map(clicks => clicks.clicks);
                        // Total Clicks
                        const ttClicks = clicks.reduce((acc, curr) => acc + curr);
                        console.log(ALL_USERS)
                        res.status(200).json({ status: 200, data: { urls, totalClick: ttClicks, totalUrls: ttUrls.length, totalUsers: ALL_USERS } })
                    }
                })
            } else {
                res.status(500).json({ status: 500, msg: 'Internal Server Error' })
            }
        })
    })
}

// NEWSLETTER SUBSCRIBERS API CONTROLLER
exports.addSubscriber = async (req, res, next) => {
    // CATCH EMAIL VALUE FRON REQUEST OBJECT
    const { email } = req.body;
    console.log(email)
    // CHECK E-MAIL IF EXIST 
    if (!validator.isEmail(email)) {
        return res.status(400).json({ status: 400, msg: 'E-mail provided Not Valid !' })
    }

    const addSubscriber = async () => {
        const newSubscriber = new Subscribers({
            email: email
        });

        await newSubscriber.save((err, payload) => {
            // CATCH ERROR IF EXIST
            if (err) {
                return next(createError(400, 'Error: Faild To Create New Blog!'));
            }

            // CHECK IF THE PAYLOAD NULL OR NOT TRUE (UNDEFINED)
            if (!payload || payload === null || payload === undefined) {
                return res.status(400).json({ status: 400, msg: 'Error: something went wrong!' });
            }

            // REMINDE THE SUBSCRIBER WITH E-MAIL (201 RESPONSE)
            if (payload) {
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: payload.email,
                    subject: `Welcome to SnapLink Newsletter!`,
                    html: `
                        You Joined To Our NewsLetter & Updates , To Keep you Up-To-Date! <br />
                        <div style="display:flex;justify-content:center;align-ite;s:center;">
                        <button
                            style="
                            padding: 10px 35px;
                            border: none;
                            outline: none;
                            border-radius: 24px;
                            background: linear-gradient(70deg,hsl(224, 76%, 59%), hsl(225, 40%, 72%));
                            "
                        >
                        <a href="localhost:4041/sign-up" style="text-decoration: none;color:#fff;">Sign up</a>
                        </button>
                            ||
                            <button
                            style="
                            padding: 10px 35px;
                            border: none;
                            outline: none;
                            border-radius: 24px;
                            background: linear-gradient(70deg,hsl(224, 76%, 59%), hsl(163, 83%, 54%));
                            "
                        >
                        <a href="localhost:4041/login" style="text-decoration: none;color:#fff;">Login</a>
                        </button>
                        </div>
                        
                    `
                }
                mail(mailOptions);
            }

            res.status(201).json({ status: 201, msg: 'Thank You ! For Subscribed With Us!' });
        })
    }

    try {
        // CHECK IF THE SUBSCRIBER ALREADY EXIST ON THE DB 
        await Subscribers.findOne({ email: email }, (err, subscriber) => {
            if (err) {
                return next(createError(400, 'ERROR: Failed To Fetch DB!'))
            }

            if (subscriber) {
                console.log('Subscriber Email Already On Use!');
                return res.status(400).json({ responseCode: 0, status: 400, msg: 'Subscriber With This Already Subscribed!' });
            }
            // EXECUTE ADDING SUBSCRIBER FUNCTION
            addSubscriber();

        })
    } catch (err) {
        next(err);
    }

}


// VERIFY TOKEN ACCESS API CONTROLLER
exports.verifyTokenAccess = async (req, res, next) => {
    // GET TOKEN ACCESS FROM REQUEST OBJECT
    const { token_access, uid } = req.body;
    console.log(`ACCESS TOKEN: ${token_access} / UID: ${uid}`);

    // CHECK IF THE TOKEN NOT EXIST
    if (!token_access || token_access === null) {
        return res.status(400).json({ status: 400, msg: 'Token Access Not Provided!' });
    }

    // GET USER ID 
    try {
        // OPERATE A SEARCH LOOKUP TO DB & CHECK IF THE USER ACCESS TOKEN MATCHED WITH GIVEN ONE
        await User.findById(uid, async (err, user) => {
            // CHECK IF ERROR HAPPENED
            if (err) return console.error(err.message);
            // CHECK IF USER PAYLOAD NULL OR EMPTY
            if (!user || user == null || user == "") {
                return res.status(302).redirect('/sign-up');
            }

            // USER STATE - PAYLOAD
            const { login_token, username } = user;
            // CONSOLE THE USER _ID & USERNAME
            console.log(login_token, username);
            const isAccessTokenMatched = login_token === token_access ? true : false;
            // CONSOLE THE MATCHED ACCESS TOKEN
            console.log('IS ACCESS TOKEN MATCHED: ' + isAccessTokenMatched);

            //BASED ON THE ACCESS TOKEN IF IT IS MATCHED AUTHERIZE THE USER TO ACCESS
            if (!isAccessTokenMatched) {
                // BLACK LIST THE SUPECIOUS IP 
                const black_list_ips = [];
                return res.status(401).redirect('/sign-up');
            } else {
                // UPDATE WITH CURRENT IP
                await axios.get('https://api.ipify.org?format=json').then(data => {
                    user.geo[0]['ip'] = data.data.ip;
                });


                console.log('USER: ' + username + ' Authenticate Successfully 100%');
                // SIGN NEW TOKEN
                const ACCESS_TOKEN = jwt.sign({ id: user._id, username, isBlocked: user.isBlocked, privateUrls: user.private_urls }, process.env.REFRESH_TOKEN, { expiresIn: '7d' });
                // RE-ASSIGN THE USER LAST ACCESS TO TOKEN TO EMPTY VALYE - ITS TEMPORARY VALUE
                user.last_token = "";
                await user.save((err, payload) => {
                    if (err) return console.error(err.message);

                    if (!payload || payload === null || payload === '') {
                        return res.status(400).json({ status: 400, msg: 'FAILED TO RE-ASSIGN THE USER LAST TOKEN VALUE' });
                    }
                })
                // SEND TOKEN AS COOKIE
                res.cookie('Auth-Token', ACCESS_TOKEN, { maxAge: 180000 * 24, httpOnly: true });
                return res.status(200).json({ status: 200, msgSuccess: 'Token Verified Successfully 100%' });
            }
        })
    } catch (err) {
        console.error(err.message) // CONSOLE TH ERROR MESSAGE
        next(err)
    }
};

// CREATE A PLAN REQUEST API ENDPOINT CONTROLL
exports.planRequest = async (req, res) => {
    // GET PLAN REQUEST INFO OBJECT
    const PLAN_INFO = req.body;
    // CHECK IF PLAN INFO NULL / UNDERFINED
    if (!PLAN_INFO || PLAN_INFO === null || PLAN_INFO === undefined) {
        console.log(new Error('FAILED: PLAN REQUEST NOT PROVIDED!'));
        return res.status(400).json({ status: 400, msgError: 'Warning: Plan Info Not Provided!' })
    }

    // SUBSCRIPTION PLAN OBJECT
    const subscription_plans_period = {
        Tester: [0, 07],
        Starter: [1, 30],
        Professional: [4.99, 90],
        Business: [10.99, 180]
    };

    // GET THE DEADLINE AD WITH GIVEN SUBSCRIPTION PLAN
    const get_plan_deadline = (PLAN_PERIOD) => {
        // CHECK IF THE PLAN_PERIOD IS NUMBER NOT STRING
        if (Number(PLAN_PERIOD)) {
            // GET CURRENT DATE
            //const current_date = new Date().toISOString().substring(0, 10);
            // GET PARTS OF  NEW DATE OBJECTS 
            const curr_year = new Date().getFullYear();
            const curr_month = new Date().getMonth();
            const curr_day = new Date().getDate() + 1;

            console.log(curr_year, curr_month, curr_day)

            // GET PLAN DEADLINE
            const plan_deadline = new Date(curr_year, curr_month, curr_day + Number(PLAN_PERIOD)).toISOString().substring(0, 10);
            console.log('PLAN DEADLINE: ' + plan_deadline);
            return plan_deadline;
        } else {
            return new Error('FAILED TO CALCUL PLAN PERIOD :(')
        }
    }

    try {
        const create_subscription_plan = () => {
            // CREATE AN INSTANCE OF AN OBJECT FOR SUBSCRIPTION PLAN 
            const plan_keys = Object.keys(PLAN_INFO);
            const subscription_obj = {};
            plan_keys.map(plan_key => {
                subscription_obj[plan_key] = PLAN_INFO[plan_key];
                if (plan_key === "plan_type") {
                    switch (PLAN_INFO[plan_key]) {
                        case "Professional":
                            const pro_plan = get_plan_deadline(subscription_plans_period['Professional'][1]);
                            subscription_obj['budget'] = 4.99;
                            subscription_obj['period'] = pro_plan;
                            return subscription_obj;
                        case 'Business':
                            const bs_plan = get_plan_deadline(subscription_plans_period['Business'][1]);
                            subscription_obj['budget'] = 10.99;
                            subscription_obj['period'] = bs_plan;
                            return subscription_obj;
                        case 'Starter':
                            const st_plan = get_plan_deadline(subscription_plans_period['Starter'][1]);
                            subscription_obj['budget'] = 1;
                            subscription_obj['period'] = st_plan;
                            return subscription_obj;
                        case 'Tester':
                            const tr_plan = get_plan_deadline(subscription_plans_period['Tester'][1]);
                            subscription_obj['budget'] = 0;
                            subscription_obj['period'] = tr_plan;
                            return subscription_obj;
                    }

                }
                //return subscription_obj;
            })

            return subscription_obj;
        };

        const new_subscription_plan = create_subscription_plan();
        console.log(new_subscription_plan);

        // CREATE NEW SUBSCRIOPTION OBJECT 
        const newSubscriptionPlan = new Ads_Banners(new_subscription_plan);

        // SAVE THE SUBSCRIPTION RECORD TO DB 
        await newSubscriptionPlan.save((err, savedSubscription) => {
            if (err) return res.status(400).json({ status: 400, errorMsg: 'Operation Failed While Saving Plan Subscription' });

            // CONSOLE THE PAYLOAD 
            console.log(savedSubscription);

            //SEND A SUCCESS REQUEST 200 OK TO CLIENT SIDE
            res.status(201).json({ confirmation: true, plan: savedSubscription })
        })
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ status: 500, errorMsg: 'ERROR: INTERNAL SERVER ERROR_500' });
    }
}

// CREATE A CLIENT (PUBLIC) ADS API 
exports.publicAds = async (req, res) => {
    // GET ALL COMPAIGNS BASED-ON ACTIVE COMPAIGNS
    try {
        await Ads_Banners.find({ budget: { $gte: 0 }, ad_status: false }).select('clicks budget banner title url ad_size').exec((err, payload) => {
            if (err) return next(createError(400, 'FAILED: Something Went Wrong :('));
            // CHECK IF THE PAYLOAD NOT EMPTY
            if (!payload || payload === null || payload === undefined) {
                return res.status(204).json({ status: 204 });
            };

            // FILTER BASED-ON CLICKS
            const TOP_COMPAIGNS = c => {
                return c.filter(cn => {
                    // THE CLICKS CONDITION CAN BE RE-VALUED
                    return cn.clicks === 0;
                });
            };

            const FILTRED_COMPAIGNS = TOP_COMPAIGNS(payload);

            // CHECK THE LENGTH OF FILTRED TOP COMPAIGNS 
            if (!FILTRED_COMPAIGNS.length > 0 || TOP_COMPAIGNS === null) {
                return res.status(204).json({ status: 204 });
            }

            // APPEND THE COMPAIGN POSITION 
            /*function setAllowedPositions() {
                for (let i = 0; i < FILTRED_COMPAIGNS.length; i++) {
                    if (FILTRED_COMPAIGNS[i]['plan_type'] === "Business") {
                        FILTRED_COMPAIGNS[i].allowed_positions = { home: true, articles: true, redirect_page: true, popup: true };
                    } else {
                        FILTRED_COMPAIGNS[i].allowed_positions = null;
                    }
                    switch (FILTRED_COMPAIGNS[i]['plan_type']) {
                        case "Tester":
                            FILTRED_COMPAIGNS[i].allowed_positions = { home: false, articles: true, redirect_page: true };
                        case "Started":
                            FILTRED_COMPAIGNS[i].allowed_positions = { home: false, articles: true, redirect_page: true };
                        case "Professional":
                            FILTRED_COMPAIGNS[i].allowed_positions = { home: true, articles: true, redirect_page: true };
                        case "Business":
                            FILTRED_COMPAIGNS[i].allowed_positions = { home: true, articles: true, redirect_page: true, popup: true };
                    }
                };
            };*/

            res.status(200).json({ status: 200, compaigns: FILTRED_COMPAIGNS });
        });
    } catch (err) {
        next(err);
    }
}

// UPDATE PROFILE SETTINGS - 2FACTORY
exports.updateProfileSettings = async (req, res) => {
    // GET TOKEN AS COOKIE FORM REQUEST OBJECT
    const Token = req.cookies['Auth-Token'];
    // GET REQUEST DATA FROM REQUEST OBJECT
    const settingsObj = req.body;

    //CHECK TOKEN IF VALIDE OR NOT
    if (!Token) {
        return res.status(401).redirect('/login')
    }

    try {
        // VERIFY & DECODE TOKEN
        jwt.verify(Token, process.env.REFRESH_TOKEN, { algorithms: ['SHA256', 'HS256'] }, async (err, payload) => {
            // CHECK IF ERROR EXIST
            if (err) {
                return res.status(400).json({ success: false, msgError: 'Invalid Token / Expires!' })
            }

            // GET THE USERNAME FROM THE TOKEN DATA
            const { id } = payload;
            // CHECK IF THE USER ABLE / DISABLE THE 2-FACTORY SECURITY
            let isEnabled = '';
            if (settingsObj.is2FactoryEnable === "true") {
                isEnabled = 'Enabled'
            } else if (settingsObj.is2FactoryEnable === "false") {
                isEnabled = 'Disabled'
            }
            const is2FA = isEnabled == 'Enabled' ? true : false;
            // CHECK IF THE GIVEN USER EXIST OR NOT
            await User.findByIdAndUpdate(id, { is2FEnable: is2FA }, async (err, user_payload) => {
                if (err) return res.status(400).json({ success: false, msgError: "Failed To Lookup For Provided User ID!" })

                if (!user_payload || user_payload == null || user_payload == undefined) {
                    return res.status(404).json({ success: false, msgError: "User With Given Token ID Not Exist!" });
                }

                if (user_payload) {
                    console.log('IsEnabled: ' + user_payload.is2FEnable)
                    // RESPOND TO THE CLIENT
                    res.status(200).json({ success: true, response: `2-Factory Option: ${isEnabled}` })
                }
                // UPDATE USER 2-Factory Security Setting option
                /*user_payload.is2FEnable = Boolean(settingsObj.is2FactoryEnable);
                await user_payload.save((err, payload) => {
                    if (err) return res.status(400).json({ success: false, msgError: 'Failed While Updating User State!' })
                    if (payload) {
                        
                    }

                })*/
            })

        })
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ status: 500, msg: 'Internal Server Error!' })
    }
}

/*console.log('Token Access: ' + token_access);
res.status(200).json({ status: 200, msg: 'Thank you! Your Access Token: ' + token_access });*/