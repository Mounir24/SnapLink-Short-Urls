const mongoose = require('mongoose');
const chalk = require('chalk');

// START CONNECTION FUNCTION
const dbConnection = () => {
    try {
        mongoose.connect(
            process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
            (err) => {
                if (err) {
                    console.log(chalk.red.inverse('DB Failed To Connect!'));
                } else {
                    console.log(chalk.green.inverse('DB Connected Successfully 100%'));
                }
            }
        );
    } catch (err) {
        console.log(err);
        process.exit(1)
    }
}

module.exports = dbConnection;