const Url = require('../model/urlSchema');
const jwt = require('jsonwebtoken');
const Admins = require('../model/adminSchema'); // ADMIN SCHEMA
const Ads_Banners = require('../model/adsSchema'); // ADS SCHEMA MODEL
const Subscribers = require('../model/subscriberSchema'); // NewsLetter Model / Schema
const mail = require('../configuration/mail'); // MAILER
const validator = require('../services/util/validator'); // VALIDATOR
const isMongoID = require('mongoose').Types.ObjectId.isValid; // METHOD TO CHECK FOR VALID MONGO  OBJECT
const createError = require('http-errors');
const path = require('path');
const mime = require('mime');
const fs = require('fs');
const shortid = require('shortid');
const moment = require('moment');
const User = require('../model/userSchema'); // USER SCHEMA



// IMPORT HELPERS MODULES 
const tokenValidator = require('../services/util/tokenValidator');

// HELPER UTILITY
const ADMIN_TOKEN_AUTH = async (token, cb) => {
    // CHECK IF THE TOKEN EXIST
    if (!token || token === null || token === '' || token === undefined) {
        return cb(new Error('ERROR: TOKEN NOT PROVIDED!'), null)
    }

    try {
        await jwt.verify(token, process.env.AUTH_SECRET, { algorithms: ['SHA256', 'HS256'] }, (err, payload) => {
            if (err) return cb(err, null);
            // DESTRUCTURE THE TOKEN PAYLOAD & VERIFY IF THE TOKEN HAD PREVILEGES FOR ADMIN
            if (payload.isAdmin && payload.isActive) {
                return cb(null, payload)
            } else {
                return cb(new Error('NO ACCESS! FORBIDEN 401'), null);
            }
        })
    } catch (err) {
        console.log(err);
        return cb(new Error('ERROR: SERVER INTERNAL ERROR 500'), null)
    }
}

// REMOVE USER CONTROLL
exports.removeUser = async (req, res, next) => {
    // CATCH USER ID 
    const { id } = req.body;
    const token = req.cookies['Token'];

    // CHECK IF THE TOKEN NULL
    if (!token || token === null || token === undefined) {
        return res.status(404).json({ success: false, msgError: 'Token Not Found / Expires' })
    }

    // TOKEN VERIFICATION - VALIDATION
    await ADMIN_TOKEN_AUTH(token, async (err, admin_payload) => {
        if (err) return next(err);
        // DESTRUCTURE THE ADMIN PAYLOAD CREDS
        const { _id, username, isActive } = admin_payload;
        // VALIDATE THE ADMIN CREDS AGAINST DB - IF EXIST
        await Admins.findById(_id, async (err, payload) => {
            if (err) return res.status(400).json({ success: false, msgError: 'Something Went Wrong!' });
            if (!payload || payload == null || payload == undefined) {
                return res.status(401).json({ success: false, msgError: 'Failed: Admin Not Found!' })
            }
            // REMOVE USER SUCCESSFULLY 
            try {
                // CHECK ID IF EXIST 
                if (!id || id === undefined) {
                    return res.status(400).json({ status: 400, msg: 'Unexpected User ID!' })
                }

                // VALIDATE ID 
                await User.findByIdAndDelete(id, (err, payload) => {
                    //CHECK ERR IF EXIST
                    if (err) {
                        console.error(err);
                        return res.status(400).json({ status: 400, msg: 'Bad Request While Deleting User!' })
                    }

                    //CHECK IF PAYLOAD VALID
                    if (!payload || payload === null) {
                        console.log('User With Given ID Not Exist!')
                        return res.status(400).json({ status: 400, msg: 'User With Given ID Not Exist!' })
                    }
                    // FLY RESPONSE 
                    res.status(200).json({ status: 200, msg: 'User Has Been Removed Successfully' });
                })
            } catch (err) {
                res.status(500).json({ status: 500, msg: 'Internal Server Error' })
            }

        })

    })
}

