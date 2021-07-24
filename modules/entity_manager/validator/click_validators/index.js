const glob = require("glob");
const path = require("path");
const schemas = require("../../../../controllers/schemas");
const _ = require('lodash');
var validators = [];
var loaded = false;
let config = require("../../../../modules/config");

module.exports = async function () {
    return new Promise(function (resolve, reject) {

        if (loaded) {
            resolve(validators);
        } else {
            glob(__dirname+ "/*.js", { ignore: "index.js" }, function (err, files) {
                for (var i = 0; i < files.length; i++) {
                    var validator = require(files[i]);
                    //Validates that validation is correctly specified 
                    const isValid = schemas.common.validator(validator)
                    if (isValid) {
                        validators.push(validator);
                    } else {
                        //TODO: SEND TO ERROR HANDLER
                        console.log("Validator mal definido:", err, route);
                        reject();
                    }
                }
                loaded = true;
                resolve(validators);
            });
        }

    });
}



