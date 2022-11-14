const config = require('../config');
const COLLECTION_NAME = "Blacklist";
var moment = require('moment');
var log = require("../log");
var _ = require('lodash');
var db = require("../db");
var mongo = new require('mongodb');
var utils = require('./utils');
const entityTotals = require("./campaign_clicks_total");

const structure = {
    "id": undefined,
    "ListType": undefined,
    "SubPubID": undefined,
    "AdvertiserID": undefined,
    "CampaignID": undefined,
    "OfferID": undefined,
    "CreationDate": undefined,
    "Status": undefined,
    "Totals": {
        "20191013": {
            "T": undefined,
            "CTIT": undefined,
            "High_CR": undefined,
            "Low_CR": undefined,
            "Low_Event_KPI": undefined,
            "MMP_Rejected": undefined,
        },
        "T": undefined,
        "CTIT": undefined,
        "High_CR": undefined,
        "Low_CR": undefined,
        "Low_Event_KPI": undefined,
        "MMP_Rejected": undefined,
    }
};

function createNewBlackListStructFromInput(data) {
    let blacklistStructure = _.clone(structure);
    blacklistStructure.id = _.get(data, 'id', null);
    blacklistStructure.ListType = _.get(data, 'ListType');
    blacklistStructure.SubPubID = _.get(data, 'SubPubID');
    blacklistStructure.AdvertiserID = _.get(data, 'AdvertiserID', null);
    blacklistStructure.CampaignID = _.get(data, 'CampaignID', null);
    blacklistStructure.SupplierID = _.get(data, 'SupplierID', null);
    blacklistStructure.OfferID = _.get(data, 'OfferID', null);
    //blacklistStructure.DateFrom = _.get(params, 'DateFrom');
    //blacklistStructure.DateTo = _.get(params, 'DateTo');
    //blacklistStructure.ControlIP = _.get(params, 'ControlIP');
    blacklistStructure.Status = _.get(params, 'Status', true);
    //blacklistStructure.StatusID = _.get(params, 'StatusID');
    //blacklistStructure.Create.AccountManager = _.get(params, 'Create.AccountManager');
    //blacklistStructure.Create.CreationDate = _.get(params, 'Create.CreationDate');
    //blacklistStructure.Update.AccountManager = _.get(params, 'Update.AccountManager');
    //blacklistStructure.Update.UpdateDate = _.get(params, 'Update.UpdateDate');
    //Ads validators result to document
    clickStructure.ValidatorsResult = validatorsResult;
    //TODO: Fill data
    return clickStructure;
}

var saveBlackList = async function (ListType, SubPubID, AdvertiserID, CampaignID, OfferID, SupplierID, Status) {
    try {
        const CreationDate = new Date();
        var find = {
            "ListType": ListType,
            "SubPubID": SubPubID
        };

        if (OfferID != null) {
            find.OfferID = OfferID;
        } else if (CampaignID != null) {
            find.CampaignID = CampaignID;
        } else if (AdvertiserID != null) {
            find.AdvertiserID = AdvertiserID;
        } else if (SupplierID!=null) {
            find.SupplierID = SupplierID;
        }

        if (find != '') {
            return db.connection().collection(COLLECTION_NAME).updateOne(
                find,
                {
                    $set: {
                        Status: Status,
                        CreationDate: CreationDate
                    }
                },
                {
                    upsert: true,
                    maxTimeMS: 150
                }
            );
        } else {
            throw Error('Blacklist CanNotBeUndefined');
        }
    } catch (error) {
        log(`Blacklist: ${error}`);
        throw Error('Blacklist CanNotBeUndefined');
    }
}

var delBlackList = async function (ListType, SubPubID, AdvertiserID, CampaignID, OfferID, SupplierID) {
    try {
        var find = {
            "ListType": ListType,
            "SubPubID": SubPubID
        };

        if (OfferID != null) {
            find.OfferID = OfferID;
        } else if (CampaignID != null) {
            find.CampaignID = CampaignID;
        } else if (AdvertiserID != null) {
            find.AdvertiserID = AdvertiserID;
        } else if (SupplierID != null) {
            find.SupplierID = SupplierID;
        }

        if (find != '') {
            return db.connection().collection(COLLECTION_NAME).deleteMany(
                find
            );
        } else {
            throw Error('Blacklist CanNotBeDeleted');
        }
    } catch (error) {
        log(`Blacklist Delete: ${error}`);
        throw Error('Blacklist CanNotBeDeleted');
    }
}

