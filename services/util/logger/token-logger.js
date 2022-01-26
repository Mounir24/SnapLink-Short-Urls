const fs = require('fs')
const axios = require('axios')

// TOKEN LOGGER UTILITY 
const TOKEN_LOGGER = async (url_path, token, username, callback) => {
    const LOGGER_FILE_PATH = './services/util/logger/token_logger.txt';
    // GET --> IP - TOKEN - URL PATH 
    try {
        await axios.get('https://api.ipify.org?format=json').then(
            data => {
                const SRC_IP = data.data.ip;
                // PERFIX TOKEN INFO
                const TOKEN_INFO = `USERNAME: ${username}- TOKEN: ${token} - IP: ${SRC_IP} - PATH: ${url_path} - Time: ${new Date().toLocaleString()}\n`;
                // CREATE FILE IF NOT EXIST , OTHERWISE APPEND NEW CONTENT
                fs.appendFile(LOGGER_FILE_PATH, TOKEN_INFO, (err, file) => {
                    if (err) {
                        return callback(new Error('ERROR: TOKEN NOT ASSIGNED !!'), null);
                    }

                    if (file) {
                        callback(null, true)
                        return;
                    }
                })
            }
        );
    } catch (err) {
        console.log(err.message);
        callback(err.message, null);
        //next(err.message)
    }

}

module.exports.TOKEN_LOGGER = TOKEN_LOGGER;
