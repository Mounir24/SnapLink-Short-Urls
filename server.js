const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv/config");
const cors = require("cors");
const dbConnection = require('./configuration/connection');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet'); // Helmet Security Package
//const session = require('express-session');


// Import Files (Packages)
const userRoute = require('./routes/usersRoute');
const articlesRoute = require('./routes/articleRouter');
const adminRoute = require('./routes/adminRoute');
const httpLogger = require('./services/util/logger/logger')

// WHITELIST 
const whitelist = ['https://res.cloudinary.com', 'https://short-url-snaplink.herokuapp.com', 'https://cdnjs.cloudflare.com', 'https://cdn.deliver.net', 'https://restcountries.eu', 'https://unpkg.com', 'https://cdn.onlymega.com'];
// CORS Options 
const corsOptions = {
    origin: (origin, callback) => {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('ORIGIN NOT ALLOWED BY CORS'), null);
        }
    },
    //origin: "https://snaplink.herokuapp.com",
    optionsSuccessStatus: 200
}

app.use(helmet.hidePoweredBy());
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.xssFilter());
app.use(helmet.ieNoOpen());
app.use(helmet.hsts({ maxAge: 24 * 60 * 60 })); // FORCE HTTPS ONLY 
app.use(helmet.dnsPrefetchControl());
app.use(helmet.noSniff())
/*app.use(helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
        "default-src": ["*", "'unsafe-inline'"],
        "script-src": ["*", "'unsafe-inline'"],
        "object-src": ["*", "'unsafe-inline'"],
        "img-src": ["*", "data:", "blob:", "'unsafe-inline'"],
        upgradeInsecureRequests: []
    }
}));*/ // IMPLEMENT CONTENT SECURITY POLICY (CSP)
app.use(cors(corsOptions)); // EXECUTE THE CORS MODULE IN ALL ROUTES
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cookieParser());
app.use(httpLogger); // HTTP TRAFFIC LOGGER MODULE
//app.use(session({ secret: process.env.SESSION_KEY, resave: true, saveUninitialized: true, cookie: { maxAge: 2628e+6 } }))
app.set("view engine", "ejs");
app.use(express.static("public"));

// Middlewares 2
app.use('/', userRoute);
// COUNT VISISTS 
/*app.use((req, res, next) => {
    if (req.seesion.visits) {
        req.session.visits += 1;s
        req.session.visits += 1;
        conosle.log(req.session.visits);
        console.log('VISIT UPDATED BY 1 ');
    } else {
        req.session.visits = 1;
        conosle.log(req.session.visits);
        console.log('VISITS SESSION INIT');
    }
    next();
})*/
// ERROR HANDLER MIDDLEWARE
app.use((err, req, res, next) => {
    //console.log(err.message);
    //console.log(err);
    if (err instanceof URIError) {
        err.message = "Failed To Decode URI: " + req.params;
        /*console.log(err);
        console.log(decodeURIComponent(req.params));*/
        return res.redirect('/');
    }
    res.status(err.status || 500).json({
        status: err.status || 500,
        error: err.message,
        path: req.url
    });
})


app.use('/blogs', articlesRoute);
app.use('/admin', adminRoute);
app.all('*', (req, res) => {
    return res.status(200).render('404');
})

// START DB CONNECTION 
dbConnection();

// PORT 
const PORT = process.env.PORT || 3600;

const listener = app.listen(PORT, () => {
    console.log(` Server running on: ${listener.address().port}`);
});