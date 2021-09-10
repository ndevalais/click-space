var db = require('../db/index');
var _ = require('lodash');
let moment = require("moment");
var log = require("../log");
var entityTotalSubPub = require('./campaign_total_subpub');
const COLLECTION_NAME = "Offers";

const structure = {
    "id": undefined, //2654903,
    "OfferID": undefined, //2654903,
    "OfferGUID": undefined, //"54FDA59C-0EEA-E911-B5E9-2818786C1717",
    "Offer": undefined, //"[PDP] Albo - iOS - MX - CPR - 1 Jump",
    "StatusID": undefined, //"A",
    "Status": undefined, //"Active",
    "Proxy": undefined, //0,
    "Cost": undefined, //2.4500,
    "CreationDate": undefined, //"2019-10-08T21:00:10.797",
    "CampaignHead": {
        "CampaignHeadID": undefined, //53729,
        "CampaignHead": undefined, //"Albo - iOS - MX",
        "Device": undefined, //"IOS",
        "CampaignCategory": undefined, //"Productivity",
        "DeviceVersionDesc": undefined, //"All",
        "DailyQuantity": undefined, //0,
        "DailyAmount": undefined, //0.0000,
        "SumDailyQuantity": undefined, //500,
        "CR": undefined, //3,
        "CRMin": undefined, //100000,
        "TimeInstall": undefined, //0,
        "TimeInstallMin": undefined, //0,
        "PackageName": undefined, //"1038240859",
        "DeviceVersion": undefined, //"0",
        "VPNCheck": undefined, //1,
        "LanguageCheck": undefined, //1,
        "PrepayTerms": undefined, //0.0000,
        "Prepay": undefined, //false,
        "Icon72": undefined, //"https:\/\/is2-ssl.mzstatic.com\/image\/thumb\/Purple123\/v4\/8a\/68\/59\/8a685973-ee4a-9987-6d72-5e57cfcab69c\/source\/100x100bb.jpg"
    },
    "Campaign": {
        "CampaignID": undefined, //55504,
        "Campaign": undefined, //"[PDP] Albo - iOS - MX - CPR - 1 Jump",
        "CampaignTypeID": undefined, //"CPI",
        "URL": undefined, //"https:\/\/rocketlab.g2afse.com\/click?pid=7&offer_id=6&sub5={CampaignClickGUID}&sub1={SubPubID}&sub4={tr_sub2}",
        "StatusID": undefined, //"A",
        "Status": undefined, //"Active",
        "DeviceID": undefined, //"IOS",
        "DeviceVersion": undefined, //0,
        "Countrys": undefined, //"MX",
        "BudgetAmount": undefined, //0.0000,
        "BudgetQuantity": undefined, //0,
        "DailyAmount": undefined, //0.0000,
        "DailyQuantity": undefined, //100,
        "Leads": undefined,
        "EventsGoal": undefined,
        "LeadsGoal": undefined,
        "Strictly": undefined,
        "Revenue": undefined, //0.0100,
        "Cost": undefined, //2.4500,
        "Proxy": undefined, //0,
        "CarrierTypeID": undefined,
        "CarriersTypes": undefined, //"ALL-WIFI-SI",
        "CitiesTypes": undefined, //"",
        "DeviceIdentifier": undefined,
        "Languages": undefined, //"ES,EN",
        "AvailableIPs": undefined, //1,
        "Featured": undefined, //0,
        "ForeignCampaignID": undefined,
        "isAppName": undefined, //0,
        "isFraude": undefined, //1,
        "DailyQuantityClick": undefined, //100000,
        "StatusTest": undefined, //0,
        "DetailsTest": undefined, //"",
        "CountTest": undefined, //1,
        "RedirText": undefined, //2
    },
    "Advertiser": {
        "AdvertiserID": undefined, //1931,
        "Advertiser": undefined, //"Rocketlab",
        "BlockSubsource": undefined, //false,
        "SubPub1": undefined, //false,
        "SubPub2": undefined, //false,
        "SubPub3": undefined, //false,
        "Separetor": undefined, //" ",
        "AccountManagerID": undefined, //"Sofia",
        "AccountManager": undefined, //"Sofia",
        "AccountManagerPhoto": undefined, //"sofia.jpg",
        "AccountManagerEMail": undefined, //"sofia.jpg",
        "ApiKey": undefined, //"b7abb2a29cc744a9abf2f5d2882f6c688b7a958126d546c187d3a487e18864ad",
        "PrepayTerms": undefined, //4968.0400,
        "Prepay": undefined, //true
    },
    "Supplier": {
        "SupplierID": undefined, //332,
        "Supplier": undefined, //"Mobilda",
        "PostBackURL": undefined, //"http:\/\/px.mobilda.com\/srv\/px.php?px=1925&t=0&pt=1&adv_id=3459&subid={ClickID}&transcur=USD",
        "PostBackSendEvents": undefined, //false,
        "StatusID": undefined, //"A",
        "AdvertiserID": undefined, //806,
        "AccountManagerID": undefined, //7,
        "AccountManager": undefined, //"Florencia Schenone",
        "AccountManagerPhoto": undefined, //"sofia.jpg",
        "AccountManagerEMail": undefined, //"sofia.jpg",
        "ApiKey": undefined, //"08665b1a63e6422f93b3a1a5a6bd0ec8e53c28294eaf466e9498318e5a21bd8b",
        "Click2": undefined, //0,
        "GroupID": undefined, //9
    }
};

