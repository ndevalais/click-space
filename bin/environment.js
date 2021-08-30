const cTable = require('console.table');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');

var _ = require('lodash');
var expressValidator = require('express-validator');
var moment = require('moment');
var helmet = require('helmet');
var rateLimit = require('express-rate-limit');
var config = require('../modules/config');
const mongoDB = require('../modules/db');
let entityManager = require('../modules/entity_manager');
let appRoutes = require('../routes/index');
module.exports = async function (app) {
    return new Promise(async function(resolve, reject){
        try{            
            await mongoDB.connect();            
            entityManager.wireEventsWatchers();
            //Evita que el cliente cachee            
            app.use(function (req, res, next) {
                res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
                res.header('Expires', '-1');
                res.header('Pragma', 'no-cache');
                next();
            });            
            //Limite de upload para cualquier tipo
            app.use(bodyParser({
                limit: config.MAX_UPLOAD_SIZE,
                error: { expose: false },
            }));
    
    
            //app.set('views', path.join(__dirname, '../app/views'));
            /*if (config.env === 'development')
            app.use(logger('dev'));
            else
            app.use(logger());
            */
            app.use(expressValidator());            
            await appRoutes.bindRoutes(app);
            app.set('view engine', 'ejs');            
            moment.locale('es');
    
            process.on('unhandledRejection', (reason, p) => {
                console.log("unhandledRejection:", reason);
            });
            process.on('uncaughtException', function (err) {
                console.log("unhandledRejection:", err);
            });
    
            app.use(function (err, req, res, next) {
                console.log("unhandledRoute:", err);
            });
            resolve();
        }catch(e){
            console.log("Error connecting to mongo:",e);
            reject(e);
        }
    });	
};