var delBlackListID = async function (ID) {
    try {
        /*let ObjectIDs = [];
        for (var i = 0; i < ID.length; i++) {
            ObjectIDs.push( mongo.ObjectID(ID[0]) );
        }*/
        let ObjectIDs = mongo.ObjectID(ID);
        //{ "_id": { "$in" : ObjectIDs } }
        return db.connection().collection(COLLECTION_NAME).deleteMany(
            { "_id": ObjectIDs  }
        ).then(result => {
            log("Records Deleted");
            //log(JSON.stringify(result));
            //for number removed...
            log("Removed: " + result.deletedCount);
            return result;
        })
        .catch(err => {
            log("Error");
            log(err);
            return err;
        });
        //{$in: IDs }
    } catch (error) {
        log(`Blacklist Delete: ${error}`);
        return error;
        //throw Error('Blacklist CanNotBeDeleted');
    }
}

var pauseBlackListID = async function (ID, Status) {
    try {
        const CreationDate = new Date();
        const ObjectIDs = mongo.ObjectID(ID);

        return db.connection().collection(COLLECTION_NAME).updateOne(
            { "_id": ObjectIDs  },
            {
                $set: {
                    Status: Status,
                    CreationDate: CreationDate
                }
            },
            {
                upsert: true,
                maxTimeMS: 150
            }
        );
        //{$in: IDs }
    } catch (error) {
        log(`Blacklist Delete: ${error}`);
        return error;
        //throw Error('Blacklist CanNotBeDeleted');
    }
}

var addBlackListTotal = async function (blacklist) {
    const simpleDateYMD = moment().format('YYYYMMDD');
    const SubPubID = _.get(blacklist, "SubPubID");
    const OfferID = _.get(blacklist, "OfferID");
    const ListType = _.get(blacklist, "ListType");
    const blackListReason = _.get(blacklist, "blackListReason", "");
    const Status = _.get(blacklist, "Status", true);
    const CreationDate = new Date();
    let incs;

    try {
        // "Status": Status
        let sets = { }
        if (blackListReason != '') {
            sets.Reason = blackListReason;
        }
        sets.CreationDate = new Date();

        incs = JSON.parse(`{ 
            "Totals.T":1,
            "Totals.${simpleDateYMD}.T":1
        }`);

        let ret = await db.connection().collection(COLLECTION_NAME).updateOne(
            {
                "ListType": ListType, "OfferID": OfferID, "SubPubID": SubPubID
            },
            {
                $inc: incs,
                $set: sets,
                $setOnInsert: { Status: Status } 
            },
            {
                upsert: true,
                maxTimeMS: 50
            }
        );
        
        if (  _.get(ret,"result.nModified",1) == 0) {;
            // ENVIO CORREO DE ERROR
            let Offer = _.get(blacklist,"offer.Offer",'');
            utils.sendMailBlackList({
                To: 'laikad2021@gmail.com;delfina@laikad.com;sofia@laikad.com', 
                Subject: `BlackList Θ SubPub ${SubPubID}`,
                Body: `Offer: ${Offer} \nReason: ${blackListReason}\nDate: ${ (new Date()).toString() }`
            })
        }
        
        // Agrego BL Source a CampaignTotalGroup si la Reason esta completa
        entityTotals.addOneTotalGroupBlackList(blacklist, blacklist.offer);

    } catch (error) {
        log(`Blacklist: ${error}`);
    }
}

//TODO: Mejorar la perf de este punto.
//https://gyazo.com/e4d2a8f9f4798e0dc9f22d1969560757
var getBlacklist = async function (ListType, AdvertiserID, CampaignID, OfferID) {
    let count = await db.connection().collection(COLLECTION_NAME).find(
        { "ListType": ListType, "Status": true, "OfferID": OfferID }).count();
    if (count == 0) {
        count = await db.connection().collection(COLLECTION_NAME).find(
            { "ListType": ListType, "Status": true, "CampaignID": CampaignID }).count();
        if (count == 0) {
            count = await db.connection().collection(COLLECTION_NAME).find(
                { "ListType": ListType, "Status": true, "AdvertiserID": AdvertiserID }).count();
        }
    }
    return count;
    /**
    let count = db.connection().collection(COLLECTION_NAME).find(
        {
            "ListType": ListType, "Status": true, "SubPubID": SubPubID,
            "$or": [
                { "AdvertiserID": AdvertiserID },
                { "CampaignID": CampaignID },
                { "OfferID": OfferID }]
        }
    ).count();  
     */
}