function createOfferStruct(params) {
    let offerStructure = _.clone(structure);
    offerStructure.id = parseInt(_.get(params, 'id.value')); // parseInt(_.get(params, 'OfferID.value',0))
    offerStructure.OfferID = parseInt(_.get(params, 'OfferID.value'));
    offerStructure.OfferGUID = _.get(params, 'OfferGUID.value');
    offerStructure.Offer = _.get(params, 'Offer.value');
    offerStructure.StatusID = _.get(params, 'StatusID.value');
    offerStructure.Status = _.get(params, 'Status.value');
    offerStructure.PostBackURL = _.get(params, 'PostBackURL.value');
    offerStructure.Proxy = _.get(params, 'Proxy.value');
    offerStructure.Cost = parseFloat(_.get(params, 'Cost.value'));
    offerStructure.CreationDate = _.get(params, 'CreationDate.value');

    offerStructure.CampaignHead.CampaignHeadID = parseInt(_.get(params, 'CampaignHead_CampaignHeadID.value'));
    offerStructure.CampaignHead.CampaignHead = _.get(params, 'CampaignHead_CampaignHead.value');
    offerStructure.CampaignHead.Device = _.get(params, 'CampaignHead_Device.value');
    offerStructure.CampaignHead.CampaignCategory = _.get(params, 'CampaignHead_CampaignCategory.value');
    offerStructure.CampaignHead.DeviceVersionDesc = _.get(params, 'CampaignHead_DeviceVersionDesc.value');
    offerStructure.CampaignHead.DailyQuantity = parseInt(_.get(params, 'CampaignHead_DailyQuantity.value', 0));
    offerStructure.CampaignHead.DailyAmount = parseFloat(_.get(params, 'CampaignHead_DailyAmount.value', 0));
    offerStructure.CampaignHead.SumDailyAmount = parseFloat(_.get(params, 'CampaignHead_SumDailyAmount.value', 0));
    offerStructure.CampaignHead.SumDailyQuantity = parseInt(_.get(params, 'CampaignHead_SumDailyQuantity.value', 0));
    offerStructure.CampaignHead.CR = parseInt(_.get(params, 'CampaignHead_CR.value', 0));
    offerStructure.CampaignHead.CRMin = parseInt(_.get(params, 'CampaignHead_CRMin.value', 0));
    offerStructure.CampaignHead.TimeInstall = parseInt(_.get(params, 'CampaignHead_TimeInstall.value', 0));
    offerStructure.CampaignHead.TimeInstallMin = parseInt(_.get(params, 'CampaignHead_TimeInstallMin.value', 0));
    offerStructure.CampaignHead.PackageName = _.get(params, 'CampaignHead_PackageName.value');
    offerStructure.CampaignHead.DeviceVersion = _.get(params, 'CampaignHead_DeviceVersion.value');
    offerStructure.CampaignHead.VPNCheck = parseInt(_.get(params, 'CampaignHead_VPNCheck.value', 0));
    offerStructure.CampaignHead.LanguageCheck = parseInt(_.get(params, 'CampaignHead_LanguageCheck.value', 0));
    offerStructure.CampaignHead.PrepayTerms = parseFloat(_.get(params, 'CampaignHead_PrepayTerms.value', 0));
    offerStructure.CampaignHead.Prepay = _.get(params, 'CampaignHead_Prepay.value', false);
    offerStructure.CampaignHead.Icon72 = _.get(params, 'CampaignHead_Icon72.value');

    offerStructure.Campaign.CampaignID = parseInt(_.get(params, 'Campaign_CampaignID.value', 0));
    offerStructure.Campaign.Campaign = _.get(params, 'Campaign_Campaign.value');
    offerStructure.Campaign.CampaignTypeID = _.get(params, 'Campaign_CampaignTypeID.value');
    offerStructure.Campaign.URL = _.get(params, 'Campaign_URL.value');
    offerStructure.Campaign.StatusID = _.get(params, 'Campaign_StatusID.value');
    offerStructure.Campaign.DeviceID = _.get(params, 'Campaign_DeviceID.value');
    offerStructure.Campaign.DeviceVersion = parseInt(_.get(params, 'Campaign_DeviceVersion.value', 0));
    offerStructure.Campaign.Countrys = _.get(params, 'Campaign_Countrys.value');
    offerStructure.Campaign.BudgetAmount = parseFloat(_.get(params, 'Campaign_BudgetAmount.value', 0));
    offerStructure.Campaign.BudgetQuantity = parseInt(_.get(params, 'Campaign_BudgetQuantity.value', 0));
    offerStructure.Campaign.DailyAmount = parseFloat(_.get(params, 'Campaign_DailyAmount.value', 0));
    offerStructure.Campaign.DailyQuantity = parseInt(_.get(params, 'Campaign_DailyQuantity.value', 0));
    offerStructure.Campaign.Leads = _.get(params, 'Campaign_Leads.value');
    offerStructure.Campaign.EventsGoal = _.get(params, 'Campaign_EventsGoal.value');
    offerStructure.Campaign.LeadsGoal = _.get(params, 'Campaign_LeadsGoal.value');
    offerStructure.Campaign.Strictly = _.get(params, 'Campaign_Strictly.value');
    offerStructure.Campaign.Revenue = parseFloat(_.get(params, 'Campaign_Revenue.value', 0));
    offerStructure.Campaign.Cost = parseFloat(_.get(params, 'Campaign_Cost.value', 0));
    offerStructure.Campaign.Proxy = parseFloat(_.get(params, 'Campaign_Proxy.value', 0));
    offerStructure.Campaign.CarrierTypeID = _.get(params, 'Campaign_CarrierTypeID.value');
    offerStructure.Campaign.CarriersTypes = _.get(params, 'Campaign_CarriersTypes.value');
    offerStructure.Campaign.CitiesTypes = _.get(params, 'Campaign_CitiesTypes.value');
    offerStructure.Campaign.DeviceIdentifier = parseInt(_.get(params, 'Campaign_DeviceIdentifier.value', 0));
    offerStructure.Campaign.Languages = _.get(params, 'Campaign_Languages.value');
    offerStructure.Campaign.AvailableIPs = parseInt(_.get(params, 'Campaign_AvailableIPs.value', 0));
    offerStructure.Campaign.Featured = parseInt(_.get(params, 'Campaign_Featured.value', 0));
    offerStructure.Campaign.ForeignCampaignID = _.get(params, 'Campaign_ForeignCampaignID.value');
    offerStructure.Campaign.isAppName = parseInt(_.get(params, 'Campaign_isAppName.value', 0));
    offerStructure.Campaign.isFraude = parseInt(_.get(params, 'Campaign_isFraude.value', 0));
    offerStructure.Campaign.DailyQuantityClick = parseInt(_.get(params, 'Campaign_DailyQuantityClick.value', 0));
    offerStructure.Campaign.StatusTest = parseInt(_.get(params, 'Campaign_StatusTest.value', 0));
    offerStructure.Campaign.DetailsTest = _.get(params, 'Campaign_DetailsTest.value');
    offerStructure.Campaign.CountTest = parseInt(_.get(params, 'Campaign_CountTest.value', 0));
    offerStructure.Campaign.RedirText = parseInt(_.get(params, 'Campaign_RedirText.value', 0));

    offerStructure.Advertiser.AdvertiserID = parseInt(_.get(params, 'Advertiser_AdvertiserID.value', 0));
    offerStructure.Advertiser.Advertiser = _.get(params, 'Advertiser_Advertiser.value');
    offerStructure.Advertiser.Parameters = _.get(params, 'Advertiser_Parameters.value');
    offerStructure.Advertiser.BlockSubsource = _.get(params, 'Advertiser_BlockSubsource.value');
    offerStructure.Advertiser.SubPub1 = _.get(params, 'Advertiser_SubPub1.value', false);
    offerStructure.Advertiser.SubPub2 = _.get(params, 'Advertiser_SubPub2.value', false);
    offerStructure.Advertiser.SubPub3 = _.get(params, 'Advertiser_SubPub3.value', false);
    offerStructure.Advertiser.Separetor = _.get(params, 'Advertiser_Separetor.value');
    offerStructure.Advertiser.AccountManager = _.get(params, 'Advertiser_AccountManager.value');
    offerStructure.Advertiser.AccountManagerPhoto = _.get(params, 'Advertiser_AccountManagerPhoto.value');
    offerStructure.Advertiser.AccountManagerPhoto = _.get(params, 'Advertiser_AccountManagerEmail.value');

    offerStructure.Advertiser.ApiKey = _.get(params, 'Advertiser_ApiKey.value');
    offerStructure.Advertiser.PrepayTerms = parseFloat(_.get(params, 'Advertiser_PrepayTerms.value', 0));
    offerStructure.Advertiser.Prepay = _.get(params, 'Advertiser_Prepay.value');

    offerStructure.Supplier.SupplierID = parseInt(_.get(params, 'Supplier_SupplierID.value', 0));
    offerStructure.Supplier.Supplier = _.get(params, 'Supplier_Supplier.value');
    offerStructure.Supplier.PostBackURL = _.get(params, 'Supplier_PostBackURL.value');
    offerStructure.Supplier.PostBackSendEvents = _.get(params, 'Supplier_PostBackSendEvents.value');
    offerStructure.Supplier.InstallAlternativeName = _.get(params, 'Supplier_InstallAlternativeName.value');
    offerStructure.Supplier.StatusID = _.get(params, 'Supplier_StatusID.value');
    offerStructure.Supplier.AdvertiserID = parseInt(_.get(params, 'Supplier_AdvertiserID.value', 0));
    offerStructure.Supplier.AccountManagerID = parseInt(_.get(params, 'Supplier_AccountManagerID.value', 0));
    offerStructure.Supplier.AccountManager = _.get(params, 'Supplier_AccountManager.value');
    offerStructure.Supplier.AccountManagerPhoto = _.get(params, 'Supplier_AccountManagerPhoto.value');
    offerStructure.Supplier.AccountManagerPhoto = _.get(params, 'Supplier_AccountManagerEmailvalue');
    offerStructure.Supplier.ApiKey = _.get(params, 'Supplier_ApiKey.value');
    offerStructure.Supplier.Click2 = parseInt(_.get(params, 'Supplier_Click2.value', 0));
    offerStructure.Supplier.GroupID = parseInt(_.get(params, 'Supplier_GroupID.value', 0));

    //Ads validators result to document
    // offerStructure.ValidatorsResult=validatorsResult;
    //TODO: Fill data
    return offerStructure;
}

