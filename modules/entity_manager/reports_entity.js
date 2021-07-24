var db = require('../db/index');
var _ = require('lodash');
var moment = require('moment');
var log = require("../log");
const COLLECTION_NAME = "CampaignTotalGroup";

var getReportDashBoard = function (DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID, UserName, withSubPub) {
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
                if (UserID != 0) {
                    lookup = {
                        $lookup: {
                            from: "Offers",
                            let: { id: "$OfferID" },
                            pipeline: [
                                { 
                                    $match: { 
                                        $expr: {
                                            $and: [
                                                { $eq: [ "$OfferID",  "$$id" ]  }, 
                                                { $or: [ { $eq: ["$Advertiser.AccountManagerID", UserID ] }, { $eq: ["$Supplier.AccountManagerID", UserID ] }  ] }
                                            ]
                                        } 
                                    } 
                                }
                            ],
                            as: "Offers"
                        }
                    };
                } else {
                    lookup = {
                        $lookup: {
                            from: "Offers",
                            localField: "OfferID",
                            foreignField: "OfferID",
                            as: "Offers"
                        }
                    };
                }
                //filterMatch.$match.AccountManagerID = UserID;
                //if (UserID != 0) filterMatch.$match.AccountManagerID = UserName;

                let group;
                let project;
                if (withSubPub) {
                    group = {
                        "$group": {
                            _id: {
                                OfferID: "$OfferID",
                                SubPubID: "$SubPubID"
                            },
                            OfferGUID: { $first: "$Offers.OfferGUID" },
                            Offer: { $first: "$Offers.Campaign.Campaign" },
                            AdvertiserID: { $first: "$Offers.Advertiser.AdvertiserID" },
                            Advertiser: { $first: "$Offers.Advertiser.Advertiser" },
                            AccountManagerIDAdv: { $first: "$Offers.Advertiser.AccountManagerID" },
                            AccountManagerAdv: { $first: "$Offers.Advertiser.AccountManager" },
                            CampaignID: { $first: "$Offers.Campaign.CampaignID" },
                            Campaign: { $first: "$Offers.Campaign.Campaign" },
                            SupplierID: { $first: "$Offers.Supplier.SupplierID" },
                            Supplier: { $first: "$Offers.Supplier.Supplier" },
                            AccountManager: { $first: "$Offers.Supplier.AccountManager" },
                            AccountManagerID: { $first: "$Offers.Supplier.AccountManagerID" },
                            PostBackURLO: { $first: "$Offers.PostBackURL" },
                            PostBackURLS: { $first: "$Offers.Supplier.PostBackURL" },
                            Proxy: { $first: "$Offers.Proxy" },
                            Cost: { $sum: "$TotalCost" },
                            Revenue: { $sum: "$TotalRevenue" },
                            StatusID: { $first: "$Offers.StatusID" },
                            Status: { $first: "$Offers.Status" },
                            ClickCount: { $sum: "$ClickCount" },
                            TrackingCount: { $sum: "$TrackingCount" },
                            TotalRevenue: { $sum: "$TotalRevenue" },
                            TotalCost: { $sum: "$TotalCost" },
                            TotalProfit: { $sum: "$TotalProfit" },
                            TrackingProxy: { $sum: "$TrackingProxy" },
                            TrackingEvents: { $sum: "$TrackingEvent" }
                        }
                    };
                    project = {
                        $project: {
                            _id: 0,
                            OfferID: "$_id.OfferID",
                            OfferGUID: 1,
                            SubPubID: "$_id.SubPubID",
                            AdvertiserID: 1,
                            Advertiser: 1,
                            AccountManagerIDAdv: 1,
                            AccountManagerAdv: 1,
                            CampaignID: 1,
                            Campaign: 1,
                            SupplierID: 1,
                            Supplier: 1,
                            AccountManager: 1,
                            AccountManagerID: 1,
                            Proxy: 1,
                            PostBackURL: { $ifNull: ["$_id.PostBackURLO", "$_id.PostBackURLS"] },
                            CR: { $cond: [ { $eq: [ "$ClickCount", 0 ] }, 0, { $divide: [ { $multiply: ["$TrackingCount", 100] }, "$ClickCount" ] } ] },
                            Cost: 1,
                            Revenue: 1,
                            StatusID: 1,
                            Status: 1,
                            ClickCount: 1,
                            TrackingCount: 1,
                            TotalRevenue: 1,
                            TotalCost: 1,
                            TotalProfit: 1,
                            TrackingProxy: 1,
                            TrackingEvents: 1,
                            bgColor: 'bg-success',
                            Mostrar: true
                        }
                    };
                } else {
                    group = {
                        "$group": {
                            _id: {
                                OfferID: "$OfferID"
                            },
                            OfferGUID: { $first: "$Offers.OfferGUID" },
                            Offer: { $first: "$Offers.Campaign.Campaign" },
                            AdvertiserID: { $first: "$Offers.Advertiser.AdvertiserID" },
                            Advertiser: { $first: "$Offers.Advertiser.Advertiser" },
                            AccountManagerIDAdv: { $first: "$Offers.Advertiser.AccountManagerID" },
                            AccountManagerAdv: { $first: "$Offers.Advertiser.AccountManager" },
                            CampaignID: { $first: "$Offers.Campaign.CampaignID" },
                            Campaign: { $first: "$Offers.Campaign.Campaign" },
                            SupplierID: { $first: "$Offers.Supplier.SupplierID" },
                            Supplier: { $first: "$Offers.Supplier.Supplier" },
                            AccountManager: { $first: "$Offers.Supplier.AccountManager" },
                            AccountManagerID: { $first: "$Offers.Supplier.AccountManagerID" },
                            PostBackURLO: { $first: "$Offers.PostBackURL" },
                            PostBackURLS: { $first: "$Offers.Supplier.PostBackURL" },
                            Proxy: { $first: "$Offers.Proxy" },
                            Cost: { $sum: "$TotalCost" },
                            Revenue: { $sum: "$TotalRevenue" },
                            StatusID: { $first: "$Offers.StatusID" },
                            Status: { $first: "$Offers.Status" },
                            ClickCount: { $sum: "$ClickCount" },
                            TrackingCount: { $sum: "$TrackingCount" },
                            TotalRevenue: { $sum: "$TotalRevenue" },
                            TotalCost: { $sum: "$TotalCost" },
                            TotalProfit: { $sum: "$TotalProfit" },
                            TrackingProxy: { $sum: "$TrackingProxy" },
                            TrackingEvents: { $sum: "$TrackingEvent" }
                        }
                    };
                    project = {
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
                            SupplierID: 1,
                            Supplier: 1,
                            AccountManager: 1,
                            AccountManagerID: 1,
                            Proxy: 1,
                            PostBackURL: { $ifNull: ["$_id.PostBackURLO", "$_id.PostBackURLS"] },
                            CR: { $cond: [ { $eq: [ "$ClickCount", 0 ] }, 0, { $divide: [ { $multiply: ["$TrackingCount", 100] }, "$ClickCount" ] } ] },
                            Cost: 1,
                            Revenue: 1,
                            StatusID: 1,
                            Status: 1,
                            ClickCount: 1,
                            TrackingCount: 1,
                            TotalRevenue: 1,
                            TotalCost: 1,
                            TotalProfit: 1,
                            TrackingProxy: 1,
                            TrackingEvents: 1,
                            bgColor: 'bg-success',
                            Mostrar: true
                        }
                    };
                }

                //filterMatch = JSON.parse(filterMatch);

                db.connection().collection(COLLECTION_NAME).aggregate([
                    filterMatch
                    , lookup
                    , { $unwind: "$Offers" }
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

var getReportDashBoardDate = function (DateFrom, DateTo ) {
    //Date(DateFrom.year(), DateFrom.month(), DateFrom.day(), 0,0,0).toISOString()
    try {
        return new Promise(function (resolve, reject) {
            try {
                let lookup;
                let filterMatch = {
                    $match: {
                        Date: { "$gte": new Date(DateFrom), "$lte": new Date(DateTo) }
                    }
                };
 
                lookup = {
                    $lookup: {
                        from: "Offers",
                        localField: "OfferID",
                        foreignField: "OfferID",
                        as: "Offers"
                    }
                };
                
                let group = {
                    "$group": {
                        _id: {
                            Date: "$Date",
                            OfferID: "$OfferID"
                        },
                        OfferGUID: { $first: "$Offers.OfferGUID" },
                        Offer: { $first: "$Offers.Campaign.Campaign" },
                        AdvertiserID: { $first: "$Offers.Advertiser.AdvertiserID" },
                        Advertiser: { $first: "$Offers.Advertiser.Advertiser" },
                        AccountManagerIDAdv: { $first: "$Offers.Advertiser.AccountManagerID" },
                        AccountManagerAdv: { $first: "$Offers.Advertiser.AccountManager" },
                        CampaignID: { $first: "$Offers.Campaign.CampaignID" },
                        CampaignTypeID: { $first: "$Offers.Campaign.CampaignTypeID" },
                        Campaign: { $first: "$Offers.Campaign.Campaign" },
                        SupplierID: { $first: "$Offers.Supplier.SupplierID" },
                        Supplier: { $first: "$Offers.Supplier.Supplier" },
                        AccountManager: { $first: "$Offers.Supplier.AccountManager" },
                        AccountManagerID: { $first: "$Offers.Supplier.AccountManagerID" },
                        PostBackURLO: { $first: "$Offers.PostBackURL" },
                        PostBackURLS: { $first: "$Offers.Supplier.PostBackURL" },
                        Proxy: { $first: "$Offers.Proxy" },
                        Cost: { $sum: "$TotalCost" },
                        Revenue: { $sum: "$TotalRevenue" },
                        StatusID: { $first: "$Offers.StatusID" },
                        Status: { $first: "$Offers.Status" },
                        ClickCount: { $sum: "$ClickCount" },
                        TrackingCount: { $sum: "$TrackingCount" },
                        TotalRevenue: { $sum: "$TotalRevenue" },
                        TotalCost: { $sum: "$TotalCost" },
                        TotalProfit: { $sum: "$TotalProfit" },
                        TrackingProxy: { $sum: "$TrackingProxy" },
                        TrackingEvents: { $sum: "$TrackingEvent" },
                        h00c: { $sum: "$00.c" },
                        h00i: { $sum: "$00.i" },
                        h00e: { $sum: "$00.e" },
                        h00p: { $sum: "$00.p" },
                        h01c: { $sum: "$01.c" },
                        h01i: { $sum: "$01.i" },
                        h01e: { $sum: "$01.e" },
                        h01p: { $sum: "$01.p" },
                        h02c: { $sum: "$02.c" },
                        h02i: { $sum: "$02.i" },
                        h02e: { $sum: "$02.e" },
                        h02p: { $sum: "$02.p" },
                        h03c: { $sum: "$03.c" },
                        h03i: { $sum: "$03.i" },
                        h03e: { $sum: "$03.e" },
                        h03p: { $sum: "$03.p" },
                        h04c: { $sum: "$04.c" },
                        h04i: { $sum: "$04.i" },
                        h04e: { $sum: "$04.e" },
                        h04p: { $sum: "$04.p" },
                        h05c: { $sum: "$05.c" },
                        h05i: { $sum: "$05.i" },
                        h05e: { $sum: "$05.e" },
                        h05p: { $sum: "$05.p" },
                        h06c: { $sum: "$06.c" },
                        h06i: { $sum: "$06.i" },
                        h06e: { $sum: "$06.e" },
                        h06p: { $sum: "$06.p" },
                        h07c: { $sum: "$07.c" },
                        h07i: { $sum: "$07.i" },
                        h07e: { $sum: "$07.e" },
                        h07p: { $sum: "$07.p" },
                        h08c: { $sum: "$08.c" },
                        h08i: { $sum: "$08.i" },
                        h08e: { $sum: "$08.e" },
                        h08p: { $sum: "$08.p" },
                        h09c: { $sum: "$09.c" },
                        h09i: { $sum: "$09.i" },
                        h09e: { $sum: "$09.e" },
                        h09p: { $sum: "$00.p" },
                        h10c: { $sum: "$10.c" },
                        h10i: { $sum: "$10.i" },
                        h10e: { $sum: "$10.e" },
                        h10p: { $sum: "$10.p" },
                        h11c: { $sum: "$11.c" },
                        h11i: { $sum: "$11.i" },
                        h11e: { $sum: "$11.e" },
                        h11p: { $sum: "$11.p" },
                        h12c: { $sum: "$12.c" },
                        h12i: { $sum: "$12.i" },
                        h12e: { $sum: "$12.e" },
                        h12p: { $sum: "$12.p" },
                        h13c: { $sum: "$13.c" },
                        h13i: { $sum: "$13.i" },
                        h13e: { $sum: "$13.e" },
                        h13p: { $sum: "$13.p" },
                        h14c: { $sum: "$14.c" },
                        h14i: { $sum: "$14.i" },
                        h14e: { $sum: "$14.e" },
                        h14p: { $sum: "$14.p" },
                        h15c: { $sum: "$15.c" },
                        h15i: { $sum: "$15.i" },
                        h15e: { $sum: "$15.e" },
                        h15p: { $sum: "$15.p" },
                        h16c: { $sum: "$16.c" },
                        h16i: { $sum: "$16.i" },
                        h16e: { $sum: "$16.e" },
                        h16p: { $sum: "$16.p" },
                        h17c: { $sum: "$17.c" },
                        h17i: { $sum: "$17.i" },
                        h17e: { $sum: "$17.e" },
                        h17p: { $sum: "$17.p" },
                        h18c: { $sum: "$18.c" },
                        h18i: { $sum: "$18.i" },
                        h18e: { $sum: "$18.e" },
                        h18p: { $sum: "$18.p" },
                        h19c: { $sum: "$19.c" },
                        h19i: { $sum: "$19.i" },
                        h19e: { $sum: "$19.e" },
                        h19p: { $sum: "$19.p" },
                        h20c: { $sum: "$20.c" },
                        h20i: { $sum: "$20.i" },
                        h20e: { $sum: "$20.e" },
                        h20p: { $sum: "$20.p" },
                        h21c: { $sum: "$21.c" },
                        h21i: { $sum: "$21.i" },
                        h21e: { $sum: "$21.e" },
                        h21p: { $sum: "$21.p" },
                        h22c: { $sum: "$22.c" },
                        h22i: { $sum: "$22.i" },
                        h22e: { $sum: "$22.e" },
                        h22p: { $sum: "$22.p" },
                        h23c: { $sum: "$23.c" },
                        h23i: { $sum: "$23.i" },
                        h23e: { $sum: "$23.e" },
                        h23p: { $sum: "$23.p" },
                        h24c: { $sum: "$24.c" },
                        h24i: { $sum: "$24.i" },
                        h24e: { $sum: "$24.e" },
                        h24p: { $sum: "$24.p" }
                    }
                };
                let project = {
                    $project: {
                        _id: 0,
                        Date: "$_id.Date",
                        OfferID: "$_id.OfferID",
                        OfferGUID: 1,
                        AdvertiserID: 1,
                        Advertiser: 1,
                        AccountManagerIDAdv: 1,
                        AccountManagerAdv: 1,
                        CampaignID: 1,
                        CampaignTypeID: 1,
                        Campaign: 1,
                        SupplierID: 1,
                        Supplier: 1,
                        AccountManager: 1,
                        AccountManagerID: 1,
                        Proxy: 1,
                        PostBackURL: { $ifNull: ["$_id.PostBackURLO", "$_id.PostBackURLS"] },
                        CR: { $cond: [ { $eq: [ "$ClickCount", 0 ] }, 0, { $divide: [ { $multiply: ["$TrackingCount", 100] }, "$ClickCount" ] } ] },
                        Cost: 1,
                        Revenue: 1,
                        StatusID: 1,
                        Status: 1,
                        ClickCount: 1,
                        TrackingCount: 1,
                        TotalRevenue: 1,
                        TotalCost: 1,
                        TotalProfit: 1,
                        TrackingProxy: 1,
                        TrackingEvents: 1,
                        //bgColor: 'bg-success',
                        //Mostrar: true,
                        h00: {clicks: "$h00c", install: "$h00i", events: "$h00e", proxy: "$h00p" },
                        h01: {clicks: "$h01c", install: "$h01i", events: "$h01e", proxy: "$h01p" },
                        h02: {clicks: "$h02c", install: "$h02i", events: "$h02e", proxy: "$h02p" },
                        h03: {clicks: "$h03c", install: "$h03i", events: "$h03e", proxy: "$h03p" },
                        h04: {clicks: "$h04c", install: "$h04i", events: "$h04e", proxy: "$h04p" },
                        h05: {clicks: "$h05c", install: "$h05i", events: "$h05e", proxy: "$h05p" },
                        h06: {clicks: "$h06c", install: "$h06i", events: "$h06e", proxy: "$h06p" },
                        h07: {clicks: "$h07c", install: "$h07i", events: "$h07e", proxy: "$h07p" },
                        h08: {clicks: "$h08c", install: "$h08i", events: "$h08e", proxy: "$h08p" },
                        h09: {clicks: "$h09c", install: "$h09i", events: "$h09e", proxy: "$h09p" },
                        h10: {clicks: "$h10c", install: "$h10i", events: "$h10e", proxy: "$h10p" },
                        h11: {clicks: "$h11c", install: "$h11i", events: "$h11e", proxy: "$h11p" },
                        h12: {clicks: "$h12c", install: "$h12i", events: "$h12e", proxy: "$h12p" },
                        h13: {clicks: "$h13c", install: "$h13i", events: "$h13e", proxy: "$h13p" },
                        h14: {clicks: "$h14c", install: "$h14i", events: "$h14e", proxy: "$h14p" },
                        h15: {clicks: "$h15c", install: "$h15i", events: "$h15e", proxy: "$h15p" },
                        h16: {clicks: "$h16c", install: "$h16i", events: "$h16e", proxy: "$h16p" },
                        h17: {clicks: "$h17c", install: "$h17i", events: "$h17e", proxy: "$h17p" },
                        h18: {clicks: "$h18c", install: "$h18i", events: "$h18e", proxy: "$h18p" },
                        h19: {clicks: "$h19c", install: "$h19i", events: "$h19e", proxy: "$h19p" },
                        h20: {clicks: "$h20c", install: "$h20i", events: "$h20e", proxy: "$h20p" },
                        h21: {clicks: "$h21c", install: "$h21i", events: "$h21e", proxy: "$h21p" },
                        h22: {clicks: "$h22c", install: "$h22i", events: "$h22e", proxy: "$h22p" },
                        h23: {clicks: "$h23c", install: "$h23i", events: "$h23e", proxy: "$h23p" },
                        h24: {clicks: "$h24c", install: "$h24i", events: "$h24e", proxy: "$h24p" }
                    }
                };
                

                db.connection().collection(COLLECTION_NAME).aggregate([
                    filterMatch
                    , lookup
                    , { $unwind: "$Offers" }
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
var getReports = function (DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID, withSubPub) {
    //Date(DateFrom.year(), DateFrom.month(), DateFrom.day(), 0,0,0).toISOString()
    try {
        return new Promise(function (resolve, reject) {
            try {
                let filterMatch = `{"$and": [ { "$eq": [ "$OfferID",  "$$id" ] },`;

                if (AdvertiserID != 0) filterMatch = filterMatch + ` { "$eq": ["$Advertiser.AdvertiserID",${AdvertiserID}]} ,`;
                if (SupplierID != 0) filterMatch = filterMatch + ` { "$eq": ["$Supplier.SupplierID",${SupplierID}]} ,`;
                if (CampaignID != 0) filterMatch = filterMatch + ` { "$eq": ["$Campaign.CampaignID",${CampaignID}]} ,`;
                if (OfferID != 0) filterMatch = filterMatch + ` { "$eq": ["$OfferID",${OfferID}]} ,`;
                if (UserID != 0) {
                    filterMatch = filterMatch + `{ "$or": [ { "$eq": [ "$Advertiser.AccountManagerID", ${UserID} ] },`;
                    filterMatch = filterMatch + `{ "$eq": [ "$Supplier.AccountManagerID", ${UserID}  ]} ]}  `;
                }
                filterMatch = filterMatch.substring(0, filterMatch.length - 1);
                filterMatch = filterMatch + ` ] }`;

                // 
                let group;
                let project;
                if (withSubPub) {
                    group = {
                        "$group": {
                            _id: {
                                OfferID: "$OfferID",
                                SubPubID: "$SubPubID",
                                OfferGUID: "$Offers.OfferGUID",
                                AdvertiserID: "$Offers.Advertiser.AdvertiserID",
                                Advertiser: "$Offers.Advertiser.Advertiser",
                                CampaignID: "$Offers.Campaign.CampaignID",
                                Campaign: "$Offers.Campaign.Campaign",
                                SupplierID: "$Offers.Supplier.SupplierID",
                                Supplier: "$Offers.Supplier.Supplier",
                                AccountManager: "$Offers.Supplier.AccountManager",
                                AccountManagerID: "$Offers.Supplier.AccountManagerID",
                                PostBackURLO: "$Offers.PostBackURL",
                                PostBackURLS: "$Offers.Supplier.PostBackURL",
                                Proxy: "$Offers.Proxy",
                                StatusID: "$Offers.StatusID",
                            },
                            totalClick: { $sum: { $multiply: ["$ClickCount"] } },
                            totalInstall: { $sum: { $multiply: ["$TrackingCount"] } },
                            totalRevenue: { $sum: { $multiply: ["$TotalRevenue"] } },
                            totalCost: { $sum: { $multiply: ["$TotalCost"] } },
                            totalProfit: { $sum: { $multiply: ["$TotalProfit"] } },
                            totalProxy: { $sum: { $multiply: ["$TrackingProxy"] } },
                            totalEvent: { $sum: { $multiply: ["$TrackingEvent"] } },
                        }
                    };
                    project = {
                        $project: {
                            _id: 0,
                            OfferID: "$_id.OfferID",
                            OfferGUID: "$_id.OfferGUID",
                            SubPubID: "$_id.SubPubID",
                            AdvertiserID: "$_id.AdvertiserID",
                            Advertiser: "$_id.Advertiser",
                            CampaignID: "$_id.CampaignID",
                            Campaign: "$_id.Campaign",
                            SupplierID: "$_id.SupplierID",
                            Supplier: "$_id.Supplier",
                            AccountManager: "$_id.AccountManager",
                            AccountManagerID: "$_id.AccountManagerID",
                            //AccountManagerPhoto: "$_id.AccountManagerPhoto",
                            Proxy: "$_id.Proxy",
                            PostBackURL: { $ifNull: ["$_id.PostBackURLO", "$_id.PostBackURLS"] },
                            StatusID: "$_id.StatusID",
                            totalClick: 1,
                            totalInstall: 1,
                            totalRevenue: 1,
                            totalCost: 1,
                            totalProfit: 1,
                            totalProxy: 1,
                            totalEvent: 1,
                        }
                    };
                } else {
                    group = {
                        "$group": {
                            _id: {
                                OfferID: "$OfferID",
                                OfferGUID: "$Offers.OfferGUID",
                                AdvertiserID: "$Offers.Advertiser.AdvertiserID",
                                Advertiser: "$Offers.Advertiser.Advertiser",
                                CampaignID: "$Offers.Campaign.CampaignID",
                                Campaign: "$Offers.Campaign.Campaign",
                                SupplierID: "$Offers.Supplier.SupplierID",
                                Supplier: "$Offers.Supplier.Supplier",
                                AccountManager: "$Offers.Supplier.AccountManager",
                                AccountManagerID: "$Offers.Supplier.AccountManagerID",
                                PostBackURLO: "$Offers.PostBackURL",
                                PostBackURLS: "$Offers.Supplier.PostBackURL",
                                Proxy: "$Offers.Proxy",
                                StatusID: "$Offers.StatusID",
                            },
                            totalClick: { $sum: { $multiply: ["$ClickCount"] } },
                            totalInstall: { $sum: { $multiply: ["$TrackingCount"] } },
                            totalRevenue: { $sum: { $multiply: ["$TotalRevenue"] } },
                            totalCost: { $sum: { $multiply: ["$TotalCost"] } },
                            totalProfit: { $sum: { $multiply: ["$TotalProfit"] } },
                            totalProxy: { $sum: { $multiply: ["$TrackingProxy"] } },
                            totalEvent: { $sum: { $multiply: ["$TrackingEvent"] } },
                        }
                    };
                    project = {
                        $project: {
                            _id: 0,
                            OfferID: "$_id.OfferID",
                            OfferGUID: "$_id.OfferGUID",
                            AdvertiserID: "$_id.AdvertiserID",
                            Advertiser: "$_id.Advertiser",
                            CampaignID: "$_id.CampaignID",
                            Campaign: "$_id.Campaign",
                            SupplierID: "$_id.SupplierID",
                            Supplier: "$_id.Supplier",
                            AccountManager: "$_id.AccountManager",
                            AccountManagerID: "$_id.AccountManagerID",
                            Proxy: "$_id.Proxy",
                            PostBackURL: { $ifNull: ["$_id.PostBackURLO", "$_id.PostBackURLS"] },
                            StatusID: "$_id.StatusID",
                            totalClick: 1,
                            totalInstall: 1,
                            totalRevenue: 1,
                            totalCost: 1,
                            totalProfit: 1,
                            totalProxy: 1,
                            totalEvent: 1,
                        }
                    };
                }

                filterMatch = JSON.parse(filterMatch);

                db.connection().collection(COLLECTION_NAME).aggregate([
                    {
                        $match: {
                            Date: { "$gte": new Date(DateFrom), "$lte": new Date(DateTo) }
                        }
                    },
                    {
                        $lookup: {
                            from: "Offers",
                            let: { id: "$OfferID" },
                            pipeline: [
                                {
                                    $match:
                                    {
                                        $expr: filterMatch
                                    }
                                }
                            ],
                            as: "Offers"
                        }
                    },
                    { $unwind: "$Offers" },
                    group,
                    project,

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

var getReportsEventSubPub = function (DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID ) {
    //Date(DateFrom.year(), DateFrom.month(), DateFrom.day(), 0,0,0).toISOString()
    try {
        return new Promise(function (resolve, reject) {
            try {
                let group;
                let project;
                let filterMatch;
                let match;

                match =  {
                    $match: {
                        CreationDate: { "$gte": new Date(DateFrom), "$lte": new Date(DateTo) },
                        "events.install": 1
                    }
                }

                //filterMatch = { $match: { $expr: {$and: [{ "$eq": [ "$OfferID",  "$$id" ] }] } } };
                if (OfferID != 0) {
                    match.$match.OfferID = OfferID;
                } else {
                    if (CampaignID != 0) {
                        //filterMatch.$match.$and.push({ "$eq": ["$Campaign.CampaignID", CampaignID ]});
                        filterMatch = { $match: { $expr: {$and: [{ "$eq": [ "$OfferID",  "$$id" ] }, { "$eq": ["$Campaign.CampaignID", CampaignID ]}] } } };
                    } else {
                        if (AdvertiserID != 0) {
                            filterMatch = { $match: { $expr: {$and: [{ "$eq": [ "$OfferID",  "$$id" ] }, { "$eq": ["$Advertiser.AdvertiserID", AdvertiserID ]}] } } };
                            //filterMatch.$match.$expr.$and.push({ "$eq": ["$Advertiser.AdvertiserID", AdvertiserID ]});
                        } else {
                            filterMatch = { $match: { $expr: {$and: [{ "$eq": [ "$OfferID",  "$$id" ] }] } } };
                        }
                    }
                }
                if (SupplierID != 0) filterMatch.$match.$and.push({ "$eq": ["$Supplier.SupplierID", SupplierID ]});
                if (UserID != 0) filterMatch.$match.$and.push({ "$eq": ["$Supplier.AccountManagerID", UserID ]});

                db.connection().collection("Events").aggregate([
                    {
                        $match: {
                            "CreationDate": { "$gte": new Date(DateFrom), "$lte": new Date(DateTo) },
                            "events.install": 1
                            //"click.AdvertiserID": 1945
                            //"click.OfferID": 2756201
                        }
                    },
                    {
                        $lookup: {
                            from: "Offers",
                            let: { id: "$click.OfferID" },
                            pipeline: [
                                filterMatch
                            ],
                            as: "Offers"
                        }
                    },
                    { $unwind: "$Offers" },
                    {
                        "$group": {
                            _id: {
                                CreationDate: { $dateToString: { format: "%G-%m-%d", date: "$CreationDate" } },
                                SubPubID: "$click.SubPubID"
                            },
                            AdvertiserID: { $first: "$Offers.Advertiser.AdvertiserID" },
                            Advertiser: { $first: "$Offers.Advertiser.Advertiser" },
                            CampaignID: { $first: "$Offers.Campaign.CampaignID" },
                            Campaign: { $first: "$Offers.Campaign.Campaign" },
                            SupplierID: { $first: "$Offers.Supplier.SupplierID" },
                            Supplier: { $first: "$Offers.Supplier.Supplier" },
                            install: { $sum: "$events.install" },
                            events: { $push:  { item: "$events" } }
                            
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            CreationDate: "$_id.CreationDate",
                            SubPubID: "$_id.SubPubID",
                            AdvertiserID: 1,
                            Advertiser: 1,
                            CampaignID: 1,
                            Campaign: 1,
                            SupplierID: 1,
                            Supplier: 1,
                            install: 1,
                            events: 1
                        }
                    }
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
 * Reporte detalle de install por Oferta, doucmento "Events"
 * @param {*} DateFrom 
 * @param {*} DateTo 
 * @param {*} OfferID 
 */
var getReportsTracking = function (DateFrom, DateTo, OfferID) {
    //Date(DateFrom.year(), DateFrom.month(), DateFrom.day(), 0,0,0).toISOString()
    try {
        return new Promise(function (resolve, reject) {
            try {

                db.connection().collection("Events").aggregate([
                    {
                        $match: {
                            "CreationDate": { "$gte": new Date(DateFrom), "$lte": new Date(DateTo) },
                            "click.OfferID": OfferID
                        }
                    },
                    {
                        $project:
                        {
                            _id: 1,
                            "CampaignClickID": "$click._id",
                            "SubPubID": "$click.SubPubID",
                            "ClickID": "$click.ClickID",
                            "Event": { $cond: { if: { $eq: ["$events.install", 1] }, then: "install", else: "$paramsForEvents.event" } },
                            "Events": "$events",
                            "FechaClick": { $dateToString: { format: "%G-%m-%d %H:%M:%S", date: "$click.CreationDate" } },
                            //"$click.CreationDate",
                            "FechaInstall": { $dateToString: { format: "%G-%m-%d %H:%M:%S", date: "$CreationDate" } },
                            //"$CreationDate" },
                            //"DifMin": { $divide: [{ $subtract: ["$CreationDate", "$click.CreationDate"] }, 3600000] },
                            "DifMin": { $trunc: { $divide: [{ $subtract: ["$CreationDate", "$click.CreationDate"] }, 1000 * 60] } },
                            //"TrackingProxy": { 
                            //    $cond: { if: { $gte: ["$paramsForInstall.TrackingProxy", true] }, then: "SI", else: "NO" } 
                            //},
                            "TrackingProxy": { 
                                $cond: { 
                                    if: { 
                                        $gte: ["$paramsForInstall.TrackingProxy", true] }, 
                                        then: "SI", 
                                        else: {
                                            $cond: {
                                                if: {
                                                    $gte: ["$paramsForEvents.TrackingProxyEvent", true]},
                                                    then: "SI",
                                                    else : "NO"
                                                }
                                            }
                                        }
                            },
                            "proxy": "$paramsForInstall.TrackingProxy",
                            "OSfamilyVersion": { $concat: ["$click.OSInfo.OSfamily", " - ", "$click.OSInfo.OSversion"] },
                            "Fraude": {
                                $switch: {
                                     branches: [
                                        {case: { $gte: ["$paramsForEvents.tr_sub1", null] }, then: "$paramsForEvents.tr_sub1"},
                                        {case: { $gte: ["$paramsForInstall.tr_sub1", null] }, then: "$paramsForInstall.tr_sub1"}
                                    ],
                                    default: ""
                                }
                            },
                            "ColorDefecto": "0",
                            "bgColor": "bg-success",
                            "Mostrar": true
                        }
                    }

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
 * Reporte detalle de los eventos documento "Events"
 * @param {*} DateFrom 
 * @param {*} DateTo 
 * @param {*} CampaignID 
 */
var getTracking = function (DateFrom, DateTo, CampaignID) {
    //Date(DateFrom.year(), DateFrom.month(), DateFrom.day(), 0,0,0).toISOString()
    try {
        return new Promise(function (resolve, reject) {
            try {

                db.connection().collection("Events").aggregate([
                    {
                        $match: {
                            "click.CreationDate": { "$gte": new Date(DateFrom), "$lte": new Date(DateTo) },
                            "click.CampaignID": CampaignID
                        }
                    },
                    {
                        $lookup: {
                            from: "Offers",
                            localField: "click.OfferID",
                            foreignField: "OfferID",
                            as: "o"
                        }
                    },
                    { $unwind: '$o' },
                    {
                        $project:
                        {
                            _id: 1,
                            "CampaignClickID": "$click._id",
                            "CampaignClickGUID": "$click._id",
                            "CampaignID": "$click.CampaignID",
                            "Campaign": "$o.Campaign.Campaign",
                            "OfferID": "OfferID",
                            "SubPubID": "$click.SubPubID",
                            "SubPubHash": { $round: ["$click.SubPubHash", 0]},
                            "ClickID": "$click.ClickID",
                            "OSfamily": "$click.OSInfo.OSfamily",
                            "OSfamilyVersion": "$click.OSInfo.OSversion",
                            "CountryCode": "$click.LocationInfo.CountryCode",
                            "CountryName": "$click.LocationInfo.CountryName",
                            "CityName": "$click.LocationInfo.CityName",
                            "RegionName": "$click.LocationInfo.RegionName",
                            "Domain": "$click.LocationInfo.Domain",
                            "ISP": "$click.LocationInfo.ISP",
                            "MobileBrand": "$click.LocationInfo.MobileBrand",
                            "ControlIp": "$click.LocationInfo.ControlIp",
                            "Event": "install",
                            "Events": "$events",
                            "DateClick": { "$dateToString": { "format": "%d-%m-%Y %H:%M:%S", "date": "$click.CreationDate" } },
                            "DateInstall": { "$dateToString": { "format": "%d-%m-%Y %H:%M:%S", "date": "$CreationDate" } },
                            "DifMin": { $round: [ { $divide: [{ $subtract: ["$CreationDate", "$click.CreationDate"] }, 3600000] }, 0 ] },
                            "TrackingProxy": { $cond: { if: { $gte: ["$paramsForInstall.TrackingProxy", true] }, then: "SI", else: "NO" } },
                            "tr_sub1": "$click.ExtraParams.tr_sub1",
                            "tr_sub2": "$click.ExtraParams.tr_sub2",
                            "tr_sub3": "$click.ExtraParams.tr_sub3",
                            "tr_sub4": "$click.ExtraParams.tr_sub4",   
                            "p1": "$click.ExtraParams.p1",
                            "p2": "$click.ExtraParams.p2",
                            "p3": "$click.ExtraParams.p3",
                            "p4": "$click.ExtraParams.p4",                           
                            "proxy": "$paramsForInstall.TrackingProxy",
                            "Supplier": "$o.Supplier.Supplier",
                            "AccountManagerID": "$o.Supplier.AccountManagerID",
                            "AccountManager": "$o.Supplier.AccountManager",
                            "IDFA": "$click.IDFA",
                            "AndroidAdID": "$click.AndroidAdID",
                            "IMEI": "$click.IMEI",
                            //"OSfamilyVersion": { $concat: ["$click.OSInfo.OSfamily", " - ", "$click.OSInfo.OSversion"] },
                            //"Fraude": "$paramsForEvents.tr_sub1",
                            "Fraude": {
                                $switch: {
                                     branches: [
                                        {case: { $gte: ["$paramsForEvents.tr_sub1", null] }, then: "$paramsForEvents.tr_sub1"},
                                        {case: { $gte: ["$paramsForInstall.tr_sub1", null] }, then: "$paramsForInstall.tr_sub1"}
                                    ],
                                    default: ""
                                }
                            }
                        }
                    }

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
var getReportsDetailsDate = function (DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID, withSubPub) {
    //Date(DateFrom.year(), DateFrom.month(), DateFrom.day(), 0,0,0).toISOString()
    try {
        return new Promise(function (resolve, reject) {
            try {
                let filterMatch = {};
                let group;
                let project;

                filterMatch = { $match: { "Date": { "$gte": new Date(DateFrom), "$lte": new Date(DateTo) } } };
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
                if (UserID != 0) filterMatch.$match.AccountManagerID = UserID;

                if (withSubPub) {
                    group = {
                        "$group": {
                            _id: {
                                "Date": "$Date",
                                OfferID: "$OfferID",
                                SubPubID: "$SubPubID"
                            },
                            OfferGUID: { $first: "$OfferGUID" },
                            AdvertiserID: { $first: "$AdvertiserID" },
                            Advertiser: { $first: "$Advertiser" },
                            CampaignID: { $first: "$OCampaignID" },
                            Campaign: { $first: "$Campaign" },
                            Device: { $first: "$Device" },
                            Category: { $first: "$CampaignCategory" },
                            CampaignTypeID: { $first: "$CampaignTypeID" },
                            DailyCap: { $first: "$ODailyQuantity" },
                            Countries: { $first: "$Countrys" },
                            SupplierID: { $first: "$SupplierID" },
                            Supplier: { $first: "$Supplier" },
                            AccountManager: { $first: "$AccountManager" },
                            AccountManagerID: { $first: "$AccountManagerID" },
                            //PostBackURLO: { $first: "$PostBackURL" },
                            //PostBackURLS: { $first: "$PostBackURL" },
                            Proxy: { $first: "$Proxy" },
                            StatusID: { $first: "$StatusID" },
                            totalClick: { $sum: "$ClickCount" },
                            totalInstall: { $sum: "$TrackingCount" },
                            totalRevenue: { $sum: "$TotalRevenue" },
                            totalCost: { $sum: "$TotalCost" },
                            totalProfit: { $sum: "$TotalProfit" },
                            totalProxy: { $sum: "$TrackingProxy" },
                            totalEvent: { $sum: "$TrackingEvent" }
                        }
                    };/*{
                        "$group": {
                            _id: {
                                CreationDate: "$Date",
                                OfferID: "$OfferID",
                                SubPubID: "$SubPubID"
                            },
                            OfferGUID: { $first: "$Offers.OfferGUID" },
                            AdvertiserID: { $first: "$Offers.Advertiser.AdvertiserID" },
                            Advertiser: { $first: "$Offers.Advertiser.Advertiser" },
                            CampaignID: { $first: "$Offers.Campaign.CampaignID" },
                            Campaign: { $first: "$Offers.Campaign.Campaign" },
                            Device: { $first: "$Offers.CampaignHead.Device" },
                            Category: { $first: "$Offers.CampaignHead.CampaignCategory" },
                            CampaignTypeID: { $first: "$Offers.Campaign.CampaignTypeID" },
                            DailyCap: { $first: "$Offers.Campaign.DailyQuantity" },
                            Countries: { $first: "$Offers.Campaign.Countrys" },
                            SupplierID: { $first: "$Offers.Supplier.SupplierID" },
                            Supplier: { $first: "$Offers.Supplier.Supplier" },
                            AccountManager: { $first: "$Offers.Supplier.AccountManager" },
                            AccountManagerID: { $first: "$Offers.Supplier.AccountManagerID" },
                            PostBackURLO: { $first: "$Offers.PostBackURL" },
                            PostBackURLS: { $first: "$Offers.Supplier.PostBackURL" },
                            Proxy: { $first: "$Offers.Proxy" },
                            StatusID: { $first: "$Offers.StatusID" },
                            totalClick: { $sum: "$ClickCount" },
                            totalInstall: { $sum: "$TrackingCount" },
                            totalRevenue: { $sum: "$TotalRevenue" },
                            totalCost: { $sum: "$TotalCost" },
                            totalProfit: { $sum: "$TotalProfit" },
                            totalProxy: { $sum: "$TrackingProxy" },
                            totalEvent: { $sum: "$TrackingEvent" },
                        }
                    };*/
                    project = {
                        $project: {
                            _id: 0,
                            CreationDate: "$_id.CreationDate",
                            OfferID: "$_id.OfferID",
                            OfferGUID: 1,
                            SubPubID: "$_id.SubPubID",
                            AdvertiserID: 1,
                            Advertiser: 1,
                            CampaignID: 1,
                            Campaign: 1,
                            Device: 1,
                            Category: 1,
                            CampaignTypeID: 1,
                            DailyCap: 1,
                            Countrys: 1,
                            SupplierID: 1,
                            Supplier: 1,
                            AccountManager: 1,
                            AccountManagerID: 1,
                            //AccountManagerPhoto: "$_id.AccountManagerPhoto",
                            Proxy: 1,
                            //PostBackURL: { $ifNull: ["$_id.PostBackURLO", "$_id.PostBackURLS"] },
                            StatusID: 1,
                            totalClick: 1,
                            totalInstall: 1,
                            totalRevenue: 1,
                            totalCost: 1,
                            totalProfit: 1,
                            totalProxy: 1,
                            totalEvent: 1,
                        }
                    };
                } else {
                    group = {
                        "$group": {
                            _id: {
                                "Date": "$Date",
                                OfferID: "$OfferID"
                            },
                            OfferGUID: { $first: "$OfferGUID" },
                            AdvertiserID: { $first: "$AdvertiserID" },
                            Advertiser: { $first: "$Advertiser" },
                            CampaignID: { $first: "$OCampaignID" },
                            Campaign: { $first: "$Campaign" },
                            Device: { $first: "$Device" },
                            Category: { $first: "$CampaignCategory" },
                            CampaignTypeID: { $first: "$CampaignTypeID" },
                            DailyCap: { $first: "$ODailyQuantity" },
                            Countries: { $first: "$Countrys" },
                            SupplierID: { $first: "$SupplierID" },
                            Supplier: { $first: "$Supplier" },
                            AccountManager: { $first: "$AccountManager" },
                            AccountManagerID: { $first: "$AccountManagerID" },
                            //PostBackURLO: { $first: "$PostBackURL" },
                            //PostBackURLS: { $first: "$PostBackURL" },
                            Proxy: { $first: "$Proxy" },
                            StatusID: { $first: "$StatusID" },
                            totalClick: { $sum: "$ClickCount" },
                            totalInstall: { $sum: "$TrackingCount" },
                            totalRevenue: { $sum: "$TotalRevenue" },
                            totalCost: { $sum: "$TotalCost" },
                            totalProfit: { $sum: "$TotalProfit" },
                            totalProxy: { $sum: "$TrackingProxy" },
                            totalEvent: { $sum: "$TrackingEvent" }
                        }
                    };
                    project = {
                        $project: {
                            _id: 0,
                            CreationDate: "$_id.CreationDate",
                            OfferID: "$_id.OfferID",
                            OfferGUID: 1,
                            AdvertiserID: 1,
                            Advertiser: 1,
                            CampaignID: 1,
                            Campaign: 1,
                            Device: 1,
                            Category: 1,
                            CampaignTypeID: 1,
                            DailyCap: 1,
                            Countrys: 1,
                            SupplierID: 1,
                            Supplier: 1,
                            AccountManager: 1,
                            AccountManagerID: 1,
                            //AccountManagerPhoto: "$_id.AccountManagerPhoto",
                            Proxy: 1,
                            //PostBackURL: { $ifNull: ["$_id.PostBackURLO", "$_id.PostBackURLS"] },
                            StatusID: 1,
                            totalClick: 1,
                            totalInstall: 1,
                            totalRevenue: 1,
                            totalCost: 1,
                            totalProfit: 1,
                            totalProxy: 1,
                            totalEvent: 1,
                        }
                    };
                }

                db.connection().collection(COLLECTION_NAME).aggregate([
                        filterMatch
                        , group
                        , project
                    ],
                    {
                        allowDiskUse: true
                    },
                        async function (err, data) {
                            let res = await data.toArray();
                            //console.log("Entregando reporte...");
                            resolve(res);
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

var getReportsDetailsDateSubPub = function (DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID, ifP2) {
    //Date(DateFrom.year(), DateFrom.month(), DateFrom.day(), 0,0,0).toISOString()
    try {
        return new Promise(function (resolve, reject) {
            try {
                let filterMatch = {};
                let group;
                let project;

                filterMatch = { $match: { "Date": { "$gte": new Date(DateFrom), "$lte": new Date(DateTo) } } };
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

                project = {
                    $project: {
                        _id: 0,
                        CreationDate: "$Date",
                        SubPubID: 1,
                        SubPubHash: 1,
                        OfferID: 1,
                        OfferGUID: 1,
                        SubPubID: 1,
                        AdvertiserID: 1,
                        Advertiser: 1,
                        CampaignID: 1,
                        Campaign: 1,
                        Device: 1,
                        Category: 1,
                        CampaignTypeID: 1,
                        DailyCap: 1,
                        Countrys: 1,
                        SupplierID: 1,
                        Supplier: 1,
                        AccountManager: 1,
                        AccountManagerID: 1,
                        AccountManagerAdv: 1,
                        AccountManagerIDAdv: 1,
                        //AccountManagerPhoto: "$_id.AccountManagerPhoto",
                        Proxy: 1,
                        //PostBackURL: { $ifNull: ["$_id.PostBackURLO", "$_id.PostBackURLS"] },
                        StatusID: 1,
                        totalClick: { $round: [ "$ClickCount", 0 ] },
                        totalInstall: { $round: [ "$TrackingCount", 0 ] },
                        totalRevenue: { $round: [ "$TotalRevenue", 2 ] },
                        totalCost: { $round: [ "$TotalCost", 2 ] },
                        totalProfit: { $round: [ "$TotalProfit", 2 ] },
                        totalProxy: { $round: [ "$TrackingProxy", 0 ] },
                        totalEvent: { $round: [ "$TrackingEvent", 0 ] }
                    }
                };

                db.connection().collection(COLLECTION_NAME).aggregate([
                        filterMatch
                        , project
                    ],
                    {
                        allowDiskUse: true
                    },
                        async function (err, data) {
                            let res = await data.toArray();
                            //console.log("Entregando reporte...");
                            resolve(res);
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
var getReportBLSourceAdvertisers = function (DateFrom, DateTo, AdvertiserID, UserID, UserName ) {
    //Date(DateFrom.year(), DateFrom.month(), DateFrom.day(), 0,0,0).toISOString()
    try {
        return new Promise(function (resolve, reject) {
            try {
                let lookup;
                let filterMatch = {
                    $match: {
                        Date: { "$gte": new Date(DateFrom), "$lte": new Date(DateTo) },
                        $or: [
                            { CTIT: { $gte: 0} },
                            { High_CR: { $gte: 0} },
                            { Low_CR: { $gte: 0} },
                            { Low_Event_KPI: { $gte: 0} },
                            { MMP_Rejected: { $gte: 0} }
                       ]
                    }
                };
                
                if (AdvertiserID != 0) {
                    filterMatch.$match.AdvertiserID = AdvertiserID;
                }

                // Armo Join para Ofertas por Advertiser o todas las Ofertas
                if (UserID != 0) {
                    lookup = {
                        $lookup: {
                            from: "Offers",
                            let: { id: "$OfferID" },
                            pipeline: [
                                { 
                                    $match: { 
                                        $expr: {
                                            $and: [
                                                { $eq: [ "$OfferID",  "$$id" ]  }, 
                                                { $or: [ { $eq: ["$Advertiser.AccountManagerID", UserID ] }, { $eq: ["$Supplier.AccountManagerID", UserID ] }  ] }
                                            ]
                                        } 
                                    } 
                                }
                            ],
                            as: "Offers"
                        }
                    };
                } else {
                    lookup = {
                        $lookup: {
                            from: "Offers",
                            localField: "OfferID",
                            foreignField: "OfferID",
                            as: "Offers"
                        }
                    };
                }

                let group;
                let project;
            
                group = {
                    "$group": {
                        _id: {
                            AdvertiserID: "$AdvertiserID",
                        },
                        Advertiser: { $first: "$Offers.Advertiser.Advertiser" },
                        AccountManagerIDAdv: { $first: "$Offers.Advertiser.AccountManagerID" },
                        AccountManagerAdv: { $first: "$Offers.Advertiser.AccountManager" },
                        ClickCount: { $sum: "$ClickCount" },
                        TrackingCount: { $sum: "$TrackingCount" },
                        TrackingProxy: { $sum: "$TrackingProxy" },
                        TrackingEvents: { $sum: "$TrackingEvent" },
                        TotalSource: { $sum: "$TotalSource" },
                        /*CTIT: { $sum: "$CTIT" },
                        High_CR: { $sum: "$High_CR" },
                        Low_CR: { $sum: "$Low_CR" },
                        Low_Event_KPI: { $sum: "$Low_Event_KPI" },
                        MMP_Rejected: { $sum: "$MMP_Rejected" },*/
                        CTIT: { $sum: { $cond: { if: { $gt: [ "$CTIT", 0 ] }, then: 1, else: 0 } } },
                        High_CR: { $sum: {  $cond: {if: { $gt: [ "$High_CR", 0 ] }, then: 1, else: 0 } } },
                        Low_CR: { $sum: {  $cond: {if: { $gt: [ "$Low_CR", 0 ] }, then: 1, else: 0 } } },
                        Low_Event_KPI: { $sum: {  $cond: {if: { $gt: [ "$Low_Event_KPI", 0 ] }, then: 1, else: 0 } } },
                        MMP_Rejected: { $sum: {  $cond: {if: { $gt: [ "$MMP_Rejected", 0 ] }, then: 1, else: 0 } } }
                    }
                };
                project = {
                    $project: {
                        _id: 0,
                        AdvertiserID: "$_id.AdvertiserID",
                        Advertiser: 1,
                        AccountManagerIDAdv: 1,
                        AccountManagerAdv: 1,
                        ClickCount: 1,
                        TrackingCount: 1,
                        TrackingProxy: 1,
                        TrackingEvents: 1,
                        //TotalSource: 1,
                        TotalSource: { $sum: ["$CTIT", "$High_CR", "$Low_CR", "$Low_Event_KPI", "$MMP_Rejected"] } ,
                        CTIT: 1,
                        High_CR: 1,
                        Low_CR: 1,
                        Low_Event_KPI: 1,
                        MMP_Rejected: 1,
                        Mostrar: { $cond: { if: true, then: true, else: false }}
                    }
                };

                //filterMatch = JSON.parse(filterMatch);

                db.connection().collection(COLLECTION_NAME).aggregate([
                    filterMatch
                    , lookup
                    , { $unwind: "$Offers" }
                    , group
                    , project
                ],
                    async function (err, data) {
                        let res = await data.toArray();
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

var getReportBLSourceCampaigns = function (DateFrom, DateTo, AdvertiserID, CampaignID, UserID, UserName ) {
    //Date(DateFrom.year(), DateFrom.month(), DateFrom.day(), 0,0,0).toISOString()
    try {
        return new Promise(function (resolve, reject) {
            try {
                let lookup;
                let filterMatch = {
                    $match: {
                        Date: { "$gte": new Date(DateFrom), "$lte": new Date(DateTo) },
                        $or: [
                            { CTIT: { $gte: 0} },
                            { High_CR: { $gte: 0} },
                            { Low_CR: { $gte: 0} },
                            { Low_Event_KPI: { $gte: 0} },
                            { MMP_Rejected: { $gte: 0} }
                       ]
                    }
                };

                if (CampaignID != 0) {
                    filterMatch.$match.CampaignID = CampaignID;
                } else {
                    if (AdvertiserID != 0) {
                        filterMatch.$match.AdvertiserID = AdvertiserID;
                    }
                }

                // Armo Join para Ofertas por Advertiser o todas las Ofertas
                if (UserID != 0) {
                    lookup = {
                        $lookup: {
                            from: "Offers",
                            let: { id: "$OfferID" },
                            pipeline: [
                                { 
                                    $match: { 
                                        $expr: {
                                            $and: [
                                                { $eq: [ "$OfferID",  "$$id" ]  }, 
                                                { $or: [ { $eq: ["$Advertiser.AccountManagerID", UserID ] }, { $eq: ["$Supplier.AccountManagerID", UserID ] }  ] }
                                            ]
                                        } 
                                    } 
                                }
                            ],
                            as: "Offers"
                        }
                    };
                } else {
                    lookup = {
                        $lookup: {
                            from: "Offers",
                            localField: "OfferID",
                            foreignField: "OfferID",
                            as: "Offers"
                        }
                    };
                }

                let group;
                let project;
                
                group = {
                    "$group": {
                        _id: {
                            CampaignID: "$CampaignID",
                        },
                        AdvertiserID: { $first: "$Offers.Advertiser.AdvertiserID" },
                        Advertiser: { $first: "$Offers.Advertiser.Advertiser" },
                        AccountManagerIDAdv: { $first: "$Offers.Advertiser.AccountManagerID" },
                        AccountManagerAdv: { $first: "$Offers.Advertiser.AccountManager" },
                        CampaignID: { $first: "$Offers.Campaign.CampaignID" },
                        Campaign: { $first: "$Offers.Campaign.Campaign" },
                        ClickCount: { $sum: "$ClickCount" },
                        TrackingCount: { $sum: "$TrackingCount" },
                        TrackingProxy: { $sum: "$TrackingProxy" },
                        TrackingEvents: { $sum: "$TrackingEvent" },
                        TotalSource: { $sum: "$TotalSource" },
                        /*CTIT: { $sum: "$CTIT" },
                        High_CR: { $sum: "$High_CR" },
                        Low_CR: { $sum: "$Low_CR" },
                        Low_Event_KPI: { $sum: "$Low_Event_KPI" },
                        MMP_Rejected: { $sum: "$MMP_Rejected" },*/
                        CTIT: { $sum: { $cond: { if: { $gt: [ "$CTIT", 0 ] }, then: 1, else: 0 } } },
                        High_CR: { $sum: {  $cond: {if: { $gt: [ "$High_CR", 0 ] }, then: 1, else: 0 } } },
                        Low_CR: { $sum: {  $cond: {if: { $gt: [ "$Low_CR", 0 ] }, then: 1, else: 0 } } },
                        Low_Event_KPI: { $sum: {  $cond: {if: { $gt: [ "$Low_Event_KPI", 0 ] }, then: 1, else: 0 } } },
                        MMP_Rejected: { $sum: {  $cond: {if: { $gt: [ "$MMP_Rejected", 0 ] }, then: 1, else: 0 } } }
                    }
                };
                project = {
                    $project: {
                        _id: 0,
                        CampaignID: "$_id.CampaignID",
                        AdvertiserID: 1,
                        Advertiser: 1,
                        AccountManagerIDAdv: 1,
                        AccountManagerAdv: 1,
                        Campaign: 1,
                        ClickCount: 1,
                        TrackingCount: 1,
                        TrackingProxy: 1,
                        TrackingEvents: 1,
                        //TotalSource: 1,
                        TotalSource: { $sum: ["$CTIT", "$High_CR", "$Low_CR", "$Low_Event_KPI", "$MMP_Rejected"] } ,
                        CTIT: 1,
                        High_CR: 1,
                        Low_CR: 1,
                        Low_Event_KPI: 1,
                        MMP_Rejected: 1,
                        Mostrar: { $cond: { if: true, then: true, else: false }}
                    }
                };

                db.connection().collection(COLLECTION_NAME).aggregate([
                    filterMatch
                    , lookup
                    , { $unwind: "$Offers" }
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

var getReportBLSourceSupplier = function (DateFrom, DateTo, AdvertiserID, SupplierID, UserID, UserName ) {
    //Date(DateFrom.year(), DateFrom.month(), DateFrom.day(), 0,0,0).toISOString()
    try {
        return new Promise(function (resolve, reject) {
            try {
                let lookup;
                let filterMatch = {
                    $match: {
                        Date: { "$gte": new Date(DateFrom), "$lte": new Date(DateTo) },
                        $or: [
                            { CTIT: { $gte: 0} },
                            { High_CR: { $gte: 0} },
                            { Low_CR: { $gte: 0} },
                            { Low_Event_KPI: { $gte: 0} },
                            { MMP_Rejected: { $gte: 0} }
                       ]
                    }
                };

                if (AdvertiserID != 0)  filterMatch.$match.AdvertiserID = AdvertiserID;
                if (SupplierID != 0) filterMatch.$match.SupplierID = SupplierID;

                // Armo Join para Ofertas por Advertiser o todas las Ofertas
                if (UserID != 0) {
                    lookup = {
                        $lookup: {
                            from: "Offers",
                            let: { id: "$OfferID" },
                            pipeline: [
                                { 
                                    $match: { 
                                        $expr: {
                                            $and: [
                                                { $eq: [ "$OfferID",  "$$id" ]  }, 
                                                { $or: [ { $eq: ["$Advertiser.AccountManagerID", UserID ] }, { $eq: ["$Supplier.AccountManagerID", UserID ] }  ] }
                                            ]
                                        } 
                                    } 
                                }
                            ],
                            as: "Offers"
                        }
                    };
                } else {
                    lookup = {
                        $lookup: {
                            from: "Offers",
                            localField: "OfferID",
                            foreignField: "OfferID",
                            as: "Offers"
                        }
                    };
                }

                let group;
                let project;

                group = {
                    "$group": {
                        _id: {
                            SupplierID: "$SupplierID",
                        },
                        Supplier: { $first: "$Offers.Supplier.Supplier" },
                        AccountManager: { $first: "$Offers.Supplier.AccountManager" },
                        AccountManagerID: { $first: "$Offers.Supplier.AccountManagerID" },
                        ClickCount: { $sum: "$ClickCount" },
                        TrackingCount: { $sum: "$TrackingCount" },
                        TrackingProxy: { $sum: "$TrackingProxy" },
                        TrackingEvents: { $sum: "$TrackingEvent" },
                        TotalSource: { $sum: "$TotalSource" },
                        /*CTIT: { $sum: "$CTIT" },
                        High_CR: { $sum: "$High_CR" },
                        Low_CR: { $sum: "$Low_CR" },
                        Low_Event_KPI: { $sum: "$Low_Event_KPI" },
                        MMP_Rejected: { $sum: "$MMP_Rejected" },*/
                        CTIT: { $sum: { $cond: { if: { $gt: [ "$CTIT", 0 ] }, then: 1, else: 0 } } },
                        High_CR: { $sum: {  $cond: {if: { $gt: [ "$High_CR", 0 ] }, then: 1, else: 0 } } },
                        Low_CR: { $sum: {  $cond: {if: { $gt: [ "$Low_CR", 0 ] }, then: 1, else: 0 } } },
                        Low_Event_KPI: { $sum: {  $cond: {if: { $gt: [ "$Low_Event_KPI", 0 ] }, then: 1, else: 0 } } },
                        MMP_Rejected: { $sum: {  $cond: {if: { $gt: [ "$MMP_Rejected", 0 ] }, then: 1, else: 0 } } }
                    }
                };
                project = {
                    $project: {
                        _id: 0,
                        SupplierID: "$_id.SupplierID",
                        Supplier: 1,
                        AccountManager: 1,
                        AccountManagerID: 1,
                        ClickCount: 1,
                        TrackingCount: 1,
                        TrackingProxy: 1,
                        TrackingEvents: 1,
                        //TotalSource: 1,
                        TotalSource: { $sum: ["$CTIT", "$High_CR", "$Low_CR", "$Low_Event_KPI", "$MMP_Rejected"] } ,
                        CTIT: 1,
                        High_CR: 1,
                        Low_CR: 1,
                        Low_Event_KPI: 1,
                        MMP_Rejected: 1,
                        Mostrar: { $cond: { if: true, then: true, else: false }}
                    }
                };

                db.connection().collection(COLLECTION_NAME).aggregate([
                    filterMatch
                    , lookup
                    , { $unwind: "$Offers" }
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

var getReportBLSourceCampaignsSuppliers = function (DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, UserID, UserName ) {
    //Date(DateFrom.year(), DateFrom.month(), DateFrom.day(), 0,0,0).toISOString()
    try {
        return new Promise(function (resolve, reject) {
            try {
                let lookup;
                let filterMatch = {
                    $match: {
                        Date: { "$gte": new Date(DateFrom), "$lte": new Date(DateTo) },
                        $or: [
                            { CTIT: { $gte: 0} },
                            { High_CR: { $gte: 0} },
                            { Low_CR: { $gte: 0} },
                            { Low_Event_KPI: { $gte: 0} },
                            { MMP_Rejected: { $gte: 0} }
                       ]
                    }
                };
 
                if (CampaignID != 0) {
                    filterMatch.$match.CampaignID = CampaignID;
                } else {
                    if (AdvertiserID != 0) {
                        filterMatch.$match.AdvertiserID = AdvertiserID;
                    }
                }
                if (SupplierID != 0) filterMatch.$match.SupplierID = SupplierID;

                // Armo Join para Ofertas por Advertiser o todas las Ofertas
                if (UserID != 0) {
                    lookup = {
                        $lookup: {
                            from: "Offers",
                            let: { id: "$OfferID" },
                            pipeline: [
                                { 
                                    $match: { 
                                        $expr: {
                                            $and: [
                                                { $eq: [ "$OfferID",  "$$id" ]  }, 
                                                { $or: [ { $eq: ["$Advertiser.AccountManagerID", UserID ] }, { $eq: ["$Supplier.AccountManagerID", UserID ] }  ] }
                                            ]
                                        } 
                                    } 
                                }
                            ],
                            as: "Offers"
                        }
                    };
                } else {
                    lookup = {
                        $lookup: {
                            from: "Offers",
                            localField: "OfferID",
                            foreignField: "OfferID",
                            as: "Offers"
                        }
                    };
                }

                let group;
                let project;
                group = {
                    "$group": {
                        _id: {
                            OfferID: "$OfferID",
                        },
                        Offer: { $first: "$Offers.Campaign.Campaign" },
                        AdvertiserID: { $first: "$Offers.Advertiser.AdvertiserID" },
                        Advertiser: { $first: "$Offers.Advertiser.Advertiser" },
                        AccountManagerIDAdv: { $first: "$Offers.Advertiser.AccountManagerID" },
                        AccountManagerAdv: { $first: "$Offers.Advertiser.AccountManager" },
                        CampaignID: { $first: "$Offers.Campaign.CampaignID" },
                        Campaign: { $first: "$Offers.Campaign.Campaign" },
                        SupplierID: { $first: "$Offers.Supplier.SupplierID" },
                        Supplier: { $first: "$Offers.Supplier.Supplier" },
                        AccountManager: { $first: "$Offers.Supplier.AccountManager" },
                        AccountManagerID: { $first: "$Offers.Supplier.AccountManagerID" },
                        ClickCount: { $sum: "$ClickCount" },
                        TrackingCount: { $sum: "$TrackingCount" },
                        TrackingProxy: { $sum: "$TrackingProxy" },
                        TrackingEvents: { $sum: "$TrackingEvent" },
                        TotalSource: { $sum: "$TotalSource" },
                        /*CTIT: { $sum: "$CTIT" },
                        High_CR: { $sum: "$High_CR" },
                        Low_CR: { $sum: "$Low_CR" },
                        Low_Event_KPI: { $sum: "$Low_Event_KPI" },
                        MMP_Rejected: { $sum: "$MMP_Rejected" }*/
                        CTIT: { $sum: { $cond: { if: { $gt: [ "$CTIT", 0 ] }, then: 1, else: 0 } } },
                        High_CR: { $sum: {  $cond: {if: { $gt: [ "$High_CR", 0 ] }, then: 1, else: 0 } } },
                        Low_CR: { $sum: {  $cond: {if: { $gt: [ "$Low_CR", 0 ] }, then: 1, else: 0 } } },
                        Low_Event_KPI: { $sum: {  $cond: {if: { $gt: [ "$Low_Event_KPI", 0 ] }, then: 1, else: 0 } } },
                        MMP_Rejected: { $sum: {  $cond: {if: { $gt: [ "$MMP_Rejected", 0 ] }, then: 1, else: 0 } } }
                    }
                };
                project = {
                    $project: {
                        _id: 0,
                        OfferID: "$_id.OfferID",
                        Offer: 1,
                        AdvertiserID: 1,
                        Advertiser: 1,
                        AccountManagerIDAdv: 1,
                        AccountManagerAdv: 1,
                        CampaignID: 1,
                        Campaign: 1,
                        SupplierID: 1,
                        Supplier: 1,
                        AccountManager: 1,
                        AccountManagerID: 1,
                        ClickCount: 1,
                        TrackingCount: 1,
                        TrackingProxy: 1,
                        TrackingEvents: 1,
                        //TotalSource: 1,
                        TotalSource: { $sum: ["$CTIT", "$High_CR", "$Low_CR", "$Low_Event_KPI", "$MMP_Rejected"] } ,
                        CTIT: 1,
                        High_CR: 1,
                        Low_CR: 1,
                        Low_Event_KPI: 1,
                        MMP_Rejected: 1,
                        Mostrar: { $cond: { if: true, then: true, else: false } }
                    }
                };

                db.connection().collection(COLLECTION_NAME).aggregate([
                    filterMatch
                    , lookup
                    , { $unwind: "$Offers" }
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

var getReportBLSource = function (DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, UserID, UserName ) {
    //Date(DateFrom.year(), DateFrom.month(), DateFrom.day(), 0,0,0).toISOString()
    try {
        return new Promise(function (resolve, reject) {
            try {
                let lookup;
                let filterMatch = {
                    $match: {
                        Date: { "$gte": new Date(DateFrom), "$lte": new Date(DateTo) },
                        $or: [
                            { CTIT: { $gte: 0} },
                            { High_CR: { $gte: 0} },
                            { Low_CR: { $gte: 0} },
                            { Low_Event_KPI: { $gte: 0} },
                            { MMP_Rejected: { $gte: 0} }
                       ]
                    }
                };
 
                if (CampaignID != 0) {
                    filterMatch.$match.CampaignID = CampaignID;
                } else {
                    if (AdvertiserID != 0) {
                        filterMatch.$match.AdvertiserID = AdvertiserID;
                    }
                }
                if (SupplierID != 0) filterMatch.$match.SupplierID = SupplierID;

                // Armo Join para Ofertas por Advertiser o todas las Ofertas
                if (UserID != 0) {
                    lookup = {
                        $lookup: {
                            from: "Offers",
                            let: { id: "$OfferID" },
                            pipeline: [
                                { 
                                    $match: { 
                                        $expr: {
                                            $and: [
                                                { $eq: [ "$OfferID",  "$$id" ]  }, 
                                                { $or: [ { $eq: ["$Advertiser.AccountManagerID", UserID ] }, { $eq: ["$Supplier.AccountManagerID", UserID ] }  ] }
                                            ]
                                        } 
                                    } 
                                }
                            ],
                            as: "Offers"
                        }
                    };
                } else {
                    lookup = {
                        $lookup: {
                            from: "Offers",
                            localField: "OfferID",
                            foreignField: "OfferID",
                            as: "Offers"
                        }
                    };
                }

                let group;
                let project;
                group = {
                    "$group": {
                        _id: {
                            OfferID: "$OfferID",
                            SubPubID: "$SubPubID"
                        },
                        Offer: { $first: "$Offers.Campaign.Campaign" },
                        AdvertiserID: { $first: "$Offers.Advertiser.AdvertiserID" },
                        Advertiser: { $first: "$Offers.Advertiser.Advertiser" },
                        AccountManagerIDAdv: { $first: "$Offers.Advertiser.AccountManagerID" },
                        AccountManagerAdv: { $first: "$Offers.Advertiser.AccountManager" },
                        CampaignID: { $first: "$Offers.Campaign.CampaignID" },
                        Campaign: { $first: "$Offers.Campaign.Campaign" },
                        SupplierID: { $first: "$Offers.Supplier.SupplierID" },
                        Supplier: { $first: "$Offers.Supplier.Supplier" },
                        AccountManager: { $first: "$Offers.Supplier.AccountManager" },
                        AccountManagerID: { $first: "$Offers.Supplier.AccountManagerID" },
                        ClickCount: { $sum: "$ClickCount" },
                        TrackingCount: { $sum: "$TrackingCount" },
                        TrackingProxy: { $sum: "$TrackingProxy" },
                        TrackingEvents: { $sum: "$TrackingEvent" },
                        TotalSource: { $sum: "$TotalSource" },
                        /*CTIT: { $sum: "$CTIT" },
                        High_CR: { $sum: "$High_CR" },
                        Low_CR: { $sum: "$Low_CR" },
                        Low_Event_KPI: { $sum: "$Low_Event_KPI" },
                        MMP_Rejected: { $sum: "$MMP_Rejected" }*/
                        CTIT: { $sum: { $cond: { if: { $gt: [ "$CTIT", 0 ] }, then: 1, else: 0 } } },
                        High_CR: { $sum: {  $cond: {if: { $gt: [ "$High_CR", 0 ] }, then: 1, else: 0 } } },
                        Low_CR: { $sum: {  $cond: {if: { $gt: [ "$Low_CR", 0 ] }, then: 1, else: 0 } } },
                        Low_Event_KPI: { $sum: {  $cond: {if: { $gt: [ "$Low_Event_KPI", 0 ] }, then: 1, else: 0 } } },
                        MMP_Rejected: { $sum: {  $cond: {if: { $gt: [ "$MMP_Rejected", 0 ] }, then: 1, else: 0 } } }
                    }
                };
                project = {
                    $project: {
                        _id: 0,
                        OfferID: "$_id.OfferID",
                        SubPubID: "$_id.SubPubID",
                        Offer: 1,
                        AdvertiserID: 1,
                        Advertiser: 1,
                        AccountManagerIDAdv: 1,
                        AccountManagerAdv: 1,
                        CampaignID: 1,
                        Campaign: 1,
                        SupplierID: 1,
                        Supplier: 1,
                        AccountManager: 1,
                        AccountManagerID: 1,
                        ClickCount: 1,
                        TrackingCount: 1,
                        TrackingProxy: 1,
                        TrackingEvents: 1,
                        //TotalSource: 1,
                        TotalSource: { $sum: ["$CTIT", "$High_CR", "$Low_CR", "$Low_Event_KPI", "$MMP_Rejected"] } ,
                        CTIT: 1,
                        High_CR: 1,
                        Low_CR: 1,
                        Low_Event_KPI: 1,
                        MMP_Rejected: 1,
                        Mostrar: { $cond: { if: true, then: true, else: false } }
                    }
                };

                db.connection().collection(COLLECTION_NAME).aggregate([
                    filterMatch
                    , lookup
                    , { $unwind: "$Offers" }
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

var getReportsEventsDate = function (DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID, withSubPub) {
    //Date(DateFrom.year(), DateFrom.month(), DateFrom.day(), 0,0,0).toISOString()
    try {
        return new Promise(function (resolve, reject) {
            try {
                let filterMatch = `{"$and": [ { "$eq": [ "$OfferID",  "$$id" ] },`;

                if (AdvertiserID != 0) filterMatch = filterMatch + ` { "$eq": ["$Advertiser.AdvertiserID",${AdvertiserID}]} ,`;
                if (SupplierID != 0) filterMatch = filterMatch + ` { "$eq": ["$Supplier.SupplierID",${SupplierID}]} ,`;
                if (CampaignID != 0) filterMatch = filterMatch + ` { "$eq": ["$Campaign.CampaignID",${CampaignID}]} ,`;
                if (OfferID != 0) filterMatch = filterMatch + ` { "$eq": ["$OfferID",${OfferID}]} ,`;
                if (UserID != 0) {
                    filterMatch = filterMatch + `{ "$or": [ { "$eq": [ "$Advertiser.AccountManagerID", ${UserID} ] },`;
                    filterMatch = filterMatch + `{ "$eq": [ "$Supplier.AccountManagerID", ${UserID}  ]} ]}  `;
                }
                filterMatch = filterMatch.substring(0, filterMatch.length - 1);
                filterMatch = filterMatch + ` ] }`;

                let group = {
                    "$group": {
                        _id: {
                            CreationDate: "$Date",
                            SubPubID: "$SubPubID",
                            AdvertiserID: "$Offers.Advertiser.AdvertiserID",
                            Advertiser: "$Offers.Advertiser.Advertiser",
                            CampaignID: "$Offers.Campaign.CampaignID",
                            Campaign: "$Offers.Campaign.Campaign",
                            SupplierID: "$Offers.Supplier.SupplierID",
                            Supplier: "$Offers.Supplier.Supplier"
                        },
                        totalClick: { $sum: { $multiply: ["$ClickCount"] } },
                        totalInstall: { $sum: { $multiply: ["$TrackingCount"] } },
                        totalRevenue: { $sum: { $multiply: ["$TotalRevenue"] } },
                        totalCost: { $sum: { $multiply: ["$TotalCost"] } },
                        totalProfit: { $sum: { $multiply: ["$TotalProfit"] } },
                        totalProxy: { $sum: { $multiply: ["$TrackingProxy"] } },
                        totalEvent: { $sum: { $multiply: ["$TrackingEvent"] } },
                    }
                };
                let project = {
                    $project: {
                        _id: 0,
                        CreationDate: "$_id.CreationDate",
                        SubPubID: "$_id.SubPubID",
                        AdvertiserID: "$_id.AdvertiserID",
                        Advertiser: "$_id.Advertiser",
                        CampaignID: "$_id.CampaignID",
                        Campaign: "$_id.Campaign",
                        SupplierID: "$_id.SupplierID",
                        Supplier: "$_id.Supplier",
                        totalClick: 1,
                        totalInstall: 1,
                        totalRevenue: 1,
                        totalCost: 1,
                        totalProfit: 1,
                        totalProxy: 1,
                        totalEvent: 1,
                    }
                };

                filterMatch = JSON.parse(filterMatch);

                db.connection().collection(COLLECTION_NAME).aggregate([
                    {
                        $match: {
                            Date: { "$gte": new Date(DateFrom), "$lte": new Date(DateTo) }
                        }
                    },
                    {
                        $lookup: {
                            from: "Offers",
                            let: { id: "$OfferID" },
                            pipeline: [
                                {
                                    $match:
                                    {
                                        $expr: filterMatch
                                    }
                                }
                            ],
                            as: "Offers"
                        }
                    },
                    { $unwind: "$Offers" },
                    group,
                    project,

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

var getReportsCampaignTotals = function (DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID) {
    //Date(DateFrom.year(), DateFrom.month(), DateFrom.day(), 0,0,0).toISOString()
    try {
        return new Promise(function (resolve, reject) {
            try {
                let filterMatch = {};

                filterMatch = { $match: { "Date": { "$gte": new Date(DateFrom), "$lte": new Date(DateTo) } } };
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

                db.connection().collection(COLLECTION_NAME).aggregate([
                        filterMatch
                        ,
                        {
                            "$group": {
                            _id: {
                                    CreationDate: "$Date",
                                    OfferID: "$OfferID"
                                },
                                AdvertiserID: { $first: "$AdvertiserID" },
                                Advertiser: { $first: "$Advertiser" },
                                CampaignID: { $first: "$CampaignID" },
                                Campaign: { $first: "$Campaign" },
                                Device: { $first: "$Device" },
                                Category: { $first: "$Category" },
                                CampaignTypeID: { $first: "$CampaignTypeID" },
                                DailyCap: { $first: "$DailyCap" },
                                Countries: { $first: "$Countries" },
                                Cost: { $first: "$Cost" },
                                Revenue: { $first: "$Revenue" },
                                Proxy: { $first: "$Proxy" },
                                SupplierID: { $first: "$SupplierID" },
                                Supplier: { $first: "$Supplier" },
                                AccountManager: { $first: "$AccountManager" },
                                AccountManagerID: { $first: "$AccountManagerID" },
                                AccountManagerAdv: { $first: "$AccountManagerAdv" },
                                AccountManagerIDAdv: { $first: "$AccountManagerIDAdv" },
                                totalClick: { $sum: "$ClickCount" },
                                totalInstall: { $sum: "$TrackingCount" },
                                totalRevenue: { $sum: "$TotalRevenue" },
                                totalCost: { $sum: "$TotalCost" },
                                totalProfit: { $sum: "$TotalProfit" },
                                totalProxy: { $sum: "$TrackingProxy" },
                                totalEvent: { $sum: "$TrackingEvent" },
                                h00c: { $sum: "$00.c" },
                                h00i: { $sum: "$00.i" },
                                h00e: { $sum: "$00.e" },
                                h00p: { $sum: "$00.p" },
                                h01c: { $sum: "$01.c" },
                                h01i: { $sum: "$01.i" },
                                h01e: { $sum: "$01.e" },
                                h01p: { $sum: "$01.p" },
                                h02c: { $sum: "$02.c" },
                                h02i: { $sum: "$02.i" },
                                h02e: { $sum: "$02.e" },
                                h02p: { $sum: "$02.p" },
                                h03c: { $sum: "$03.c" },
                                h03i: { $sum: "$03.i" },
                                h03e: { $sum: "$03.e" },
                                h03p: { $sum: "$03.p" },
                                h04c: { $sum: "$04.c" },
                                h04i: { $sum: "$04.i" },
                                h04e: { $sum: "$04.e" },
                                h04p: { $sum: "$04.p" },
                                h05c: { $sum: "$05.c" },
                                h05i: { $sum: "$05.i" },
                                h05e: { $sum: "$05.e" },
                                h05p: { $sum: "$05.p" },
                                h06c: { $sum: "$06.c" },
                                h06i: { $sum: "$06.i" },
                                h06e: { $sum: "$06.e" },
                                h06p: { $sum: "$06.p" },
                                h07c: { $sum: "$07.c" },
                                h07i: { $sum: "$07.i" },
                                h07e: { $sum: "$07.e" },
                                h07p: { $sum: "$07.p" },
                                h08c: { $sum: "$08.c" },
                                h08i: { $sum: "$08.i" },
                                h08e: { $sum: "$08.e" },
                                h08p: { $sum: "$08.p" },
                                h09c: { $sum: "$09.c" },
                                h09i: { $sum: "$09.i" },
                                h09e: { $sum: "$09.e" },
                                h09p: { $sum: "$00.p" },
                                h10c: { $sum: "$10.c" },
                                h10i: { $sum: "$10.i" },
                                h10e: { $sum: "$10.e" },
                                h10p: { $sum: "$10.p" },
                                h11c: { $sum: "$11.c" },
                                h11i: { $sum: "$11.i" },
                                h11e: { $sum: "$11.e" },
                                h11p: { $sum: "$11.p" },
                                h12c: { $sum: "$12.c" },
                                h12i: { $sum: "$12.i" },
                                h12e: { $sum: "$12.e" },
                                h12p: { $sum: "$12.p" },
                                h13c: { $sum: "$13.c" },
                                h13i: { $sum: "$13.i" },
                                h13e: { $sum: "$13.e" },
                                h13p: { $sum: "$13.p" },
                                h14c: { $sum: "$14.c" },
                                h14i: { $sum: "$14.i" },
                                h14e: { $sum: "$14.e" },
                                h14p: { $sum: "$14.p" },
                                h15c: { $sum: "$15.c" },
                                h15i: { $sum: "$15.i" },
                                h15e: { $sum: "$15.e" },
                                h15p: { $sum: "$15.p" },
                                h16c: { $sum: "$16.c" },
                                h16i: { $sum: "$16.i" },
                                h16e: { $sum: "$16.e" },
                                h16p: { $sum: "$16.p" },
                                h17c: { $sum: "$17.c" },
                                h17i: { $sum: "$17.i" },
                                h17e: { $sum: "$17.e" },
                                h17p: { $sum: "$17.p" },
                                h18c: { $sum: "$18.c" },
                                h18i: { $sum: "$18.i" },
                                h18e: { $sum: "$18.e" },
                                h18p: { $sum: "$18.p" },
                                h19c: { $sum: "$19.c" },
                                h19i: { $sum: "$19.i" },
                                h19e: { $sum: "$19.e" },
                                h19p: { $sum: "$19.p" },
                                h20c: { $sum: "$20.c" },
                                h20i: { $sum: "$20.i" },
                                h20e: { $sum: "$20.e" },
                                h20p: { $sum: "$20.p" },
                                h21c: { $sum: "$21.c" },
                                h21i: { $sum: "$21.i" },
                                h21e: { $sum: "$21.e" },
                                h21p: { $sum: "$21.p" },
                                h22c: { $sum: "$22.c" },
                                h22i: { $sum: "$22.i" },
                                h22e: { $sum: "$22.e" },
                                h22p: { $sum: "$22.p" },
                                h23c: { $sum: "$23.c" },
                                h23i: { $sum: "$23.i" },
                                h23e: { $sum: "$23.e" },
                                h23p: { $sum: "$23.p" },
                                h24c: { $sum: "$24.c" },
                                h24i: { $sum: "$24.i" },
                                h24e: { $sum: "$24.e" },
                                h24p: { $sum: "$24.p" }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                CreationDate: "$_id.CreationDate",
                                //CreationDate: { "$dateToString": { "format": "%d-%m-%Y", "date": "$_id.CreationDate" } },
                                OfferID: "$_id.OfferID",
                                AdvertiserID: 1,
                                Advertiser: 1,
                                CampaignID: 1,
                                Campaign: 1,
                                Device: 1,
                                Category: 1,
                                CampaignTypeID: 1,
                                DailyCap: 1,
                                Countries: 1,
                                Cost: 1,
                                Revenue: 1,
                                Proxy: 1,
                                SupplierID: 1,
                                Supplier: 1,
                                AccountManager: 1,
                                AccountManagerID: 1,
                                AccountManagerAdv: 1,
                                AccountManagerIDAdv: 1,
                                totalClick: { $round: [ "$totalClick", 0 ] },
                                totalInstall: { $round: [ "$totalInstall", 0 ] },
                                totalRevenue: { $round: [ "$totalRevenue", 2 ] },
                                totalCost: { $round: [ "$totalCost", 2 ] },
                                totalProfit: { $round: [ "$totalProfit", 2 ] },
                                totalProxy: { $round: [ "$totalProxy", 0 ] },
                                totalEvent: { $round: [ "$totalEvent", 0 ] },
                                h00: {clicks: "$h00c", install: "$h00i", events: "$h00e", proxy: "$h00p" },
                                h01: {clicks: "$h01c", install: "$h01i", events: "$h01e", proxy: "$h01p" },
                                h02: {clicks: "$h02c", install: "$h02i", events: "$h02e", proxy: "$h02p" },
                                h03: {clicks: "$h03c", install: "$h03i", events: "$h03e", proxy: "$h03p" },
                                h04: {clicks: "$h04c", install: "$h04i", events: "$h04e", proxy: "$h04p" },
                                h05: {clicks: "$h05c", install: "$h05i", events: "$h05e", proxy: "$h05p" },
                                h06: {clicks: "$h06c", install: "$h06i", events: "$h06e", proxy: "$h06p" },
                                h07: {clicks: "$h07c", install: "$h07i", events: "$h07e", proxy: "$h07p" },
                                h08: {clicks: "$h08c", install: "$h08i", events: "$h08e", proxy: "$h08p" },
                                h09: {clicks: "$h09c", install: "$h09i", events: "$h09e", proxy: "$h09p" },
                                h10: {clicks: "$h10c", install: "$h10i", events: "$h10e", proxy: "$h10p" },
                                h11: {clicks: "$h11c", install: "$h11i", events: "$h11e", proxy: "$h11p" },
                                h12: {clicks: "$h12c", install: "$h12i", events: "$h12e", proxy: "$h12p" },
                                h13: {clicks: "$h13c", install: "$h13i", events: "$h13e", proxy: "$h13p" },
                                h14: {clicks: "$h14c", install: "$h14i", events: "$h14e", proxy: "$h14p" },
                                h15: {clicks: "$h15c", install: "$h15i", events: "$h15e", proxy: "$h15p" },
                                h16: {clicks: "$h16c", install: "$h16i", events: "$h16e", proxy: "$h16p" },
                                h17: {clicks: "$h17c", install: "$h17i", events: "$h17e", proxy: "$h17p" },
                                h18: {clicks: "$h18c", install: "$h18i", events: "$h18e", proxy: "$h18p" },
                                h19: {clicks: "$h19c", install: "$h19i", events: "$h19e", proxy: "$h19p" },
                                h20: {clicks: "$h20c", install: "$h20i", events: "$h20e", proxy: "$h20p" },
                                h21: {clicks: "$h21c", install: "$h21i", events: "$h21e", proxy: "$h21p" },
                                h22: {clicks: "$h22c", install: "$h22i", events: "$h22e", proxy: "$h22p" },
                                h23: {clicks: "$h23c", install: "$h23i", events: "$h23e", proxy: "$h23p" },
                                h24: {clicks: "$h24c", install: "$h24i", events: "$h24e", proxy: "$h24p" }
                            }
                        }
                    ],
                    {
                        allowDiskUse: true
                    },
                        async function (err, data) {
                            let res = await data.toArray();
                            //console.log("Entregando reporte...");
                            resolve(res);
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
    getReports: getReports,
    getReportDashBoard: getReportDashBoard,
    getReportDashBoardDate: getReportDashBoardDate,
    getTracking: getTracking,
    getReportsTracking: getReportsTracking,
    getReportsDetailsDate: getReportsDetailsDate,
    getReportsDetailsDateSubPub: getReportsDetailsDateSubPub,
    getReportsEventSubPub: getReportsEventSubPub,
    getReportsCampaignTotals: getReportsCampaignTotals,
    getReportBLSourceAdvertisers: getReportBLSourceAdvertisers,
    getReportBLSourceCampaigns: getReportBLSourceCampaigns,
    getReportBLSourceSupplier: getReportBLSourceSupplier,
    getReportBLSourceCampaignsSuppliers: getReportBLSourceCampaignsSuppliers,
    getReportBLSource: getReportBLSource
}