var getWhitelist = async function (ListType, AdvertiserID, CampaignID, OfferID, SubPubID) {
    let count = await db.connection().collection(COLLECTION_NAME).find(
        { "ListType": ListType, "Status": true, "OfferID": OfferID }).count();
    if (count == 0) {
        count = await db.connection().collection(COLLECTION_NAME).find(
            { "ListType": ListType, "Status": true, "CampaignID": CampaignID }).count();
        if (count == 0) {
            count = await db.connection().collection(COLLECTION_NAME).find(
                { "ListType": ListType, "Status": true, "AdvertiserID": AdvertiserID }).count();
        }
    }
    return count;
    /*return db.connection().collection(COLLECTION_NAME).find(
        {
            "ListType": ListType, "StatusID": "A", "$or": [
                { "AdvertiserID": AdvertiserID },
                { "CampaignID": CampaignID },
                { "OfferID": OfferID }]
        }
    ).count();*/
}

var getBlacklistSubPub = async function (ListType, AdvertiserID, CampaignID, OfferID, SubPubID) {
    let obj = await db.connection().collection(COLLECTION_NAME).findOne(
        { "ListType": ListType, "Status": true, "OfferID": OfferID, "SubPubID": SubPubID });
    if (!obj) {
        obj = await db.connection().collection(COLLECTION_NAME).findOne(
            { "ListType": ListType, "Status": true, "CampaignID": CampaignID, "SubPubID": SubPubID });
        if (!obj) {
            obj = await db.connection().collection(COLLECTION_NAME).findOne(
                { "ListType": ListType, "Status": true, "AdvertiserID": AdvertiserID, "SubPubID": SubPubID });
        }
    }
    return !!obj;
    /*
    let count = await db.connection().collection(COLLECTION_NAME).find(
        { "ListType": ListType, "Status": true, "OfferID": OfferID, "SubPubID": SubPubID }).count();
    if (count == 0) {
        count = await db.connection().collection(COLLECTION_NAME).find(
            { "ListType": ListType, "Status": true, "CampaignID": CampaignID, "SubPubID": SubPubID }).count();
        if (count == 0) {
            count = await db.connection().collection(COLLECTION_NAME).find(
                { "ListType": ListType, "Status": true, "AdvertiserID": AdvertiserID, "SubPubID": SubPubID }).count();
    return count;
    */
    /*return db.connection().collection(COLLECTION_NAME).find(
        {
            "ListType": ListType, "StatusID": "A", "$or": [
                { "AdvertiserID": AdvertiserID, "SubPubID": SubPubID },
                { "CampaignID": CampaignID, "SubPubID": SubPubID },
                { "OfferID": OfferID, "SubPubID": SubPubID }]
        }
    ).count();*/
    /*
        { "AdvertiserID": AdvertiserID, "SubPubID": ControlIP },
        { "CampaignID": CampaignID, "SubPubID": ControlIP },
        { "OfferID": OfferID, "SubPubID": ControlIP }
    */
}

var getBlacklistSubPubSupplier = async function (ListType, SupplierID, SubPubID) {
    let obj = await db.connection().collection(COLLECTION_NAME).findOne(
        { "ListType": ListType, "Status": true, "SupplierID": SupplierID, "SubPubID": SubPubID });
    return !!obj;
}

var getBlacklistP2 = function (OfferID, P2) {
    return db.connection().collection(COLLECTION_NAME).find(
        { 
            ListType:'P2', 
            "Status": true, 
            OfferID: OfferID, 
            SubPubID: P2
        }
    ).count();
}