var saveOffer = async function (OfferID, offer) {
    if (OfferID) {
        //trasforms passed click as defined at structure        
        offer.CreationDate = new Date();
        //offer.ExpireAt = getExpirationDate();
        return db.connection().collection(COLLECTION_NAME).findOneAndUpdate({ "OfferID": OfferID }, { $set: offer }, { upsert: true });
        //return db.connection().collection(COLLECTION_NAME).insertOne(click);    
    } else {
        throw Error('OfferIDCanNotBeUndefined');
    }
}

var saveOfferCampaignHead = async function (CampaignHeadID, campaignHead) {
    if (CampaignHeadID) {
        return db.connection().collection(COLLECTION_NAME).updateMany({ "CampaignHead.CampaignHeadID": CampaignHeadID }, { $set: campaignHead });
    } else {
        throw Error('CampaignHeadIDCanNotBeUndefined');
    }
}

var saveOfferCampaign = async function (CampaignID, campaign) {
    if (CampaignID) {
        return db.connection().collection(COLLECTION_NAME).updateMany({ "Campaign.CampaignID": CampaignID }, { $set: campaign });
    } else {
        throw Error('CampaignIDCanNotBeUndefined');
    }
}

var saveOfferAdvertiser = async function (AdvertiserID, advertiser) {
    try {
        if (AdvertiserID) {
            return db.connection().collection(COLLECTION_NAME).updateMany(
                { "Advertiser.AdvertiserID": AdvertiserID }, 
                { $set: advertiser },
                {multi: true}
            );
        } else {
            throw Error('AdvertiserIDCanNotBeUndefined');
        }
    } catch (error) {
        log('Error ' + error + ' rows');
        reject({ status: 'offer_does_not_exist', error: error });
    }
}

