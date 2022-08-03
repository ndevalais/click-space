var db = require('../db/index');
var _ = require('lodash');
var moment = require('moment');
var log = require("../log");
const COLLECTION_NAME = "CampaignTotals";

var insertCampaignTotals = function (datefrom, dateto, items) {
    //Date(DateFrom.year(), DateFrom.month(), DateFrom.day(), 0,0,0).toISOString()
    try {

        return new Promise(async function (resolve, reject) {

            await db.connection().collection(COLLECTION_NAME).deleteMany(
                {
                    CreationDate: { "$gte": new Date(datefrom), "$lte": new Date(dateto) }
                })
                .then(
                    function (result) {
                        //resolve(`Delete a document into the CampaignTotals ${result}.`);
                        log(`Delete a document into the CampaignTotals ${result}.`);
                    }
                )
                .catch(
                    function (err) {
                        log(`Error Delete a document into the CampaignTotals ${err}.`);
                    }
                );

            await db.connection().collection(COLLECTION_NAME).insertMany(items)
                .then(
                    function (result) {
                        log(`Inserted/Update a document into the CampaignTotals ${result.insertedCount}.`);
                        resolve(`Inserted/Update a document into the CampaignTotals ${result.insertedCount}.`);
                    }
                )
                .catch(
                    function (err) {
                        log(`Error Inserted/Update  a document into the CampaignTotals ${err}.`);
                        reject(`Error Inserted/Update  a document into the CampaignTotals ${err}.`);
                    }
                );
        });

    } catch (error) {
        log(`CampaignsTotals: ${error}`);
        return false;
    }
}

var getReportDashBoard = function (DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID, UserName) {
    //Date(DateFrom.year(), DateFrom.month(), DateFrom.day(), 0,0,0).toISOString()
    try {
        return new Promise(function (resolve, reject) {
            try {
                let lookup;
                let filterMatch = {
                    $match: {
                        Date: { "$gte": new Date(DateFrom), "$lte": new Date(DateTo) },
                    }
                };

                if (OfferID != 0) {
                    filterMatch.$match.OfferID = OfferID;

                } else {
                    if (CampaignID != 0) {
                        filterMatch.$match.CampaignID = CampaignID;
                    } else {
                        if (AdvertiserID != 0) {
                            filterMatch.$match.AdvertiserID = AdvertiserID;
                        }
                    }
                }
                if (SupplierID != 0) filterMatch.$match.SupplierID = SupplierID;

                if (UserID != 0) filterMatch.$match.$or = [{ AccountManagerIDAdv: UserID }, { AccountManagerID: UserID }];

                let group = {
                    "$group": {
                        _id: {
                            OfferID: "$OfferID"
                        },
                        OfferGUID: { $first: "$OfferGUID" },
                        Offer: { $first: "$Campaign" },
                        AdvertiserID: { $first: "$AdvertiserID" },
                        Advertiser: { $first: "$Advertiser" },
                        AccountManagerIDAdv: { $first: "$AccountManagerIDAdv" },
                        AccountManagerAdv: { $first: "$AccountManagerAdv" },
                        CampaignID: { $first: "$CampaignID" },
                        Campaign: { $first: "$Campaign" },
                        CampaignTypeID: { $first: "$CampaignTypeID" },
                        SupplierID: { $first: "$SupplierID" },
                        Supplier: { $first: "$Supplier" },
                        AccountManager: { $first: "$AccountManager" },
                        AccountManagerID: { $first: "$AccountManagerID" },
                        PostBackURL: { $first: "$PostBackURL" },
                        Proxy: { $first: "$Proxy" },
                        Cost: { $sum: "$TotalCost" },
                        Revenue: { $sum: "$TotalRevenue" },
                        StatusID: { $first: "$StatusID" },
                        Status: { $first: "$Status" },
                        ClickCount: { $sum: "$ClickCount" },
                        TrackingCount: { $sum: "$TrackingCount" },
                        TotalRevenue: { $sum: "$TotalRevenue" },
                        TotalCost: { $sum: "$TotalCost" },
                        TotalProfit: { $sum: "$TotalProfit" },
                        TrackingProxy: { $sum: "$TrackingProxy" },
                        TrackingEvents: { $sum: "$TrackingEvent" }
                    }
                };
                let project = {
                    $project: {
                        _id: 0,
                        OfferID: "$_id.OfferID",
                        OfferGUID: 1,
                        AdvertiserID: 1,
                        Advertiser: 1,
                        AccountManagerIDAdv: 1,
                        AccountManagerAdv: 1,
                        CampaignID: 1,
                        Campaign: 1,
                        CampaignTypeID: 1,
                        SupplierID: 1,
                        Supplier: 1,
                        AccountManager: 1,
                        AccountManagerID: 1,
                        Proxy: 1,
                        PostBackURL: 1, //{ $ifNull: ["$_id.PostBackURLO", "$_id.PostBackURLS"] },
                        CR: { $cond: [{ $eq: ["$ClickCount", 0] }, 0, { $divide: [{ $multiply: ["$TrackingCount", 100] }, "$ClickCount"] }] },
                        Cost: 1,
                        Revenue: 1,
                        StatusID: 1,
                        Status: 1,
                        ClickCount: 1,
                        TrackingCount: 1,
                        TotalRevenue: 1,
                        TotalCost: 1,
                        TotalProfit: { $subtract: ["$TotalRevenue", "$TotalCost"] },
                        TrackingProxy: 1,
                        TrackingEvents: 1,
                        bgColor: 'bg-success',
                        Mostrar: true
                    }
                };

                //filterMatch = JSON.parse(filterMatch); COLLECTION_NAME 
                //TotalProfit: 1,
                db.connection().collection('CampaignTotalGroup').aggregate([
                    filterMatch
                    , group
                    , project
                ],
                    async function (err, data) {
                        let res = await data.toArray();
                        //console.log("Entregando reporte...");
                        resolve(res);
                    });
            } catch (error) {
                log(`Error ${error} rows`);
                reject(`Error ${error} rows`);
            }
        });
    } catch (error) {
        log(`report: ${error}`);
        return false;
    }
}

