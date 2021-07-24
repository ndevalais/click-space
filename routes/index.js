const glob = require("glob");
const _ = require('lodash');
const joi = require('joi');
const schemas = require('../controllers/schemas');
const httpProccessor = require('../modules/http/processor');

// Intercepts the routes with our validators
console.log("Antes del export");
module.exports.bindRoutes = app => {
  const files = glob.sync(__dirname + "/**/*.js", { ignore: __dirname +"/**/index.js" })
  files.forEach((routeFile) => {
    routeFile = require(routeFile);
    Object.keys(routeFile).forEach(key => {
      let route = routeFile[key];
      //Validates that routes are correctly specified (schemas.common.route is the validator)
      if (schemas.common.route(route)) {
        console.log("Procesando:", route.url);
        app[route.type](route.url, (req, res, next) => httpProccessor.httpProccessServiceApi(req, res, next, route))
      } else {
        //TODO: SEND TO ERROR HANDLER
        console.log("Ruta mal definida:", err, route);
      }
    });
  });
}