var saveAdvertiserPrePay = async function (param, Revenue) {
    //const Revenue = parseFloat(_.get(param, "context.click.Revenue", 0));
    const PrePay = _.get(param, "context.offer.Advertiser.Prepay", false);
    let PrepayTerms = parseFloat(_.get(param, "context.offer.Advertiser.PrepayTerms", 0));
    const Budget = _.get(param, "context.offer.CampaignHead.Prepay", false);
    let BudgetTerms = parseFloat(_.get(param, "context.offer.CampaignHead.PrepayTerms", 0));
    const CampaignHeadID = _.get(param, "context.offer.CampaignHead.CampaignHeadID");
    const AdvertiserID = _.get(param, "context.offer.Advertiser.AdvertiserID");
    let StatusID = 'A';

    if (PrePay) {
        if ((PrepayTerms - Revenue) <= 0) StatusID = 'I';

        if (AdvertiserID) {
            PrepayTerms = PrepayTerms - Revenue;
            db.connection().collection(COLLECTION_NAME).updateMany(
                { "Advertiser.AdvertiserID": AdvertiserID },
                { $set: { "Advertiser.PrepayTerms": PrepayTerms, "Campaign.StatusID": StatusID } }
            );
        } else {
            throw Error('AdvertiserIDCanNotBeUndefined');
        }
    }
    if (Budget) {
        if ((BudgetTerms - Revenue) <= 0) StatusID = 'I';
        if (CampaignHeadID) {
            BudgetTerms = BudgetTerms - Revenue;
            db.connection().collection(COLLECTION_NAME).updateMany(
                { "CampaignHead.CampaignHeadID": CampaignHeadID },
                { $set: { "CampaignHead.PrepayTerms": BudgetTerms, "Campaign.StatusID": StatusID } }
            );
        } else {
            throw Error('CampaignHeadCanNotBeUndefined');
        }
    }
    return true;
}