/**
 * Reporte de detalle - Se ejecuta desde la opcion reports del dashboard
 * @param {*} DateFrom 
 * @param {*} DateTo 
 * @param {*} AdvertiserID 
 * @param {*} SupplierID 
 * @param {*} CampaignID 
 * @param {*} OfferID 
 * @param {*} UserID 
 * @param {*} withSubPub 
 */
var getReportsDetailsDate = function (DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID) {

    try {
        return new Promise(function (resolve, reject) {
            try {
                let filterMatch = {};
                let group;
                let project;

                filterMatch = { $match: { Date: { "$gte": new Date(DateFrom), "$lte": new Date(DateTo) } } };
                if (OfferID != 0) {
                    //filterMatch = filterMatch + ` "OfferID": ${OfferID},`;
                    filterMatch.$match.OfferID = OfferID;

                } else {
                    if (CampaignID != 0) {
                        filterMatch.$match.CampaignID = CampaignID;
                    } else {
                        if (AdvertiserID != 0) {
                            filterMatch.$match.AdvertiserID = AdvertiserID;
                        }
                    }
                }
                if (SupplierID != 0) filterMatch.$match.SupplierID = SupplierID;
                //if (UserID != 0) filterMatch.$match.$or = [{ AccountManagerIDAdv: UserID }, { AccountManagerID: UserID }];
                if (UserID != 0) filterMatch.$match.AccountManagerIDAdv = UserID;

                group = {
                    "$group": {
                        _id: {
                            CreationDate: { "$dateToString": { "format": "%d-%m-%Y", "date": "$Date" } },
                            OfferID: "$OfferID"
                        },
                        OfferGUID: { $first: "$OfferGUID" },
                        AdvertiserID: { $first: "$AdvertiserID" },
                        Advertiser: { $first: "$Advertiser" },
                        CampaignID: { $first: "$CampaignID" },
                        Campaign: { $first: "$Campaign" },
                        Device: { $first: "$Device" },
                        Category: { $first: "$Category" },
                        CampaignTypeID: { $first: "$CampaignTypeID" },
                        DailyCap: { $first: "$DailyQuantity" },
                        Countrys: { $first: "$Countries" },
                        SupplierID: { $first: "$SupplierID" },
                        Supplier: { $first: "$Supplier" },
                        AccountManager: { $first: "$AccountManagerAdv" },
                        AccountManagerID: { $first: "$AccountManagerIDAdv" },
                        PostBackURL: { $first: "$PostBackURL" },
                        //PostBackURLS: { $first: "$PostBackURL" },
                        Proxy: { $first: "$Proxy" },
                        StatusID: { $first: "$StatusID" },
                        totalClick: { $sum: "$ClickCount" },
                        totalInstall: { $sum: "$TrackingCount" },
                        totalRevenue: { $sum: "$TotalRevenue" },
                        totalCost: { $sum: "$TotalCost" },
                        totalProfit: { $sum: "$TotalProfit" },
                        totalProxy: { $sum: "$TrackingProxy" },
                        totalEvent: { $sum: "$TrackingEvent" },
                    }
                };
                project = {
                    $project: {
                        _id: 0,
                        CreationDate: "$_id.CreationDate",
                        //OfferID: "$_id.OfferID",
                        //OfferGUID: 1,
                        AdvertiserID: 1,
                        Advertiser: 1,
                        CampaignID: 1,
                        Campaign: 1,
                        Device: 1,
                        Category: 1,
                        CampaignTypeID: 1,
                        //DailyCap: 1,
                        Countrys: 1,
                        SupplierID: 1,
                        Supplier: 1,
                        AccountManager: 1,
                        //AccountManagerID: 1,
                        Proxy: 1,
                        //StatusID: 1,
                        totalClick: { $round: [ "$totalClick", 0 ] },
                        totalInstall: { $round: [ "$totalInstall", 0 ] },
                        totalRevenue: { $round: [ "$totalRevenue", 2 ] },
                        totalCost: { $round: [ "$totalCost", 2 ] },
                        totalProfit: { $round: [ "$totalProfit", 2 ] },
                        totalProxy: { $round: [ "$totalProxy", 0 ] },
                        totalEvent: { $round: [ "$totalEvent", 0 ] },
                    }
                };

                db.connection().collection('CampaignTotalGroup').aggregate([
                    filterMatch
                    , group
                    , project
                ],
                    async function (err, data) {
                        let res = await data.toArray();
                        //console.log("Entregando reporte...");
                        resolve(res);
                    });
            } catch (error) {
                log(`Error ${error} rows`);
                reject(`Error ${error} rows`);
            }
        });
    } catch (error) {
        log(`report: ${error}`);
        return false;
    }
}


