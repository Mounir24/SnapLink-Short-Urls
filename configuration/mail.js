const nodemailer = require('nodemailer');

// MAIL FUNCTION
const mailService = (options) => {
    // CREATE NEW TRANSPORT 
    const transporter = nodemailer.createTransport({
        service: 'fastMail',
        port: 465, // By default: port 465
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS
        }
    });

    // MAIL OPTIONS
    /*const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: `SnapLink: ${username}, Your Activation Link`,
        html: `
            <h1>Activation Link for SnapLink</h1> 
            <a href="${process.env.BASE_URL}/activate/${token}" >Activate Your Account</a>
        `
    }*/

    // SEND MAIL
    transporter.sendMail(options, (err, respones) => {
        if (err) {
            console.log(err.message);
            return;
        } else {
            console.log('e-mail sent to: ' + respones);
        }
    })


};



module.exports = mailService;