// REMOVE URLs CONTROLL
exports.removeUrls = async (req, res, next) => {
    // CATCH URL ID 
    const { id } = req.body;
    const token = req.cookies['Token'];

    // CHECK IF THE TOKEN NULL
    if (!token || token === null || token === undefined) {
        return res.status(404).json({ success: false, msgError: 'Token Not Found / Expires' })
    }

    // TOKEN VALIDATION
    await ADMIN_TOKEN_AUTH(token, async (err, admin_payload) => {
        if (err) return res.status(400).json({ success: false, msgError: 'Token Not Provided!' });
        // DESTRUCTURE THE ADMIN PAYLOAD CREDS
        const { _id, username, isActive } = admin_payload;
        // VALIDATE THE ADMIN CREDS AGAINST DB - IF EXIST
        await Admins.findById(_id, async (err, payload) => {
            if (err) return res.status(400).json({ success: false, msgError: 'Something Went Wrong!' })
            if (!payload || payload == null || payload == undefined) {
                return res.status(401).json({ success: false, msgError: 'Access Denied STATUS_401!' })
            }

            // REMOVE URL BY ID
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
        })
    })
}

// BLOCK USER CONTROLL
exports.blockUser = async (req, res, next) => {
    // CATCH USER ID 
    const { id } = req.body;
    const token = req.cookies['Token'];

    // CHECK IF THE TOKEN NULL
    if (!token || token === null || token === undefined) {
        return res.status(404).json({ success: false, msgError: 'Token Not Found / Expires' })
    }

    // TOKEN VALIDATION ACCESS
    await ADMIN_TOKEN_AUTH(token, async (err, admin_payload) => {
        if (err) return res.status(400).json({ success: false, msgError: 'Token Not Provided!' })
        // DESTRUCTURE THE ADMIN PAYLOAD CREDS
        const { _id, username, isActive } = admin_payload;
        // VALIDATE THE ADMIN CREDS AGAINST DB - IF EXIST

        await Admins.findById(_id, async (err, payload) => {
            if (err) return res.status(400).json({ success: false, msgError: "Something Went Wrong!" })
            if (!payload || payload == null || payload == undefined) {
                return res.status(401).json({ success: false, msgError: 'Access Denied STATUS_401' });
            }

            // BLOCK USER 
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
        })
    })
}

// UNBLOCK USER CONTROLL
exports.unblockUser = async (req, res, next) => {
    // CATCH THE TOKEN 
    const token = req.cookies['Token'];
    const { id } = req.body;
    console.log(id);

    // CHECK IF THE TOKEN NULL
    if (!token || token === null || token === undefined) {
        return res.status(404).json({ success: false, msgError: 'Token Not Found / Expires' })
    }

    try {
        // VERIFY / DECRYPT THE TOKEN 
        jwt.verify(token, process.env.AUTH_SECRET, { algorithms: ['SHA256', 'HS256'] }, async (err, payload) => {
            // CHECK IF THE ERROR THROWN 
            if (err) {
                return next(createError(401, 'Token Incorrect / Expiress, Try again!'));
            }

            // CHECK IF THE PAYLOAD NULL OR UNDEFINED
            if (!payload || payload === null || payload === undefined) {
                next(createError(400, 'Error: Something Went Wrong!'));
            }

            // DESTRUCT THE PAYLOAD OBJECT
            const { isAdmin, isActive } = payload;
            console.log(payload);

            // VALID IF THE ADMIN HAS A ROLE OF ADMIN AND HAVE STATUS ACTIVE (ROLE)
            if (!isAdmin && !isActive) {
                // SEND 401 RESPONSE 
                return res.status(401).json({ responseCode: 1, responseDesc: 'UnAuthorized Access! Operation Failed!' });
            }

            // CHECK IF THE ID NOT VALID
            if (!isMongoID(id)) {
                return res.status(400).json({ responseCode: 1, responseDesc: 'Error: User ID Not Valid!' });
            }

            // UNBLOCK OPERATION START
            /*-- CHECK THE ID OF THE USER --*/
            await User.findById(id, async (err, user) => {
                if (err) {
                    return next(createError(400, 'Error: Something Went Wrong While Looking For User!'))
                }

                console.log(user);

                if (!user || user === null || user === undefined) {
                    return res.status(404).json({ responseCode: 1, responseDesc: 'User With Given ID Not Found!' });
                }

                /*-- CHECK IF THE USER ALREADY BLOCK OR NOT --*/
                if (!user.isBlocked) {
                    return res.status(200).json({ responseCode: 1, responseDesc: 'User Already Unblocked!' })
                } else {
                    // UNBLOCK IT (FALSE)
                    user.isBlocked = false;
                    await user.save((err, payload) => {
                        if (err) {
                            return next(createError(400, 'Error: Something Wet Wrong While Updating User!'));
                        }

                        // SEND THE 200 SUCCESS RESPONSE
                        res.status(200).json({ responseCode: 0, responseDesc: `User: ${id} Unblocked Successfully 100%` });
                    })
                }

            })
        })
    } catch (err) {
        next(err)
    }
}