var saveOfferSupplier = async function (SupplierID, supplier) {
    if (SupplierID) {
        return db.connection().collection(COLLECTION_NAME).updateMany({ "Supplier.SupplierID": SupplierID }, { $set: supplier });
    } else {
        throw Error('SupplierIDCanNotBeUndefined');
    }
}

var saveCampaignStatus = async function (CampaignID, StatusID, Status) {
    return db.connection().collection(COLLECTION_NAME).updateMany(
        { "Campaign.CampaignID": CampaignID },
        { $set: { "Campaign.StatusID": StatusID, "Campaign.Status": Status  } }
    );

}

var getByUUID = function (uuid, SubPubID, IPLong, event ) {

    return new Promise(async function (resolve, reject) {
        try {
            const simpleDateYMD = '' + moment().format('YYYYMMDD');

            // Obtengo Oferta
            let Offer = await db.connection().collection(COLLECTION_NAME).find(
                { 'OfferGUID': uuid }
            ).toArray();                     

            const CampaignHeadID = _.get(Offer[0], "CampaignHead.CampaignHeadID");

            if (!CampaignHeadID) {
                reject("no offer");
                return;
            }

            /*
                Obtengo OfferGUID y SUBPUBID por fecha --> 
                "Offers.${OfferID}.SubPub.${SubPubID}.clicks.${simpleDateYMD}.T": 1,  
                le agrego BlackList = true o false 
            */
            const OfferGUIDSubPubID = await entityTotalSubPub.getTotalsubPub(uuid, SubPubID, simpleDateYMD);

            const OfferID = Offer[0].OfferID;
            const CampaignID = Offer[0].Campaign.CampaignID;

            let project = JSON.parse(`{"$project":{ 
                "clicks.${simpleDateYMD}.T": 1,
                "clicks.${simpleDateYMD}.TotalRevenue": 1,
                "installs.${simpleDateYMD}.T": 1,
                "installs.${simpleDateYMD}.TotalRevenue": 1,
                "events.${simpleDateYMD}.T": 1,
                "events.${simpleDateYMD}.TotalRevenue": 1,
                "Offers.${OfferID}.IPs.${IPLong}.T": 1,
                "Offers.${OfferID}.clicks.${simpleDateYMD}.T": 1,
                "Offers.${OfferID}.installs.${simpleDateYMD}.T": 1,
                "Offers.${OfferID}.installs.${simpleDateYMD}.TrackingProxy": 1,
                "Offers.${OfferID}.events.${event}.${simpleDateYMD}.TrackingProxy": 1,
                "Offers.${OfferID}.events.${event}.${simpleDateYMD}.T": 1,
                "Offers.${OfferID}.SubPub.${SubPubID}.installs.${simpleDateYMD}.T": 1,
                "Campaigns.${CampaignID}.clicks.${simpleDateYMD}.T": 1,
                "Campaigns.${CampaignID}.clicks.${simpleDateYMD}.TotalRevenue": 1,
                "Campaigns.${CampaignID}.installs.${simpleDateYMD}.T": 1,
                "Campaigns.${CampaignID}.installs.${simpleDateYMD}.TotalRevenue": 1,
                "Campaigns.${CampaignID}.events.${simpleDateYMD}.T": 1,
                "Campaigns.${CampaignID}.events.${simpleDateYMD}.TotalRevenue": 1,
                "Campaigns.${CampaignID}.SubPub.${SubPubID}.events.T": 1,
                "Campaigns.${CampaignID}.SubPub.${SubPubID}.installs.${simpleDateYMD}.T": 1
            }}`);
            /**
             * TOTALES POR EVENTOS QUE NO LOS NECESITO POR AHORA RECUPERAR ****
            "Campaigns.${CampaignID}.events.${simpleDateYMD}.TrackingProxy": 1,
            "Campaigns.${CampaignID}.events.${event}.${simpleDateYMD}.T": 1,
            "Campaigns.${CampaignID}.events.${event}.${simpleDateYMD}.TotalRevenue": 1,
            "Campaigns.${CampaignID}.events.${event}.${simpleDateYMD}.TrackingProxy": 1,
            */

            let total = await db.connection().collection('CampaignClicksTotal').aggregate([
                { $match: { 'CampaignHeadID': CampaignHeadID, "Date": simpleDateYMD } },
                project
            ], async function (err, data) {

                //Warning, this could for reasons bring more that one doc.
                //TODO: Esto está mal
                let res = _.get((await data.toArray()), "[0]");
                return res;
            });

            let retorno = Offer[0];
            if (total==undefined) total = {}
            if (total.Offers === undefined) total.Offers = {} 
            if (total.Offers[OfferID] === undefined) total.Offers[OfferID] = {} 
            if (total.Offers[OfferID].SubPub===undefined) total.Offers[OfferID].SubPub = {} 
            if (total.Offers[OfferID].SubPub[SubPubID] === undefined) total.Offers[OfferID].SubPub[SubPubID] ={};
            total.Offers[OfferID].SubPub[SubPubID].clicks = {};
            total.Offers[OfferID].SubPub[SubPubID].clicks[simpleDateYMD] = {T: OfferGUIDSubPubID};
            retorno.Totals = total; //{ ...total, ...key} //Object.assign({}, total, key); 
            resolve(retorno);

        } catch (error) {
            console.log("error: no hay pferta para:", uuid)
            console.log(error)
            log(`report: ${error}`);
            reject(
                {
                    status: 'OfferGUID Find'
                }
            );
        }
    });
}

