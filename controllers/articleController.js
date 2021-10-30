const jwt = require('jsonwebtoken'); // JSON WEB TOKEN (JWT) AUTHENTICATION MODULE
const fs = require('fs');
const isMongoID = require('mongoose').Types.ObjectId.isValid; // METHOD TO CHECK FOR VALID MONGO  OBJECT
const createError = require('http-errors'); // HTTP ERRORS MODULE
const chalk = require('chalk');
// IMPORT HELPERS MODULES
const { isEmpty, isLength, isMax } = require('../services/util/validator'); // Validator Helper Module
const mail = require('../configuration/mail');

// IMPORT MODELS / SCHEMAS FIILES
const Subscribers = require('../model/subscriberSchema');
const Articles = require('../model/articleSchema'); // ARTICLES MODEL MODULE




// LIST ARTICLE CONTROLLER
// exports.getArticles = async (req, res, next) => {
//     // CATCH THE TOKEN 
//     const token = req.cookies['Token'];

//     // CHECK IF TOKEN EXITS OR OPPOSITE
//     if (!token) {
//         return next(createError(400, 'Token Not Found!'));
//         //return res.status(400).json({ status: 400, error: 'Token Not Found!' })
//     }

//     // VALIDATE THE TOKEN
//     jwt.verify(token, process.env.AUTH_SECRET, async (err) => {
//         //CHECK IF ERROR THROWN
//         if (err) {
//             next(cretaeError(401, 'Incorrect Token / Token Expires'))
//             //return res.status(401).json({ status: 401, error: 'Incorrect Token / Token Expires' })
//         }

//         // SEND A PAYLOAD AS A RESPONSE
//         try {
//             await Articles.find((err, payload) => {
//                 // Check if errors throws
//                 if (err) {
//                     return res.status(400).json({ status: 400, msg: 'Error Throws While Getting Articles' })
//                 }

//                 console.log('Payload Served To The Target!')
//                 res.status(200).render('blogs', { blogs: payload });

//             })
//         } catch (err) {
//             console.log(err.message)
//             next(err)
//             //res.status(500).json({ status: 500, error: 'INTERNAL_SERVER_ERROR' })
//         }
//     })
// }

// CREATE ARTICLE CONTROLLER
exports.createArticle = async(req, res, next) => {
    // CATCH ARTICLE VALUES 
    const { title, author, body, topic } = req.body;
    // CATCH THE  TOKEN 
    const token = req.cookies['Token'];

    // CHECK IF THE TOKEN EXIST OR OPPOSITE
    if (!token) {
        return next(createError(404, 'Token Not Found!'));
        //return res.status(400).json({ status: 400, error: 'Token Not Found!' })
    }

    // VALIDATE THE TOKEN 
    jwt.verify(token, process.env.AUTH_SECRET, async(err) => {
        //CHECK IF ERROR THROWN
        if (err) {
            return next(createError(400, 'Incorrect / Token Expires'))
                //return res.status(400).json({ status: 400, error: 'Incorrect Token / Token Expires' })
        }

        // CREATE NEW ARTICLE
        const newArticle = new Articles({
            title: title,
            author: author,
            body: body,
            topic: topic,
            poster_url: {
                data: fs.readFileSync(
                    'uploads/' + req.file.filename
                ),
                contentType: 'image/png'
            }
        })

        try {
            await newArticle.save((err, savedArticle) => {
                // CHECK IF ERRORS THROWN
                if (err) {
                    console.log(err)
                    return next(createError(400, 'Error: Faild To Create Blog Post!'));
                    //return res.status(400).json({ status: 400, error: 'Error Throws While Create New Article' })
                }
                console.log(`${process.env.BASE_URL}/blogs/blog?pid=${savedArticle._id}`)
                    // EMAIL ALL USERS / SUBSCRIBERS WITH UPDATED BLOGS
                Subscribers.find((err, emails) => {
                    // CHECK IF ERRORS EXIST 
                    if (err) {
                        return next(createError(400, 'Error: Cant find Subscribers E-mails!'));
                    }

                    // ITERATE THROUGH EACH E-MAIL
                    let subscribers = [];
                    emails.map(email => {
                        subscribers.push(email.email);
                    })

                    console.log(subscribers.email);
                    let blog_body;
                    (function(str, n) {
                        blog_body = str.length > n ? str.substr(0, n) + '***' : str;
                        return blog_body;
                    })(savedArticle.body, 50)

                    // CHECK IF THE SUBSCRIBERS ARRAY NULL OR UNDERFINED
                    if (!subscribers || subscribers === null || subscribers === undefined) {
                        return res.status(201).redirect('/blogs')
                    } else {
                        // MAIL OPTIONS
                        const mailOptions = {
                            from: process.env.EMAIL,
                            to: subscribers,
                            subject: `SnapLinK: ${savedArticle.title}`,
                            html: `
                        <h2>${savedArticle.title}</h2>
                        <p>${blog_body}</p>
                        <a href="${process.env.BASE_URL}/blogs/blog?pid=${savedArticle._id}">${process.env.BASE_URL}/blogs/blog?pid=${savedArticle._id}</>
                        `
                        }
                        mail(mailOptions);
                        res.status(201).redirect('/blogs');
                    }
                })
            })
        } catch (err) {
            next(err);
            res.status(500).json({ status: 500, error: 'INERNAL_SERVER_ERROR' });
        }
    })

    // VALIDATE ARTICLE INPUTS
    // (function () {
    //     const errors = {};
    //     // CHECK INPUTS IF EMPTY
    //     if (isEmpty(title) && isEmpty(author) && isEmpty(body)) {
    //         errors.articleInfo = { status: 400, error: 'Article Info Cannot Be Empty!' }
    //     }

    //     // CHECK TITLE LENGTH (MIN) 10 CHARATERS
    //     if (isLength(title, 10)) {
    //         errors.titleMin = { status: 400, error: 'Title Must be greater than 10 characters or equal!' }
    //     }

    //     //CHECK BODY LENGTH (MIN) 50 CHARACTERS
    //     if (isLength(body, 10)) {
    //         errors.bodyMin = { status: 400, error: 'Body Must be greater than 10 characters or equal!' }
    //     }

    //     // CHECL BODY LENGTH (MAX) 300 CHARACTERS
    //     if (isMax(body, 15)) {
    //         errors.bodyMax = { status: 400, error: 'Body Max Length is 15 Characters' }
    //     }

    //     if (Object.keys(errors).length > 0) {
    //         return res.status(400).json(errors);
    //     }

    // })()
}

