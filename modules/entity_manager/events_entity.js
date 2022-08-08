var moment = require('moment');
const config = require('../config');
var _ = require('lodash');
var db = require('../db/index');
var mongo = new require('mongodb');
var log = require("../log");
var utils = require('./utils/index');

const COLLECTION_NAME = "Events";
const structure = {
    click: {
    },
    paramsForInstall: {

    },
    validatorsResult: {

    },
    events: {
        install: 0,

        /*'click_next':10
        'click_previous': 12,
        {
            20190908:{
                'click_next':9
                'click_previous': 10,
            }
        }*/
    }
};
const structureEvent = {
    click: {
    },
    paramsForEvents: {

    },
    validatorsResult: {

    },
    events: {
        install: 0,
    }
};

var saveInstall = async function (install) {
    if (install) {
        //trasforms passed click as defined at structure        
        install.CreationDate = new Date();

        return db.connection().collection(COLLECTION_NAME).insertOne(install);
    } else {
        throw Error('InstallCanNotBeUndefined');
    }
}

/**
 * Taken input from de controller and trasforms into DBSTructure to save
 * @param {*} params SourceIP:"18.231.122.0" | UserAgent:"PostmanRuntime/7.16.3" | etc... and more provided by framework
 * @param {*} context click and install
 * @param {*} validatorsResult 
 */
function createInstallStructFromInput(params, context, validatorsResult) {
    let installStructure = _.clone(structure);
    installStructure.click = _.get(context, 'click');
    installStructure.paramsForInstall = params;
    installStructure.validatorsResult = validatorsResult;
    installStructure.events = { install: 1 };
    //TODO: Fill data
    return installStructure;
}

/**
 * Taken input from de controller and trasforms into DBSTructure to save
 * @param {*} params 
 * @param {*} context 
 * @param {*} validatorsResult 
 */
function createEventsStructFromInput(params, context, validatorsResult) {
    let installStructure = _.clone(structureEvent);
    installStructure.click = _.get(context, 'click');
    installStructure.paramsForEvents = params;
    installStructure.validatorsResult = validatorsResult;
    installStructure.events = { event: 1 };
    //TODO: Fill data
    return installStructure;
}

var addOneEvents = async function (params, context, event2) {
    let simpleDateYMD = moment().format('YYYYMMDD');
    const id = _.get(context, "install._id",0);
    const TrackingProxy = _.get(context, "params.TrackingProxyEvent", false);
    const offer = _.get(context, "offer");
    // Obtengo nombre del evento
    const event = _.get(context, "params.event",'').toUpperCase();
    const existingEventInstall = _.get(context, `install.events[${event}].T`, 0);

    let TrackingCost = await utils.eventCost(event, TrackingProxy, offer, existingEventInstall);
    let Revenue = TrackingCost.Revenue; 
    let Cost = TrackingCost.Cost; 
    let Profit = TrackingCost.Profit;
    let CountTrackingProxy = TrackingCost.CountTrackingProxy

    let incs = JSON.parse(`{"$inc":{ 
        "events.T":1,
        "events.TotalRevenue":${Revenue},
        "events.TotalCost":${Cost},
        "events.TotalProfit":${Profit},
        "events.TrackingProxy":${CountTrackingProxy},
        "events.${event}.T":1,
        "events.${event}.TotalRevenue":${Revenue},
        "events.${event}.TotalCost":${Cost},
        "events.${event}.TotalProfit":${Profit},
        "events.${event}.TrackingProxy":${CountTrackingProxy},
        "events.${event}.${simpleDateYMD}.T":1,
        "events.${event}.${simpleDateYMD}.TotalRevenue":${Revenue},
        "events.${event}.${simpleDateYMD}.TotalCost":${Cost},
        "events.${event}.${simpleDateYMD}.TotalProfit":${Profit},
        "events.${event}.${simpleDateYMD}.TrackingProxy":${CountTrackingProxy},
        "events.${simpleDateYMD}.${event}.T":1
    }}`);

    /**
     * GUARDO EL EVENTO SOLO SI ES UN EVENTO QUE ES PAGABLE
     */
    if (TrackingCost.EventPayable) {
        log(`addOneInstall for install._id:  ${id}`);
        if (id!=0) {
            db.connection().collection(COLLECTION_NAME).updateOne(
                {
                    "_id": id,
                },
                incs,
                {
                    upsert: true
                }
            );
        }

        // Agrego el evento en el documento Events
        saveInstall(event2);
    } else {
        log(`EVENT NOT PAYABLE ===>>>addOneInstall for install._id:  ${id}`);
    }

}

var getInstallByClickId = async function (id) {
    return new Promise(function (resolve, reject) {
        try {
            let mongoID = mongo.ObjectID(id);
            log("Obteniendo install a travez de hack:", id);
            resolve(db.connection().collection(COLLECTION_NAME).findOne({ 'click._id': mongoID, "events.install": 1 }));
        } catch (e) {
            log("Obteniendo install a travez de hack:", id);
            resolve(db.connection().collection(COLLECTION_NAME).findOne({ 'click.CampaignClickGUID': id, "events.install": 1 }));
        }
    });
}

module.exports = {
    saveInstall: saveInstall,
    addOneEvents: addOneEvents,
    createInstallStructFromInput: createInstallStructFromInput,
    createEventsStructFromInput: createEventsStructFromInput,
    getInstallByClickId: getInstallByClickId,
}