var getRotator = function (SupplierID, DeviceID) {
    var arrSuppliersID = [54, 55, 125, 191, 192, 193];
    var pos = arrSuppliersID.indexOf(SupplierID);
    if (pos >= 0) var del = arrSuppliersID.splice(pos, 1)
    return new Promise(function (resolve, reject) {
        db.connection().collection(COLLECTION_NAME).aggregate([
            {
                $match: {
                    "Supplier.SupplierID": { $in: arrSuppliersID },
                    "StatusID": "A",
                    "Campaign.StatusID": "A",
                    "Campaign.DeviceID": { $in: ['IOS', 'BTH', 'NON'] }
                }
            },
            { $sort: { CreationDate: -1 } },
            { $limit: 1 }
        ], function (err, data) {
            let doc;
            //Warning, this could for reasons bring more that one doc.
            data.forEach(function (result) {
                doc = result;
            }).then(function () {
                resolve(doc);
            });
        });
    });
}

var getOffersCampaign = async function (CampaignID) {
    if (CampaignID) {
        //return db.connection().collection(COLLECTION_NAME).find({ "Campaign.CampaignID": CampaignID }); 
        return new Promise(function (resolve, reject) {
            db.connection().collection(COLLECTION_NAME).aggregate([
                { $match: { "Campaign.CampaignID": CampaignID } }

            ], function (err, data) {
                let doc = [];
                //Warning, this could for reasons bring more that one doc.
                data.forEach(function (result) {
                    doc.push(result);
                }).then(function () {
                    resolve(doc);
                });

            });
        });
    } else {
        throw Error('CampaignIDCanNotBeUndefined');
    }
}

var getOffersIDAdvertiser = async function (AdvertiserID) {
    if (AdvertiserID) {
        //return db.connection().collection(COLLECTION_NAME).find({ "Campaign.CampaignID": CampaignID }); 
        return new Promise(function (resolve, reject) {
            db.connection().collection(COLLECTION_NAME).aggregate([
                { $match: { "Advertiser.AdvertiserID": AdvertiserID } }

            ], function (err, data) {
                let doc = [];
                //Warning, this could for reasons bring more that one doc.
                data.forEach(function (result) {
                    doc.push(result.OfferID);
                }).then(function () {
                    resolve(doc);
                });

            });
        });
    } else {
        throw Error('AdvertiserIDCanNotBeUndefined');
    }
}