// GET SINGLE ARTICLE CONTROLLER
exports.getSingleBlog = async(req, res, next) => {
    // CATCH THE BLOG ID PARAMS
    //const { pid } = req.params;
    const queryObj = req.query;
    console.log(queryObj)
        // CHECK ARTICLE ID IF EXIST
    if (!queryObj.pid) {
        console.error('Article ID Not Provided!')
        next(createError(400, 'Blog ID Not Provided'));
        return;
        //return res.status(400).json({ status: 400, error: 'Blog ID Not Provided!' });
    }

    // CHECK IF BLOG ID VALID 
    if (!isMongoID(queryObj.pid)) {
        console.log(`Blog ID:  ${queryObj.pid} Not Valid`)
            // return res.status(404).json({ status: 404, error: `Blog ID:  ${articleId} Not Valid` })
            //next(createError(404, 'Blog ID Not Valid!'));
        res.status(404).render('404');
        return;
    }

    // LOOK UP FOR A BLOG WITH ID 
    try {
        await Articles.findById(queryObj.pid, (err, payload) => {
            // CHECK IF ERROR EXIST
            if (err) {
                return next(createError(404, 'Blog Not Found! '))
                    //return res.status(400).json({ status: 400, error: 'Error: Something Went Wrong!!' })
            }

            if (!payload || payload === undefined || payload === null) {
                return res.status(404).redirect('/404');
            }

            /*if (req.session.views) {
                return res.status(200).render('blog_article', { blog: payload });
            } else {
                req.session.views = 1;
                payload.views += 1;
                payload.save();
                return res.status(200).render('blog_article', { blog: payload });
            }*/

            !payload || payload === null || payload === undefined ?
                res.status(404).redirect('/404') :
                payload.views++; // EVERY REQUEST TO THIS ARTICLE WILL BE INCREMENT BY +1
            payload.save(); // SAVE VIEWS ENTRY
            res.status(200).render('blog_article', { blog: payload });
        })
    } catch (err) {
        next(err)
            //res.status(500).json({ status: 500, error: 'INTERNAL_SERVER_ERROR' })
    }
}

// DELETE ARTICLE CONTROLLER
exports.removeBlog = async(req, res, next) => {
    // CATCH TOKEN FROM REQUEST OBJECT
    const token = req.cookies['Token'];
    // GET BLOG ID AS QUERY PARAMATER
    const pid = req.body.pid;

    // CHECK IF TOKEN NOT EXIST
    if (!token || token === null || token === undefined) {
        return next(createError(404, 'Token Not Found!'));
    }

    try {
        // VERIFY THE PROVIDED TOKEN
        jwt.verify(token, process.env.AUTH_SECRET, async(err, payload) => {
            // CHEC IF ERRORS EXIST
            if (err) {
                return next(createError(401), 'UnAuthenticated_401');
            }

            // QUERY: FIND BLOG BY ID AND REMOVE
            await Articles.findByIdAndDelete(pid, (err, payload) => {
                if (err) {
                    return next(createError(404, 'Blog ID does not exist!'));
                }

                // CHECK IF PAYLOAD NULL 
                if (!payload || payload === null || payload === undefined) {
                    return res.status(400).json({ status: 400, error: 'Payload Received Null / Undefined' });
                }

                // ON SUCCESS BLOG REMOVED RESPONSE WITH OK 200 + PAYLOAD
                res.status(200).json({ confirmation: true, message: `Blog ID: ${payload._id} Has Been Deleted.` })
            })

        })
    } catch (err) {
        next(err);
        console.log(err.message)
    }
}

// UPDATE ARTICLE CONTROLLER