// GET ALL URLs SOURCES
exports.urlsSources = async (req, res, next) => {
    // GET ADMIN TOKEN 
    const token = req.cookies['Token'];

    // CHECK IF THE TOKEN NOT EXIST
    if (!token || token === null || token === undefined) {
        return res.status(401).json({ confirmation: false, response: 'Unauthorized Access 401!' })
    }

    try {
        // Verify The Admin Token
        await jwt.verify(token, process.env.AUTH_SECRET, { algorithms: ['SHA256', 'HS256'] }, async (err, payload) => {
            if (err) {
                return next(createError(400, 'Incorrect Token / Token Expires!'))
            }

            // CHECK IF THE PAYLOAD NULL 
            if (!payload || payload === null || payload === undefined) {
                return res.status(400).json({ status: 400, response: 'ERROR: Failed To Verify Token!' })
            }

            // FETCH ALL URLs DATA
            await Url.find((err, payload) => {
                if (err) {
                    return next(createError(400, 'ERROR: Failed To Fetch URLs DB!'));
                }

                // CHECK IF THE PAYLOAD NULL 
                if (!payload || payload === null || payload === undefined) {
                    return res.status(400).json({ status: 404, response: 'No URLs Found!' })
                }

                // GET THE URLs SOURCES
                let urls_sources = [];
                (function () {
                    payload.map(url => {
                        console.log(url.sources)
                        for (let source of url.sources) {
                            urls_sources.push(source);
                        }
                    });

                    return urls_sources;
                })();
                // SEND THE RESPONSE 200 OK
                res.status(200).json({ sources: urls_sources, status: 200 });
            })
        })
    } catch (err) {
        next(err);
    }
}

// SEND MESSAGE TO THE SPECIFIC USER - FORM ADMIN DASHBOARD 
exports.sendMessage = async (req, res, next) => {
    // CATCH THE TOKEN FROM THE RESUEST OBJECT
    const token = req.cookies['Token'];
    const { userEmail, username, userMessage, emailType } = req.body;
    console.log(req.body);
    // CHECK IF THE TOKEN INCLUDED OR NOT 
    if (!token || token == -null || token === undefined) {
        return next(createError(400, 'TOKEN_NOT_EXIST'));
    }

    // REQUEST DATA FILTER FUNCTION HELPER 
    const isValid = (email, userNm, msg, emailTp) => {
        // INITIATE THE WARNINGS OBJ
        const warningsObj = {};
        if (email !== '' && validator.isEmail(email) && (userNm !== '' || userNm !== null) && (msg !== '' || msg !== null)) {
            const emailTypes = ['Account Risk', 'Data Leak', 'Access Controll'];
            // CHECK IF THE GIVEN EMAIL TYPE EXIST ON PROVIDED ARRAY
            if (emailTypes.includes(emailTp)) {
                warningsObj.emailType = 'Not Provided!';
            }

            const warnings = Object.keys(warningsObj).length > 0 ? warningsObj : null;
            return [true, warnings];
        } else {
            warningsObj.email = 'No Email!';
            warningsObj.username = 'No Username!';
            warningsObj.message = 'No Message!';

            return warningsObj;
        }
    };


    try {
        // VERIFY THE TOKEN 
        await jwt.verify(token, process.env.AUTH_SECRET, { algorithms: ['SHA256', 'HS256'] }, (err, payload) => {
            if (err) return next(createError(400, 'Token Incorrect/Expire'));

            const IS_ADMIN_TOKEN = () => {
                let is_admin;
                // CHECK IF THE TOKEN PAYLOAD IS FOR ADMING OR NOT (Loger)
                const token_keys = Object.keys(payload);
                console.log(token_keys)
                //CHECK IF THE -- isAdmin -- INCLUDED IN THE OBJECT
                if (token_keys.includes('isAdmin')) {
                    console.log('isAdmin Entry Found: ' + true);
                    if (payload.isAdmin) {
                        console.log('IS ADMIN: ' + payload.isAdmin);
                        is_admin = true;
                    } else {
                        is_admin = false;
                        // !WARNING!! LOG THE INFO TO THE LOGGER FILE
                    }
                } else {
                    is_admin = false;
                    //return false;
                }


                console.log('')
                return is_admin;
            };

            // CHECK THE RETURNED VALUE FROM THE ABOVE FUNCTION - IF THE TOKEN PAYLOAD FOR ADMIN
            const IS_ADMIN = IS_ADMIN_TOKEN();
            console.log('is Admin: ' + IS_ADMIN)
            if (IS_ADMIN) {
                // FINALLY: SEND THEMESSAGE TO THE SPECIFIC USER INBOX
                // MAIL OPTIONS
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: userEmail,
                    subject: `SnapLink: ${emailType} - [SnapLink Admin]`,
                    html: `
                        <h2>Hey, ${username}! You received this message directly from [SnapLink's Admin][${new Date().toLocaleDateString()}].</h2>
                        <span>++++++++++++ SUBJECT +++++++++++</span> <br />
                        *<strong>Alert Type</strong>: ${emailType}. <br />
                        *<strong>Message</strong>: ${userMessage}.<br />
                        <span>++++++++++++ SUBJECT +++++++++++</span>
                    `
                }
                mail(mailOptions, next);
                res.status(200).json({ status: 200, msg: 'Thank You! Message Sent To ' + username });
            } else {
                res.status(403).json({ status: 403, msg: 'Permission Denied! STATUS_403' })
            }
        });
    } catch (err) {
        next(err)
    }

}

