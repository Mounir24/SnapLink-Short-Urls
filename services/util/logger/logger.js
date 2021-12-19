const morgan = require('morgan')
const mgn_json = require('morgan-json')
const fs = require('fs')
const path = require('path')
const axios = require('axios')

// FORMATTER
const FORMAT = mgn_json({
    method: ':method',
    url: ':url',
    status: ':status',
    contentLength: ':res[content-length]',
    responseTime: ':response-time'
})

// HTTP LOGGER
const HTTP_LOGGER = morgan(FORMAT, {
    stream: {
        write: (message) => {
            const {
                method,
                url,
                status,
                contentLength,
                responseTime,
            } = JSON.parse(message);

            // UPDATE VISITORS 
            // START UPDATING HTTP LOGGER FILE LOG 
            (async function () {
                // GET REQUEST IP
                const IP_REQUEST = await axios.get('https://api.ipify.org?format=json').
                    then(data => {
                        // HTTP TRAFFIC 
                        console.log('REQUEST IP: ' + data.data.ip)
                        const HTTP_TRAFFIC_INFO = `IP: {${data.data.ip}} . Method: {${method}} . URL: {${url}} . Status: {${Number(status)}} . Content-Length: {${contentLength}} . Response-Time: {${Number(responseTime)}} .Time-stamp: {${new Date().toLocaleString()}}\n`;
                        // OPEN FILE
                        fs.appendFile('./services/util/logger/http_logger.txt', HTTP_TRAFFIC_INFO, (err, file) => {
                            if (err) return console.error(err.message)
                            if (file) {
                                console.log('HTTP TRAFFIC LOGGER UPDATED 100%')
                                return;
                            }
                            // FILE APPENED SUCCSFULLY 100%
                        })
                    })
            })()
        }
    }
})

module.exports = HTTP_LOGGER;