var getOffersCampaignID = async function (CampaignID) {
    if (CampaignID) {
        //return db.connection().collection(COLLECTION_NAME).find({ "Campaign.CampaignID": CampaignID }); 
        return new Promise(function (resolve, reject) {
            db.connection().collection(COLLECTION_NAME).aggregate([
                { $match: { "Campaign.CampaignID": CampaignID } }

            ], function (err, data) {
                let doc = [];
                //Warning, this could for reasons bring more that one doc.
                data.forEach(function (result) {
                    doc.push(result.OfferID);
                }).then(function () {
                    resolve(doc);
                });

            });
        });
    } else {
        throw Error('CampaignIDCanNotBeUndefined');
    }
}

var getCampaignsAdvertiserID = async function (AdvertiserID) {
    if (AdvertiserID) {
        //return db.connection().collection(COLLECTION_NAME).find({ "Campaign.CampaignID": CampaignID }); 
        return new Promise(function (resolve, reject) {
            db.connection().collection(COLLECTION_NAME).aggregate([
                { $match: { "Advertiser.AdvertiserID": AdvertiserID } }

            ], function (err, data) {
                let doc = [];
                //Warning, this could for reasons bring more that one doc.
                data.forEach(function (result) {
                    doc.push(result.Campaign.CampaignID);
                }).then(function () {
                    resolve(doc);
                });

            });
        });
    } else {
        throw Error('AdvertiserID Can Not Be Undefined');
    }
}