var getBlackListOffer = async function (ListType, OfferID) {
    try {
        return new Promise(function (resolve, reject) {
            try {
                db.connection().collection(COLLECTION_NAME).aggregate([
                    {
                        $match: {
                            OfferID: OfferID,
                            ListType: ListType
                        }
                    },
                    {
                        $lookup: {
                            from: "Offers",
                            localField: "OfferID",
                            foreignField: "OfferID",
                            as: "Offers"
                        }
                    },
                    { $unwind: '$Offers' },
                    {
                        $group: {
                            _id: {
                                id: "$_id",
                                OfferID: "$Offers.OfferID",
                                AdvertiserID: "$Offers.Advertiser.AdvertiserID",
                                Advertiser: "$Offers.Advertiser.Advertiser",
                                CampaignID: "$Offers.Campaign.CampaignID",
                                Campaign: "$Offers.Campaign.Campaign",
                                SupplierID: "$Offers.Supplier.SupplierID",
                                Supplier: "$Offers.Supplier.Supplier",
                                SubPubID: "$SubPubID",
                                Reason: "$Reason",
                                Totals: "$Totals.T",
                                ListType: "$ListType",
                                Status: "$Status",
                                CreationDate: "$CreationDate"
                            }
                        }
                    },
                    {
                        $project: {
                            _id: "$_id.id",
                            AdvertiserID: "$_id.AdvertiserID",
                            Advertiser: "$_id.Advertiser",
                            CampaignID: "$_id.CampaignID",
                            Campaign: "$_id.Campaign",
                            SupplierID: "$_id.SupplierID",
                            Supplier: "$_id.Supplier",
                            OfferID: "$_id.OfferID",
                            SubPubID: "$_id.SubPubID",
                            Motivo: { $ifNull: ["$_id.Reason", ""] },
                            Totals: { $ifNull: ["$_id.Totals", ""] },
                            BlackListStatus: { $cond: { if: { $eq: ["$_id.Status", true] }, then: "Active", else: "Pause" } },
                            StatusID: { $cond: { if: { $eq: ["$_id.Status", true] }, then: "A", else: "I" } },
                            ListType: "$_id.ListType",
                            DateFrom: { $dateToString: { format: "%G-%m-%d %H:%M:%S", date: "$_id.CreationDate" } },
                            DateRo: ""
                        }
                    }
                ],
                    async function (err, data) {
                        let res = await data.toArray();
                        //console.log("Entregando reporte...");
                        resolve(res);
                    });
            } catch (error) {
                log(`BlackList Offer Error ${error} rows`);
                reject(`BlackList Offer Error ${error} rows`);
            }
        });
    } catch (error) {
        log(`BlackList Offer get: ${error}`);
        return false;
    }
}

var getBlackListOffers = async function (ListType, OfferIDs) {
    try {
        return new Promise(function (resolve, reject) {
            try {
                db.connection().collection(COLLECTION_NAME).aggregate([
                    {
                        $match: {
                            OfferID: { $in: OfferIDs},
                            ListType: ListType
                        }
                    },
                    {
                        $lookup: {
                            from: "Offers",
                            localField: "OfferID",
                            foreignField: "OfferID",
                            as: "Offers"
                        }
                    },
                    { $unwind: '$Offers' },
                    {
                        $group: {
                            _id: {
                                id: "$_id",
                                OfferID: "$Offers.OfferID",
                                AdvertiserID: "$Offers.Advertiser.AdvertiserID",
                                Advertiser: "$Offers.Advertiser.Advertiser",
                                CampaignID: "$Offers.Campaign.CampaignID",
                                Campaign: "$Offers.Campaign.Campaign",
                                SupplierID: "$Offers.Supplier.SupplierID",
                                Supplier: "$Offers.Supplier.Supplier",
                                SubPubID: "$SubPubID",
                                Reason: "$Reason",
                                Totals: "$Totals.T",
                                ListType: "$ListType",
                                Status: "$Status",
                                CreationDate: "$CreationDate"
                            }
                        }
                    },
                    {
                        $project: {
                            _id: "$_id.id",
                            AdvertiserID: "$_id.AdvertiserID",
                            Advertiser: "$_id.Advertiser",
                            CampaignID: "$_id.CampaignID",
                            Campaign: "$_id.Campaign",
                            SupplierID: "$_id.SupplierID",
                            Supplier: "$_id.Supplier",
                            OfferID: "$_id.OfferID",
                            SubPubID: "$_id.SubPubID",
                            Motivo: { $ifNull: ["$_id.Reason", ""] },
                            Totals: { $ifNull: ["$_id.Totals", ""] },
                            BlackListStatus: { $cond: { if: { $eq: ["$_id.Status", true] }, then: "Active", else: "Pause" } },
                            StatusID: { $cond: { if: { $eq: ["$_id.Status", true] }, then: "A", else: "I" } },
                            ListType: "$_id.ListType",
                            DateFrom: { $dateToString: { format: "%G-%m-%d %H:%M:%S", date: "$_id.CreationDate" } },
                            DateRo: ""
                        }
                    }
                ],
                    async function (err, data) {
                        let res = await data.toArray();
                        //console.log("Entregando reporte...");
                        resolve(res);
                    });
            } catch (error) {
                log(`BlackList Offer Error ${error} rows`);
                reject(`BlackList Offer Error ${error} rows`);
            }
        });
    } catch (error) {
        log(`BlackList Offer get: ${error}`);
        return false;
    }
}

