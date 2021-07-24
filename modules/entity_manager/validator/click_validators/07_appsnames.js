/********************
    VALIDO Device Campaign
    - Obtener Un AppsNames si la campaigns lo necesita, ver la relacion con BlackList

    db.getCollection('AppsNames').aggregate(
    [  
        { $sample: { size: 20 } }, 
        { $match: { $or:  [
            {"CountryCode": "US", "Device":"Android", "BlackList.Advertisers.AdvertiserID": 344  }, 
            {"CountryCode": "US", "Device":"Android", "BlackList.Campaigns.CampaignID": 1867  }
        ] } }
        
    ])

    var query = { $or:  [
            {"CountryCode": "US", "Device":"Android", "BlackList.Advertisers.AdvertiserID": 34411  },
            {"CountryCode": "US", "Device":"Android", "BlackList.Campaigns.CampaignID": 52217  }, 
            {"CountryCode": "US", "Device":"Android", "BlackList.Campaigns2": { $in: ["54050"] }  }
        ] }
    var n = db.getCollection('AppsNames').count(query);
    var r = Math.floor(Math.random() * n);       
    db.getCollection('AppsNames').find(query).limit(1).skip(r);


    --SELECT (
    SELECT 
        AN.CountryCode AS [CountryCode], 
        AN.Device AS [Device], 
        AN.AppNameID AS [AppNameID], 
        AN.AppName AS [AppName], 
        AN.AppID AS [AppID],
        BL1.OfferID AS [WhiteList.Offer.OfferID],
        BL2.CampaignID AS [WhiteList.Campaigns.CampaignID],
        BL3.AdvertiserID AS [WhiteList.Advertisers.AdvertiserID]
    FROM AppsNames AN 
        LEFT JOIN BlackList BL1 ON AN.AppNameID = BL1.SubPubID AND	BL1.StatusID = 'A' AND (BL1.ListType = 'AW' OR BL1.ListType = 'AB') AND BL1.OfferID IS NOT NULL AND BL1.CampaignID IS NULL AND BL1.AdvertiserID IS NULL
        LEFT JOIN BlackList BL2 ON AN.AppNameID = BL2.SubPubID AND	BL2.StatusID = 'A' AND (BL2.ListType = 'AW' OR BL2.ListType = 'AB') AND BL2.OfferID IS NULL AND BL2.CampaignID IS NOT NULL AND BL2.AdvertiserID IS NULL
        LEFT JOIN BlackList BL3 ON AN.AppNameID = BL3.SubPubID AND	BL3.StatusID = 'A' AND (BL3.ListType = 'AW' OR BL3.ListType = 'AB') AND BL3.OfferID IS NULL AND BL3.CampaignID IS NULL AND BL3.AdvertiserID IS NOT NULL
    WHERE CountryCode = 'US' AND Device = 'Android' AND Processed = 1
    --GROUP BY CountryCode, Device
    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
    --) AppsNames
*/
const NAME = "AppsNames";
const log = require('../../../log');
var _ = require('lodash');
var entityManager = require('../../../../modules/entity_manager');

var validator = {
    name: NAME,
    doValidate: function (objectToValidate, contextToValidateWith) {
        return new Promise(async function (resolve, reject) {
            try {
                const isAppsNames = _.get(contextToValidateWith, `offer.Campaign.isAppName`, 0);
                var DeviceID = _.get(contextToValidateWith, "offer.Campaign.DeviceID");
                var CountryCode = _.get(objectToValidate, "AdditionalIPInfo.CountryCode", '');
                var tr_sub3 = _.get(objectToValidate, "tr_sub3","");
                var tr_sub4 = _.get(objectToValidate, "tr_sub4","");
                if (DeviceID=='AND') DeviceID = 'Android';
                if (DeviceID=='IOS') DeviceID = 'iOS';

                // Obtengo WhiteList 
                var AppsNames = {};
                var AppsNamesWL = _.get(contextToValidateWith, `offer.WhiteList`, []);
                AppsNamesWL = AppsNamesWL.concat(_.get(contextToValidateWith, `offer.Advertiser.WhiteList`, []));
                AppsNamesWL = AppsNamesWL.concat(_.get(contextToValidateWith, `offer.Campaign.WhiteList`, []));
                AppsNamesWL = AppsNamesWL.filter(function (value, index, arr) { return value.CountryCode == CountryCode; });
                // Obtengo BlackList
                var AppsNamesBL = _.get(contextToValidateWith, `offer.BlackList`, []);
                AppsNamesBL = AppsNamesBL.concat(_.get(contextToValidateWith, `offer.Advertiser.BlackList`, []));
                AppsNamesBL = AppsNamesBL.concat(_.get(contextToValidateWith, `offer.Campaign.BlackList`, []));
                AppsNamesBL = AppsNamesBL.filter(function (value, index, arr) { return value.CountryCode == CountryCode; });
                var AppsNamesBL1 = [];
                AppsNamesBL.forEach(value => {
                    AppsNamesBL1.push(value.AppID);
                })
          
                if (isAppsNames == 1) {
                    // Busco Si Existe una WL y filtro por Pais
                    if (AppsNamesWL.length > 0) {
                        AppsNames = AppsNamesWL[Math.floor(Math.random() * AppsNamesWL.length)];
                    } else {
                        var Apps = await entityManager.getAppsNamesCountry( CountryCode, DeviceID, AppsNamesBL1 );
                        if (Apps==undefined) {
                            AppsNames = {};
                            AppsNames.AppID = "";
                            AppsNames.AppName = "";
                        } else {
                            AppsNames = Apps;
                        }
                    }

                    tr_sub3 = AppsNames.AppID;
                    tr_sub4 = encodeURIComponent(AppsNames.AppName);

                    objectToValidate.tr_sub3 = tr_sub3;
                    objectToValidate.tr_sub4 = tr_sub4;
                }

                log(`-- Valido - ${NAME} - AppsNames WhiteList = ${AppsNamesWL.length} - BlackList = ${AppsNamesBL.length} - tr_sub3 = ${tr_sub3} - tr_sub4 = ${tr_sub4}`);
                resolve({
                    name: NAME,
                    rotator: false,
                    rotatorReason: '',
                    AppsNames: AppsNames
                });
            } catch (e) {
                log(`ERROR - Running validation ${NAME} -> ${e}`)
                resolve({
                    name: NAME,
                    rotator: false,
                    rotatorReason: `ERROR - Running validation ${NAME} -> ${e}`
                });
            }
        });
    }
};

module.exports = validator;