/**
 * reportsCampaignTotal 
 * @param {*} DateFrom 
 * @param {*} DateTo 
 * @param {*} AdvertiserID 
 * @param {*} SupplierID 
 * @param {*} CampaignID 
 * @param {*} OfferID 
 * @param {*} UserID 
 */
var reportsCampaignTotal = function (DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID, 
    isDate = false, isAdvertiser = false, isCampaign = false, isSupplier = false, isOffer = false, 
    clicks=0, installs=0, events=0, opeClicks='Greater', opeInstalls='Greater', opeEvents='Greater' ) 
    {
    //Date(DateFrom.year(), DateFrom.month(), DateFrom.day(), 0,0,0).toISOString()
    try {
        return new Promise(function (resolve, reject) {
            try {
                let filterMatch = {};
                let group = {};
                let project = { 
                    $project: {
                        _id: 0
                    } 
                }
                let sort = { $sort: {CreationDate:1} };
                let totalMatch = {$match: {} }; 

                if (opeClicks=='Greater') if (clicks>0) totalMatch.$match.totalClick = {$gte: clicks};
                if (opeClicks=='Less') if (clicks>0) totalMatch.$match.totalClick = {$lte: clicks};
                if (opeClicks=='Equal') if (clicks>=0) totalMatch.$match.totalClick = {$eq: clicks};

                if (opeInstalls=='Greater') if (installs>0) totalMatch.$match.totalInstall = {$gte: installs};
                if (opeInstalls=='Less') if (installs>0) totalMatch.$match.totalInstall = {$lte: installs};
                if (opeInstalls=='Equal') if (installs>=0) totalMatch.$match.totalInstall = {$eq: installs};

                if (opeEvents=='Greater') if (events>0) totalMatch.$match.totalEvent = {$gte: events};
                if (opeEvents=='Less') if (events>0) totalMatch.$match.totalEvent = {$lte: events};
                if (opeEvents=='Equal') if (events>=0) totalMatch.$match.totalEvent = {$eq: events};


                filterMatch = { $match: { "CreationDate": { "$gte": new Date(DateFrom), "$lte": new Date(DateTo) } } };
                if (OfferID != 0) {
                    filterMatch = filterMatch + ` "OfferID": ${OfferID},`;
                    filterMatch.$match.OfferID = OfferID;

                } else {
                    if (CampaignID != 0) {
                        filterMatch.$match.CampaignID = CampaignID;
                    } else {
                        if (AdvertiserID != 0) {
                            filterMatch.$match.AdvertiserID = AdvertiserID;
                        }
                    }
                }
                if (SupplierID != 0) filterMatch.$match.SupplierID = SupplierID;
                if (UserID != 0) {
                    //filterMatch.$match.$or = [ { "AccountManagerIDAdv": UserID}, { "AccountManagerID": UserID} ]
                    filterMatch.$match.AccountManagerIDAdv = UserID;// [ { "AccountManagerIDAdv": UserID}, { "AccountManagerID": UserID} ]
                }

                if (isDate) {
                    group = { $group: { _id: { CreationDate: "$CreationDate" } } };
                    //project.$project.CreationDate = "$_id.CreationDate";
                    project.$project.CreationDate = { "$dateToString": { "format": "%d-%m-%Y", "date": "$_id.CreationDate" } };
                } else {
                    group = { $group: {_id: {} }};
                }
                if (isOffer) {
                    group.$group._id.OfferID = "$OfferID";
                    group.$group.AdvertiserID = { $first: "$AdvertiserID" };
                    group.$group.Advertiser = { $first: "$Advertiser" };
                    group.$group.CampaignID = { $first: "$CampaignID" };
                    group.$group.Campaign = { $first: "$Campaign" };
                    group.$group.Category = { $first: "$Category" };
                    group.$group.CampaignTypeID = { $first: "$CampaignTypeID" };
                    group.$group.DailyCap = { $first: "$DailyCap" };
                    group.$group.Countries = { $first: "$Countries" };
                    group.$group.Cost = { $first: "$Cost" };
                    group.$group.Revenue = { $first: "$Revenue" };
                    group.$group.Proxy = { $first: "$Proxy" };
                    group.$group.SupplierID = { $first: "$SupplierID" };
                    group.$group.Supplier = { $first: "$Supplier" };
                    group.$group.AccountManager = { $first: "$AccountManager" };
                    group.$group.AccountManagerID = { $first: "$AccountManagerID" };
                    group.$group.AccountManagerAdv = { $first: "$AccountManagerAdv" };
                    group.$group.AccountManagerIDAdv = { $first: "$AccountManagerIDAdv" };

                    project.$project.OfferID = "$_id.OfferID";
                    project.$project.AdvertiserID = 1;
                    project.$project.Advertiser = 1;
                    project.$project.CampaignID = 1;
                    project.$project.Campaign = 1;
                    project.$project.Device = 1;
                    project.$project.Category = 1;
                    project.$project.CampaignTypeID = 1;
                    project.$project.DailyCap = 1;
                    project.$project.Countries = 1;
                    project.$project.Cost = 1;
                    project.$project.Revenue = 1;
                    project.$project.Proxy = 1;
                    project.$project.SupplierID = 1;
                    project.$project.Supplier = 1;
                    project.$project.AccountManager = 1;
                    project.$project.AccountManagerID = 1;
                    project.$project.AccountManagerAdv = 1;
                    project.$project.AccountManagerIDAdv = 1;


                } else {
                    if (isCampaign) {
                        group.$group._id.CampaignID = "$CampaignID";
                        group.$group.AdvertiserID = { $first: "$AdvertiserID" };
                        group.$group.Advertiser = { $first: "$Advertiser" };
                        //group.$group.CampaignID = { $first: "$CampaignID" };
                        group.$group.Campaign = { $first: "$Campaign" };
                        group.$group.Category = { $first: "$Category" };
                        group.$group.CampaignTypeID = { $first: "$CampaignTypeID" };
                        group.$group.DailyCap = { $first: "$DailyCap" };
                        group.$group.Countries = { $first: "$Countries" };
                        group.$group.Cost = { $first: "$Cost" };
                        group.$group.Revenue = { $first: "$Revenue" };
                        group.$group.Proxy = { $first: "$Proxy" };
                        group.$group.AccountManagerAdv = { $first: "$AccountManagerAdv" };
                        group.$group.AccountManagerIDAdv = { $first: "$AccountManagerIDAdv" };

                        project.$project.CampaignID = "$_id.CampaignID";
                        project.$project.AdvertiserID = 1;
                        project.$project.Advertiser = 1;
                        //project.$project.CampaignID = 1;
                        project.$project.Campaign = 1;
                        project.$project.Device = 1;
                        project.$project.Category = 1;
                        project.$project.CampaignTypeID = 1;
                        project.$project.DailyCap = 1;
                        project.$project.Countries = 1;
                        project.$project.Cost = 1;
                        project.$project.Revenue = 1;
                        project.$project.Proxy = 1;
                        //project.$project.SupplierID = 1;
                        //project.$project.Supplier = 1;
                        //project.$project.AccountManager = 1;
                        //project.$project.AccountManagerID = 1;
                        project.$project.AccountManagerAdv = 1;
                        project.$project.AccountManagerIDAdv = 1;

                        sort.$sort.AdvertiserID = 1;
                    } else  {
                        if (isAdvertiser) {
                            group.$group._id.AdvertiserID = "$AdvertiserID";
                            group.$group.Advertiser = { $first: "$Advertiser" };
                            group.$group.AccountManagerAdv = { $first: "$AccountManagerAdv" };
                            group.$group.AccountManagerIDAdv = { $first: "$AccountManagerIDAdv" };

                            project.$project.AdvertiserID = "$_id.AdvertiserID";
                            project.$project.Advertiser = 1;
                            project.$project.AccountManagerAdv = 1;
                            project.$project.AccountManagerIDAdv = 1;

                            sort.$sort.AdvertiserID = 1;
                        } 
                        if (isSupplier) {
                            group.$group._id.SupplierID = "$SupplierID";
                            //group.$group.SupplierID = { $first: "$SupplierID" };
                            group.$group.Supplier = { $first: "$Supplier" };
                            group.$group.AccountManager = { $first: "$AccountManager" };
                            group.$group.AccountManagerID = { $first: "$AccountManagerID" };

                            project.$project.SupplierID = "$_id.SupplierID";
                            project.$project.Supplier = 1;
                            project.$project.AccountManager = 1;
                            project.$project.AccountManagerID = 1;
                        }
                        
                    }
                }
                group.$group.totalClick ={ $sum: "$totalClick" };
                group.$group.totalInstall = { $sum: "$totalInstall" };
                group.$group.totalRevenue = { $sum: "$totalRevenue" };
                group.$group.totalCost = { $sum: "$totalCost" };
                group.$group.totalProfit = { $sum: "$totalProfit" };
                group.$group.totalProxy = { $sum: "$totalProxy" };
                group.$group.totalEvent = { $sum: "$totalEvent" };

                project.$project.totalClick = { $round: [ "$totalClick", 0 ] };
                project.$project.totalInstall = { $round: [ "$totalInstall", 0 ] };
                project.$project.totalRevenue = { $round: [ "$totalRevenue", 2 ] };
                project.$project.totalCost = { $round: [ "$totalCost", 2 ] };
                project.$project.totalProfit = { $round: [ "$totalProfit", 2 ] };
                project.$project.totalProxy = { $round: [ "$totalProxy", 0 ] };
                project.$project.totalEvent = { $round: [ "$totalEvent", 0 ] };
                project.$project.CR = { $cond: [{ $eq: ["$totalClick", 0] }, 0, { $divide: [{ $multiply: ["$totalInstall", 100] }, "$totalClick"] }] }

                db.connection().collection(COLLECTION_NAME).aggregate([
                        filterMatch
                        ,group
                        ,totalMatch
                        ,project
                        ,sort
                    ],
                    {
                        allowDiskUse: true
                    },
                        async function (err, data) {
                            let res = await data.toArray();
                            //console.log("Entregando reporte...");
                            resolve(res);
                            //let x = roughSizeOfObject(res)
                            //var size = Object.bsonsize(obj);
                            //print('_id: '+obj._id+' || Size: '+size+'B -> '+Math.round(size/(1024))+'KB -> '+Math.round(size/(1024*1024))+'MB (max 16MB)');
                        }
                );
            } catch (error) {
                log(`Error ${error} rows`);
                reject(`Error ${error} rows`);
            }
        });
    } catch (error) {
        log(`report: ${error}`);
        return false;
    }
}