var getOffersPublishers = async function (SupplierID, DateFrom, DateTo) {
    if (SupplierID) {
        //return db.connection().collection(COLLECTION_NAME).find({ "Campaign.CampaignID": CampaignID }); 
        return new Promise(function (resolve, reject) {
            let filterMatch = {
                $match: {
                    CreationDate: { "$gte": new Date(DateFrom), "$lte": new Date(DateTo) },
                }
            };

            db.connection().collection(COLLECTION_NAME).aggregate([
                {
                    $match: {
                        CreationDate: { "$gte": new Date("2020-06-20"), "$lte": new Date("2020-06-30") },
                        "Supplier.SupplierID": 1985,
                        //"StatusID": 'A'
                    }
                },
                {
                    $lookup: {
                        from: "CampaignTotals",
                        localField: "OfferID",
                        foreignField: "OfferID",
                        as: "Totals"
                    }
                },
                { 
                    $unwind: '$Totals' 
                },
                {
                    $group: {
                        _id: {
                            OfferID: "$OfferID",
                            CreationDate: "$CreationDate",
                        },
                        //CreationDate: { $first: "$CreationDate" },
                        Advertiser: { $first: "$Advertiser.Advertiser" },
                        AdvertiserID: { $first: "$Advertiser.AdvertiserID" },
                        Campaign: { $first: "$Campaign.Campaign" },
                        CampaignID: { $first: "$Campaign.CampaignID" },
                        Supplier: { $first: "$Supplier.Supplier" },
                        SupplierID: { $first: "$Supplier.SupplierID" },
                        Offer: { $first: "$Offer" },
                        OfferGUID: { $first: "$OfferGUID" },
                        PackageName: { $first: "$CampaignHead.PackageName" },
                        Icon72: { $first: "$CampaignHead.Icon72" },
                        CampaignTypeID: { $first: "$Campaign.CampaignTypeID" },
                        Countrys: { $first: "$Campaign.Countrys" },
                        DeviceID: { $first: "$Campaign.DeviceID" },
                        URL: { $first: "$Campaign.URL" },
                        //StatusAffiliTest,
                        //DetailsAffiliTest,
                        //CountAffiliTest,
                        //RedirAffiliText,
                        Comments: { $first: "$Campaign.Comments" }, 
                        Category: { $first: "$CampaignHead.CampaignCategory" },
                        PostBackURLO: { $first: "$PostBackURL" },
                        PostBackURLS: { $first: "$Supplier.PostBackURL" },
                        // MarcketURL NO EXITE
                        AccountManagerID: { $first: "$Supplier.AccountManagerID" },
                        AccountManager: { $first: "$Supplier.AccountManager" },
                        EMail: { $first: "$Supplier.AccountManagerEmail" },
                        Status: { $first: "$Status" },
                        StatusID: { $first: "$StatusID" },
                        Incent: { $first: "$Campaign.Incent" }, 
                        Revenue: { $first: "$Campaign.Revenue" }, 
                        Cost: { $first: "$Cost" }, 
                        Proxy: { $first: "$Proxy" }, 
                        eventsName1: { $first: "$Campaign.eventsName1" }, 
                        eventPayOut1: { $first: "$Campaign.eventPayOut1" }, 
                        eventCost1: { $first: "$Campaign.eventCost1" }, 
                        eventProxy1: { $first: "$Campaign.eventProxy1" }, 
                        eventsName2: { $first: "$Campaign.eventsName2" }, 
                        eventPayOut2: { $first: "$Campaign.eventPayOut2" }, 
                        eventCost2: { $first: "$Campaign.eventCost2" }, 
                        eventProxy2: { $first: "$Campaign.eventProxy2" }, 
                        eventsName3: { $first: "$Campaign.eventsName3" }, 
                        eventPayOut3: { $first: "$Campaign.eventPayOut3" }, 
                        eventCost3: { $first: "$Campaign.eventCost3" }, 
                        eventProxy3: { $first: "$Campaign.eventProxy3" }, 
                        totalClick: { $sum: "$Totals.totalClick" }, 
                        totalInstall: { $sum: "$Totals.totalInstall" }, 
                        totalRevenue: { $sum: "$Totals.totalRevenue" }, 
                        totalCost: { $sum: "$Totals.totalCost" }, 
                        totalProfit: { $sum: "$Totals.totalProfit" }, 
                        totalProxy: { $sum: "$Totals.totalProxy" }, 
                        totalEvent: { $sum: "$Totals.totalEvent" }, 
                        
                    }
                },
                {
                    $project: {
                        _id: 0,
                        OfferID: "$_id.OfferID",
                        CreationDate: "$_id.CreationDate",
                        Advertiser: 1,
                        AdvertiserID: 1,
                        Campaign: 1,
                        CampaignID: 1,
                        Supplier: 1,
                        SupplierID: 1,
                        Offer: 1,
                        OfferGUID: 1,
                        PackageName: 1,
                        Icon72: 1,
                        CampaignTypeID: 1,
                        Countrys: 1,
                        DeviceID: 1,
                        URL: 1,
                        Comments: 1,
                        Category: 1,
                        PostBackURL: { $ifNull: ["$PostBackURLO", "$PostBackURLS"] },
                        URL_Click: { $concat: [ "http://click.laikad.com/click?OfferGUID=", "$OfferGUID", "'&subpubid={YOUR_PUBLISHER_ID}&ClickID={YOUR_CLICK}&Android_AdID={USER_Android_AdID}&tr_sub2={USER_IOS_IDFA}'" ] },
                        AccountManagerID: 1,
                        AccountManager: 1,
                        EMail: 1,
                        Status: 1,
                        StatusID: 1,
                        Incent: 1,
                        Cost: { $cond: { if: { $eq: ["$CampaignTypeID", "CP2"] } , then: "$eventCost1", else: "$Cost" } },
                        Revenue: { $cond: { if: { $eq: ["$CampaignTypeID", "CP2"] } , then: "$eventPayOut1", else: "$Revenue" } },
                        Proxy: { $cond: { if: { $eq: ["$CampaignTypeID", "CP2"] } , then: "$eventProxy1", else: "$Proxy" } },
                        totalClick: 1,
                        totalInstall: 1, 
                        totalRevenue: 1,
                        totalCost: 1,
                        totalProfit: 1, 
                        totalProxy: 1,
                        totalEvent: 1,
                        CR: { $round : [{ $divide: [ { $multiply: [ "$totalInstall", 100 ] }, "$totalClick"] }, 4]}
                    }
                }
            ], function (err, data) {
                let doc = [];
                //Warning, this could for reasons bring more that one doc.
                data.forEach(function (result) {
                    doc.push(result);
                }).then(function () {
                    resolve(doc);
                });

            });
        });
    } else {
        throw Error('getOffersPublishers');
    }
}

/**
    db.getCollection('Offers').find({
        "Supplier.SupplierID": { $in: [54, 55, 125, 191, 192, 193] }, "Supplier.SupplierID": { $nin: [193] },"StatusID": "A", "Campaign.StatusID": "A", "Campaign.DeviceID": { $in: ['xxx', 'BTH', 'NON'] }
    }).limit(1).sort( { CreationDate: -1 } ) 
*/

module.exports = {
    saveOffer: saveOffer,
    saveOfferCampaignHead: saveOfferCampaignHead,
    saveOfferCampaign: saveOfferCampaign,
    saveOfferAdvertiser: saveOfferAdvertiser,
    saveOfferSupplier: saveOfferSupplier,
    saveAdvertiserPrePay: saveAdvertiserPrePay,
    saveCampaignStatus: saveCampaignStatus,
    getByUUID: getByUUID,
    getRotator: getRotator,
    getOffersCampaign: getOffersCampaign,
    createOfferStruct: createOfferStruct,
    getOffersPublishers: getOffersPublishers,
    getOffersIDAdvertiser: getOffersIDAdvertiser,
    getOffersCampaignID: getOffersCampaignID,
    getCampaignsAdvertiserID: getCampaignsAdvertiserID
}