// DOWNLOAD FILE ROUTE CONTROLL
exports.downloadFile = async (req, res, next) => {
    //console.log(req.url);
    //GET TOKEN FROM REQUEST OBJECT
    const Token = req.cookies['Token'];
    // CHECK IF THE TOKEN NOT EXIST 
    if (!Token || Token === null || Token === undefined) {
        return res.status(401).json({ status: 401, msg: 'UNAUTHORIZED ACCESS - ACCESS FOREBIDEN' });
    }
    // DB LOOKUP FUNCTION HELPER
    async function DB_USER_SEARCH(user_id, callback) {
        if (!user_id || user_id === null || user_id === '') {
            return callback(new Error('FAILED: USER ID: NOT PROVIDED!'), null);
        }
        // CHECK IF THE USER ID --> MATCHED WITH MONGODB ID
        if (!isMongoID(user_id)) {
            return callback(new Erro('THE GIVEN ID: NOT VALID'), null);
        }
        // CHECK IF THE GIVEN ID EXIST IN DB AS ADMIN
        await Admins.findById(user_id, (err, admin) => {
            //if (err) return next(createError(400, 'FAILED: CANNOT FIND ADMIN WITH GIVEN ID: ' + user_id));
            // RETURN THE ADMIN PAYLOAD OBJECT
            return callback(null, admin);
        })

    }
    // VERIFY THE TOKEN
    try {
        await jwt.verify(Token, process.env.AUTH_SECRET, { algorithms: ['SHA256', 'HS256'] }, async (err, payload) => {
            if (err) return next(err);
            // CHECK IF THE PAYLOAD EMPTY
            if (!payload || payload === null || payload === undefined) {
                console.error(err.message) // CONSOLE THE ERROR ON THE CONSOLE OUTPUT
                return next(createError(400, 'ERROR: SOMETHING WENT WRONG'));
            }
            // DESTRUCTOR THE PAYLOAD OBJECT
            const { _id, isAdmin, isActive } = payload;

            // CALL DB_USER_SEARCH FUNCTION HELPER
            await DB_USER_SEARCH(_id, (err, admin) => {
                if (err) return next(createError(400, err.message));
                //IF ADMIN , CHECK IF ADMIN STATUS: isAdmin == True
                const admin_status = (isAdmin === admin.isAdmin) && (isActive === admin.isActive) ? true : false;
                if (admin_status) {
                    // PREPARING TO STREAM THE FILE AS RESPONSE
                    // GET THE FILE PATH
                    const file = './services/util/logger/http_logger.txt';
                    // GET FILE BASE NAME
                    const fileName = path.basename(file);
                    // GET THE FILE MIME TYPE
                    const mimeType = mime.lookup(fileName);
                    // SET HEADER - CONTENT-DISPOSITOIIN
                    res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
                    // SET HEADER - CONTENT TYPE
                    res.setHeader('Content-Type', mimeType)
                    // GET FILE STREAM
                    const FILE_STREAM = fs.createReadStream(file);
                    // STREAM THE FILE --> PIP 
                    FILE_STREAM.pipe(res);
                    // CREATE A BACK-UP LOGGER FILE & REMOVE THE CURRENT ONE
                    // SEND AN ALIAS LOGGER FILE TO AN E-MAIL --> M.BRTOULI997@GMAIL.COM
                    (function () {
                        // SEND THE LOGGER CONTENT AS E-MAIL 
                        const MAIL_OPTIONS = {
                            from: process.env.EMAIL,
                            to: 'M.brtouli997@gmail.com',
                            attachments: [{
                                filename: fileName,
                                path: file
                            }],
                            subject: `SnapLink: You Requested The Logger File :: DATE: ${new Date().toLocaleDateString()}`,
                            html: `
                                    <h1>NEW LOGGER FILE - REQUESTED IN DATE: ${new Date().toLocaleDateString()}</h1> <br />
                                `
                        };
                        // FLY THE LOGGER 
                        mail(MAIL_OPTIONS);
                        // REMOVE THE CURRENT LOGGER FILE
                        fs.unlink(file, (err, file) => {
                            if (err) return next(err);
                            console.log('CURRENT LOGGER FILE HAS BEEN REMOVED');
                            const isFile = file ? 'FILE EXIST' : 'FILE NOT EXIST';
                            console.log('FILE: ' + isFile);
                            if (file) {
                                fs.writeFile('./services/util/logger/http_logger.txt', (err, file) => {
                                    if (err) return next(err);
                                    console.log('NEW LOGGER FILE CREATED');
                                })
                                return;
                            } else {
                                console.log('SOMETHING WENT WRONG WHILE CREATING NEW FILE');
                            }
                        })

                    })();
                } else {
                    console.log('NO ACCESS - FOREBIDEN 401');
                }
            })
        })
    } catch (err) {
        console.error(err.message);
        next(err);
    }
};