var reportsCampaignTotalCount = function (DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID ) 
    {
    try {
        return new Promise(function (resolve, reject) {
            try {
                let filterMatch = {};

                filterMatch = { $match: { "CreationDate": { "$gte": new Date(DateFrom), "$lte": new Date(DateTo) } } };
                if (OfferID != 0) {
                    filterMatch = filterMatch + ` "OfferID": ${OfferID},`;
                    filterMatch.$match.OfferID = OfferID;

                } else {
                    if (CampaignID != 0) {
                        filterMatch.$match.CampaignID = CampaignID;
                    } else {
                        if (AdvertiserID != 0) {
                            filterMatch.$match.AdvertiserID = AdvertiserID;
                        }
                    }
                }
                if (SupplierID != 0) filterMatch.$match.SupplierID = SupplierID;
                if (UserID != 0) {
                    filterMatch.$match.AccountManagerIDAdv = UserID;
                }
                
                db.connection().collection(COLLECTION_NAME).aggregate([
                        filterMatch
                        ,{
                            $group: {
                               _id: null,
                               count: { $sum: 1 }
                            }
                        }
                    ],
                    {
                        allowDiskUse: true
                    },
                        async function (err, data) {
                            let res = await data.toArray();
                            //console.log("Entregando reporte...");
                            let retorno = 0;
                            if (res.length>0) {
                                retorno = res[0].count;
                            }
                            resolve(retorno);
                        }
                );
            } catch (error) {
                log(`Error ${error} rows`);
                reject(`Error ${error} rows`);
            }
        });
    } catch (error) {
        log(`report: ${error}`);
        return false;
    }
}

module.exports = {
    insertCampaignTotals: insertCampaignTotals,
    getReportDashBoard: getReportDashBoard,
    getReportsDetailsDate: getReportsDetailsDate,
    reportsCampaignTotal: reportsCampaignTotal,
    reportsCampaignTotalCount: reportsCampaignTotalCount
}
