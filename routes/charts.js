var apiVersionPrefix = "";
const controllers = require('../controllers');
const schema = require('../controllers/schemas/charts_schema');
module.exports = {
  'chartsDates': {
    type: "get",
    url: apiVersionPrefix + '/charts/dates',
    schema: schema.consultCharts,
    controller: controllers.charts.chartsDates
  }
}