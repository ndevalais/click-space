const c = require('../constants');

let CacheHelper = require("./CacheHelper");
let ch = new CacheHelper();
let db = require("../db");
let oe = require("./offer_entity");
var clickEntity = require("./click_entity");
var installsEntity = require("./events_entity");
var rotadorEntity = require("./rotador_entity");
let config = require('../../modules/config');
let eventsWatchers = require('./events_watchers');
let eventsBus = require('../events_bus');
var blacklistEntity = require('./blacklist_entity');
var appsnames = require('./appsnames_entity');
var hash = require('object-hash');

const CACHE_TTL = config.CACHE_TTL;
const CACHE_TTK_ELEMENT_NO_ACTIVITY = config.CACHE_TTK_ELEMENT_NO_ACTIVITY;

//Starts the cached entity manager
//TODO: Call updateStatus per event?
const updateStatus = function () {

}

//Gets an offer. This method is cached.
async function getOfferByUUID(uuid, SubPubID, IPLong, event) {
    //Gets the function that call the mongo DB
    var f = async function () {
        var elem = await oe.getByUUID(uuid, SubPubID, IPLong, event);
        return elem;
    }
    //Tell cache helper to manage this object
    if (event!=c.P_NAMES.click.name) {
        return await oe.getByUUID(uuid, SubPubID, IPLong, event);
    } else {
        return await ch.getObject(uuid, CACHE_TTL, f, CACHE_TTK_ELEMENT_NO_ACTIVITY);
    }
}

async function getRotator(SupplierID, DeviceID) {
    let uuid = hash({ SupplierID: SupplierID, DeviceID: DeviceID });
    //Gets the function that call the mongo DB
    var f = async function () {
        var elem = await oe.getRotator(SupplierID, DeviceID);
        return elem;
    }
    //Tell cache helper to manage this object
    return await ch.getObject(uuid, 3600, f, 60);
}

//
async function getClickByUUID(uuid) {
    //Gets the function that call the mongo DB
    var f = async function () {
        var elem = await oe.getByUUID(uuid);
        return elem;
    }
    //Tell cache helper to manage this object
    return await ch.getObject(uuid, CACHE_TTL, f, CACHE_TTK_ELEMENT_NO_ACTIVITY);
}

//
async function getClickByID(uuid) {
    //Gets the function that call the mongo DB
    var elem = await clickEntity.getClickByID(uuid);
    return elem;
}

async function getInstallByClickId(uuid) {
    //Gets the function that call the mongo DB
    var elem = await installsEntity.getInstallByClickId(uuid);
    return elem;
}

async function getClickByID(uuid) {
    //Gets the function that call the mongo DB
    var elem = await clickEntity.getClickByID(uuid);
    return elem;
}

//Loops through all the events watchers and registers their functions to
//be called on their eventsName. Should be called one, on initilizing server.
async function wireEventsWatchers() {
    let eventWatchersLog = [];
    eventsWatchers.forEach(function (eventWatcher) {
        eventWatchersLog.push(` -Registering [${eventWatcher.name}] event watcher`);
        eventsBus.callOnEvent(eventWatcher.name, eventWatcher.function);
    });
    console.table(eventWatchersLog);
}

async function getBlacklist(ListType, AdvertiserID, CampaignID, OfferID) {
    let uuid = hash({ ListType: ListType, AdvertiserID: AdvertiserID, CampaignID: CampaignID, OfferID: OfferID });
    var f = async function () {
        var elem = await blacklistEntity.getBlacklist(ListType, AdvertiserID, CampaignID, OfferID)
        return elem;
    }
    //Tell cache helper to manage this object
    return await ch.getObject(uuid, CACHE_TTL, f, CACHE_TTK_ELEMENT_NO_ACTIVITY);
}

async function getWhitelist(ListType, AdvertiserID, CampaignID, OfferID) {
    let uuid = hash({ ListType: ListType, AdvertiserID: AdvertiserID, CampaignID: CampaignID, OfferID: OfferID });
    var f = async function () {
        var elem = await blacklistEntity.getWhitelist(ListType, AdvertiserID, CampaignID, OfferID)
        return elem;
    }
    //Tell cache helper to manage this object
    return await ch.getObject(uuid, CACHE_TTL, f, CACHE_TTK_ELEMENT_NO_ACTIVITY);
}

async function getBlacklistP2( OfferID, P2) {
    let uuid = hash({ ListType: "P2", OfferID, P2 });

    var f = async () => {
        var elem = await blacklistEntity.getBlacklistP2(OfferID, P2)
        return elem;
    }
    
    //Tell cache helper to manage this object
    return await ch.getObject(uuid, CACHE_TTL, f, CACHE_TTK_ELEMENT_NO_ACTIVITY);
}

async function getBlacklistSubPub(ListType, AdvertiserID, CampaignID, OfferID, SubPubID, ControlIP) {
    let uuid = hash({ ListType: ListType, AdvertiserID: AdvertiserID, CampaignID: CampaignID, OfferID: OfferID, SubPubID: SubPubID });

    var f = async () => await blacklistEntity.getBlacklistSubPub(ListType, AdvertiserID, CampaignID, OfferID, SubPubID, ControlIP)

    //Tell cache helper to manage this object
    return await ch.getObject(uuid, CACHE_TTL, f, CACHE_TTK_ELEMENT_NO_ACTIVITY);
}
async function getBlacklistSubPubSupplier(ListType, SupplierID, SubPubID) {
    let uuid = hash({ ListType: ListType, SupplierID: SupplierID, SubPubID: SubPubID });

    var f = async () => await blacklistEntity.getBlacklistSubPubSupplier(ListType, SupplierID, SubPubID)

    //Tell cache helper to manage this object
    return await ch.getObject(uuid, CACHE_TTL, f, CACHE_TTK_ELEMENT_NO_ACTIVITY);
}

async function getAppsNamesCountry(CountryCode, DeviceID, BlackList) {
    let uuid = hash({ CountryCode, DeviceID });
    //Gets the function that call the mongo DB
    var f = async function () {
        var elem = await appsnames.getAppsNamesCountry(CountryCode, DeviceID, BlackList);
        return elem;
    }
    //Tell cache helper to manage this object
    return await ch.getObject(uuid, 60, f, CACHE_TTK_ELEMENT_NO_ACTIVITY);
}

async function getRandomAppsName() {
    return true;
}

module.exports = {
    updateStatus: updateStatus,
    getOfferByUUID: getOfferByUUID,
    clickEntity: clickEntity,
    rotadorEntity: rotadorEntity,
    wireEventsWatchers: wireEventsWatchers,
    emitEvent: eventsBus.emitEvent,
    getClickByUUID: getClickByUUID,
    getClickByID: getClickByID,
    oe: oe,
    getInstallByClickId: getInstallByClickId,
    installsEntity: installsEntity,
    getBlacklist: getBlacklist,
    getWhitelist: getWhitelist,
    getBlacklistSubPub: getBlacklistSubPub,
    getBlacklistSubPubSupplier: getBlacklistSubPubSupplier,
    getRandomAppsName: getRandomAppsName,
    getRotator: getRotator,
    getAppsNamesCountry: getAppsNamesCountry,
    getBlacklistP2
}