/*++++++++ ADS SYSTEM API ROUTES +++++++++*/
// GET ALL ADS API ENDPOINT
exports.allAds = async (req, res, next) => {
    // CHECK THE TOKEN (ADMIN ONLY )
    try {
        await ADMIN_TOKEN_AUTH(req.cookies['Token'], async (err, payload) => {
            if (err) return res.status(400).json({ status: 400, msgError: err.message });
            // DESTRUCTOR PAYLOAD OBJECT
            const { _id, username } = payload;
            //console.log(`USERNAME: ${username} - ID: ${_id}`);

            // ACCESS - GET ALL THE ADS BANNER --> DB 
            // FILTER ADS BASED ON THE BUDGET (PERIORITY)
            await Ads_Banners.find({ ad_status: true }, (err, payload) => {
                if (err) return res.status(400, 'ERROR: FAILED TO RETRIEV ALL ADS BANNERS');
                // CONOSLE THE PAYLOAD - TEST
                // FILTER ADS BASED ON THE BUDGET (PERIORITY)
                // SEND RESPONSE BACK 200 OK
                res.status(200).json({ confirmation: true, ads_banners: payload });
            })
        })
    } catch (err) {
        next(err)
    }
}

// GET ALL PENDING STATUS SUBSCRIPTIONS PLANS
exports.pendingPlans = async (req, res) => {
    // GET THE ADMIN TOKEN FROM REQ OBJECT
    //const admin_token = req.cookies['Token'];
    // CHECK IF THE TOKEN EXIST OR NOT
    await tokenValidator(req, res, 'Token', async (err, token_payload) => {
        if (err) return next(createError(400, 'ERROR: TOKEN NOT VALID / EXPIRES'));
        //console.log(token_payload);
        // DESTRUCTOR THE TOKEN PAYLOAD
        const { _id, username } = token_payload;
        // CHECK IF THE GIVEN ADMIN TOKEN  ALREADY EXIST IN DB
        await Admins.findById(_id, async (err, admin_payload) => {
            if (err) return next(createError(400, 'ERROR: OPERATION FAILED - UNAUTHORIZED ACCESS'));

            // FILTER ALL ADS WITH PENDING STATUS
            try {
                await Ads_Banners.find({ ad_status: false }).select('budget ad_status title url plan_type period ad_size e_mail owner banner').exec((err, pending_ads) => {
                    if (err) return res.status(400).json({ status: 400, errorMsg: 'ERROR: FAILED TO RETRIEVE SPECIFIC ORDER' });
                    res.status(200).json({ status: 200, pending_compaigns: pending_ads });
                })
            } catch (err) {
                next(err);
            }
        })
    })
}