var getBlackListCampaign = async function (ListType, CampaignIDs) {
    try {
        return new Promise(function (resolve, reject) {
            try {
                db.connection().collection(COLLECTION_NAME).aggregate([
                    {
                        $match: {
                            CampaignID: { $in: CampaignIDs},
                            ListType: ListType
                        }
                    },
                    {
                        $lookup: {
                            from: "Offers",
                            localField: "CampaignID",
                            foreignField: "Campaign.CampaignID",
                            as: "Offers"
                        }
                    },
                    { $unwind: '$Offers' },
                    {
                        $group: {
                            _id: {
                                id: "$_id",
                                //OfferID: "$Offers.OfferID",
                                AdvertiserID: "$Offers.Advertiser.AdvertiserID",
                                Advertiser: "$Offers.Advertiser.Advertiser",
                                CampaignID: "$Offers.Campaign.CampaignID",
                                Campaign: "$Offers.Campaign.Campaign",
                                SubPubID: "$SubPubID",
                                Reason: "$Reason",
                                ListType: "$ListType",
                                Status: "$Status",
                                Totals: "$Totals.T",
                                CreationDate: "$CreationDate"
                            }
                        }
                    },
                    {
                        $project: {
                            _id: "$_id.id",
                            //OfferID: "$_id.OfferID",
                            AdvertiserID: "$_id.AdvertiserID",
                            Advertiser: "$_id.Advertiser",
                            CampaignID: "$_id.CampaignID",
                            Campaign: "$_id.Campaign",
                            SupplierID: "",
                            Supplier: "",
                            OfferID: "",
                            SubPubID: "$_id.SubPubID",
                            Motivo: { $ifNull: ["$_id.Reason", ""] },
                            Totals: { $ifNull: ["$_id.Totals", ""] },
                            BlackListStatus: { $cond: { if: { $eq: ["$_id.Status", true] }, then: "Active", else: "Pause" } },
                            StatusID: { $cond: { if: { $eq: ["$_id.Status", true] }, then: "A", else: "I" } },
                            ListType: "$_id.ListType",
                            DateFrom: { $dateToString: { format: "%G-%m-%d %H:%M:%S", date: "$_id.CreationDate" } },
                            DateRo: ""
                        }
                    }
                ],
                    async function (err, data) {
                        let res = await data.toArray();
                        //console.log("Entregando reporte...");
                        resolve(res);
                    });
            } catch (error) {
                log(`BlackList Campaign Error ${error} rows`);
                reject(`BlackList Campaign Error ${error} rows`);
            }
        });
    } catch (error) {
        log(`BlackList Campaign report: ${error}`);
        return false;
    }
}

var getBlackListAdvertiser = async function (ListType, AdvertiserID) {
    try {
        return new Promise(function (resolve, reject) {
            try {
                db.connection().collection(COLLECTION_NAME).aggregate([
                    {
                        $match: {
                            AdvertiserID: AdvertiserID,

                            ListType: ListType
                        }
                    },
                    {
                        $project: {
                            _id: "$_id",
                            //OfferID: "$_id.OfferID",
                            AdvertiserID: 1, //$_id.AdvertiserID",
                            Advertiser: "", //""$_id.Advertiser",
                            CampaignID: 1,
                            Campaign: "",
                            SupplierID: 1,
                            Supplier: "",
                            OfferID: 1,
                            SubPubID: 1, //"$_id.SubPubID",
                            Motivo: { $ifNull: ["$_id.Reason", ""] },
                            Totals: { $ifNull: ["$_id.Totals", ""] },
                            BlackListStatus: { $cond: { if: { $eq: ["$Status", true] }, then: "Active", else: "Pause" } },
                            StatusID: { $cond: { if: { $eq: ["$Status", true] }, then: "A", else: "I" } },
                            ListType: 1, //"$ListType",
                            DateFrom: { $dateToString: { format: "%G-%m-%d %H:%M:%S", date: "$CreationDate" } },
                            DateRo: ""
                        }
                    }
                ],
                    async function (err, data) {
                        let res = await data.toArray();
                        //console.log("Entregando reporte...");
                        resolve(res);
                    });
            } catch (error) {
                log(`BlackList Campaign Error ${error} rows`);
                reject(`BlackList Campaign Error ${error} rows`);
            }
        });
        /**
         ,
                    {
                        $lookup: {
                            from: "Offers",
                            localField: "AdvertiserID",
                            foreignField: "Advertiser.AdvertiserID",
                            as: "Offers"
                        }
                    },
                    { $unwind: '$Offers' },
                    {
                        $group: {
                            _id: {
                                //CampaignID: "$CampaignID",
                                //_id: 1,
                                //OfferID: "$Offers.OfferID",
                                AdvertiserID: "$Offers.Advertiser.AdvertiserID",
                                Advertiser: "$Offers.Advertiser.Advertiser",
                                SubPubID: "$SubPubID",
                                Reason: "$Reason",
                                ListType: "$ListType",
                                Totals: "$Totals.T",
                                Status: "$Status",
                                CreationDate: "$CreationDate"
                            }
                        }
                    },
         */
    } catch (error) {
        log(`BlackList Campaign report: ${error}`);
        return false;
    }
}

