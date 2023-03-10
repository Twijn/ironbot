// Load application config file 
const config = require("./config.json");

// SQL connection setup
const mysql      = require('mysql');
const connection = mysql.createConnection({
    host     : config.mysql.host,
    user     : config.mysql.user,
    password : config.mysql.password,
    database : config.mysql.database,
    charset: 'utf8mb4',
});

// Open a SQL connection
connection.connect();

// Perform a SQL query that returns a promise 
connection.pquery = (query, vars) => {
    return new Promise((res, rej) => {
        connection.query(query, vars, (err, result) => {
            if (err) {rej(err);return;}
            res(result);
        });
    });
}

/**
 * Generates a random string of (length) length.
 * @param {number} length 
 * @returns {string} Generated String
 */
connection.stringGenerator = (length = 32) => {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;
}

module.exports = connection;