// CREARTE NEW AD BANNER API ENDPOINT
exports.newAds = async (req, res, next) => {
    // GET ALL AD BANNER INFO --> REQUEST OBJECT
    const ad_banner_info = req.body;
    // SANITIZE THE REQUEST OBJECT
    /*--- ----*/
    // CHECK THE TOKEN (ADMIN ONLY )
    try {
        await ADMIN_TOKEN_AUTH(req.cookies['Token'], async (err, payload) => {
            if (err) return res.status(400).json({ status: 400, errorMsg: err.message });

            /*const ads_keys = Object.keys(ad_banner_info);
            const ads_banner_obj = {};
            ads_keys.map(key => {
                ads_banner_obj[key] = ad_banner_info[key];
                return ads_banner_obj;
            })*/
            console.log(req.body)
            const new_ad_banner = new Ads_Banners({
                title: ad_banner_info['ad-title'],
                period: ad_banner_info['ad-period'],
                e_mail: ad_banner_info['ad-email'],
                url: ad_banner_info['ad-url'],
                owner: ad_banner_info['ad-owner'],
                budget: Number(ad_banner_info['ad-budget']),
                /*banner: {
                    data: fs.readFileSync(
                        `ads_uploads/${req.file.filename}`
                    ),
                    contentType: "image/png"
                },*/
                banner: ad_banner_info['ad-banner'],
                ad_size: ad_banner_info['ad-size'],
            })

            /*ads_banner_obj.ad_banner = {
                data: fs.readFileSync('uploads/' + req.file.filename),
                ContentType: "image/png"
            }*/

            // CREATE NEW INSTANCE OF ADS MODEL
            //const new_ad_banner = new Ads_Banners(ads_banner_obj);
            // CREATE NEW AD BANNER AND STORE IT IN DB 
            await new_ad_banner.save((err, payload) => {
                if (err) { console.log(err); return next(createError(400, 'ERROR: FAILED TO SAVE ADS ID')) };
                // RESPONSE BACK - 200 OK
                // CONVERTING BANNER BUFFER TO BASE64  
                res.status(200).json({ status: 201, msg: `AD TITLE: ${payload.title} HAS BEEN ADDED SUCCESSFULLY 100%` });
            })
        })
    } catch (err) {
        next(err)
    }
}

// UPDATE AD WITH GIVEN ID API ENDPOINT
exports.patchAds = async (req, res, next) => {
    // CHECK THE TOKEN (ADMIN ONLY )

    // CHECK IF THE TOKEN EMPTY OR NOT

    // VERIFY THE TOKEN FOR ADMIN ONLY 

    // GET AD INFO

    // CHECK IF THE AD ID ALREADY EXIST OR NOT

    // PATCH AD BANNER BASED ON GIVEN AD INFO (NEW)

    // RESPONSE BACK - 200 OK
}

exports.destroyAds = async (req, res, next) => {
    // CHECK THE TOKEN (ADMIN ONLY )

    // CHECK IF THE TOKEN EMPTY OR NOT

    // VERIFY THE TOKEN FOR ADMIN ONLY 

    // GET AD INFO - ID ONLY 

    // VERIFY IF THE GIVEN AD ID ALREADY EXIST TO TAKE ACTION TO REMOVE IT

    // RESPONSE BACK - 200 OK
}