var getBlackListSupplier = async function (ListType, SupplierID) {
    try {
        return new Promise(function (resolve, reject) {
            try {
                db.connection().collection(COLLECTION_NAME).aggregate([
                    {
                        $match: {
                            SupplierID: SupplierID,
                            ListType: ListType
                        }
                    },
                    {
                        $lookup: {
                            from: "Offers",
                            localField: "SupplierID",
                            foreignField: "Supplier.SupplierID",
                            as: "Offers"
                        }
                    },
                    { $unwind: '$Offers' },
                    {
                        $group: {
                            _id: {
                                id: "$_id",
                                SupplierID: "$Offers.Supplier.SupplierID",
                                Supplier: "$Offers.Supplier.Supplier",
                                SubPubID: "$SubPubID",
                                Reason: "$Reason",
                                ListType: "$ListType",
                                Status: "$Status",
                                Totals: "$Totals.T",
                                CreationDate: "$CreationDate"
                            }
                        }
                    },
                    {
                        $project: {
                            _id: "$_id.id",
                            //OfferID: "$_id.OfferID",
                            AdvertiserID: "", 
                            Advertiser: "",  
                            CampaignID: "",
                            Campaign: "",
                            SupplierID: "$_id.SupplierID",
                            Supplier: "$_id.Supplier",
                            OfferID: "",
                            SubPubID: "$_id.SubPubID",
                            Motivo: { $ifNull: ["$_id.Reason", ""] },
                            Totals: { $ifNull: ["$_id.Totals", ""] },
                            BlackListStatus: { $cond: { if: { $eq: ["$_id.Status", true] }, then: "Active", else: "Pause" } },
                            StatusID: { $cond: { if: { $eq: ["$_id.Status", true] }, then: "A", else: "I" } },
                            ListType: "$_id.ListType",
                            DateFrom: { $dateToString: { format: "%G-%m-%d %H:%M:%S", date: "$_id.CreationDate" } },
                            DateRo: ""
                        }
                    }
                ],
                    async function (err, data) {
                        let res = await data.toArray();
                        //console.log("Entregando reporte...");
                        resolve(res);
                    });
            } catch (error) {
                log(`BlackList Campaign Error ${error} rows`);
                reject(`BlackList Campaign Error ${error} rows`);
            }
        });
    } catch (error) {
        log(`BlackList Campaign report: ${error}`);
        return false;
    }
}

var getBLSubPub = async function ( OfferID, SubPubID) {
    try {
        let BL = await db.connection().collection(COLLECTION_NAME).find(
          {
            'OfferID': OfferID,
            'SubPubID': SubPubID
          }
        ).toArray();
        return BL;
    } catch (error) {
      return [];
    }
}

module.exports = {
    getBlacklist: getBlacklist,
    getWhitelist: getWhitelist,
    getBlacklistSubPub: getBlacklistSubPub,
    getBlacklistSubPubSupplier: getBlacklistSubPubSupplier,
    addBlackListTotal: addBlackListTotal,
    saveBlackList: saveBlackList,
    delBlackList: delBlackList,
    delBlackListID: delBlackListID,
    pauseBlackListID: pauseBlackListID,
    createNewBlackListStructFromInput: createNewBlackListStructFromInput,
    getBlackListOffer: getBlackListOffer,
    getBlackListOffers: getBlackListOffers,
    getBlackListCampaign: getBlackListCampaign,
    getBlackListAdvertiser: getBlackListAdvertiser,
    getBlackListSupplier: getBlackListSupplier,
    getBLSubPub: getBLSubPub,
    getBlacklistP2: getBlacklistP2
}

//Get the date + configured days in environment
function getExpirationDate() {
    return new Date(moment().add(config.MONGO_DB_CLICK_EXPIRATION_IN_DAYS, 'days'));
}