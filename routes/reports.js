var apiVersionPrefix = "";
const controllers = require('../controllers');
const schema = require('../controllers/schemas/reports_schema');
module.exports = {
    'reportsClick': {
        type: "get",
        url: apiVersionPrefix + '/reports',
        schema: schema.registerClick,
        controller: controllers.reports.reportsClick
    },
    'reportsDashBoard': {
        type: "get",
        url: apiVersionPrefix + '/dashboard',
        schema: schema.registerClick,
        controller: controllers.reports.reportsDashBoard
    },
    'reportsBLSource': {
        type: "get",
        url: apiVersionPrefix + '/blsource',
        schema: schema.registerClick,
        controller: controllers.reports.reportsBLSource
    },
    'reportsBLSourceTotals': {
        type: "get",
        url: apiVersionPrefix + '/blsourcetotals',
        schema: schema.registerClick,
        controller: controllers.reports.reportsBLSourceTotals
    },
    'reportsClickSubPub': {
        type: "get",
        url: apiVersionPrefix + '/reports_subpub',
        schema: schema.registerClick,
        controller: controllers.reports.reportsClickSubPub
    },
    'reportsTracking': {
        type: "get",
        url: apiVersionPrefix + '/reports_tracking',
        schema: schema.registerClick,
        controller: controllers.reports.reportsTracking
    },
    'trackingDetails': {
        type: "get",
        url: apiVersionPrefix + '/reports_tracking_details',
        schema: schema.registerClick,
        controller: controllers.reports.trackingDetails
    },
    'reportsDateDetails': {
        type: "get",
        url: apiVersionPrefix + '/reports_date_details',
        schema: schema.registerClick,
        controller: controllers.reports.reportsDateDetails
    },
    'reportsDateDetailsSubPub': {
        type: "get",
        url: apiVersionPrefix + '/reports_date_details_subpub',
        schema: schema.registerClick,
        controller: controllers.reports.reportsDateDetailsSubPub
    },
    'reportsEventsSubPub': {
        type: "get",
        url: apiVersionPrefix + '/reports_events_subpub',
        schema: schema.registerClick,
        controller: controllers.reports.reportsEventSubPub
    },
    'reportsCampaignTotal': {
        type: "get",
        url: apiVersionPrefix + '/reports/campaign_total',
        schema: schema.registerClick,
        controller: controllers.reports.reportsCampaignTotal
    }
}