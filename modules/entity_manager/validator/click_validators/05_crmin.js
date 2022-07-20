/********************
    VALIDO CRMin
    - Obtengo cantidad de clicks por SubPubID - ClickCountSubPub
    - Obtengo cantidad de install por SubPubID -InstallCount
    - IF ( @InstallCount = 0 ) 
    -   IF (@ClickCountSubPub > @CRMin)
    - ELSE
    -   SELECT @CRMin = @CRMin * (@InstallCount+1)
			IF ( @ClickCountSubPub  > @CRMin ) 
    - Derivo Click al rotador
    - Debo inserta cantidad de click en el BlackList --> 'Low CR'  ***
*/
const NAME = "CRMin";
const log = require('../../../log');
let validClick = require('../../utils')
let moment = require("moment");
var entityManager = require('../..');
var _ = require('lodash');
const c = require('../../../constants');

var validator = {
    name:NAME,
    doValidate: function (objectToValidate, contextToValidateWith){
        return new Promise(async function(resolve, reject){
            try {
                const simpleDateYMD = moment().format('YYYYMMDD');
                const AdvertiserID = _.get(contextToValidateWith, "offer.Advertiser.AdvertiserID");
                const CampaignID = _.get(contextToValidateWith, "offer.Campaign.CampaignID");
                const SupplierID = _.get(contextToValidateWith, "offer.Supplier.SupplierID"); 
                const AccountManagerID = _.get(contextToValidateWith, "offer.Supplier.AccountManagerID"); 
                const OfferID = _.get(contextToValidateWith, "offer.OfferID");
                const SubPubID = _.get(objectToValidate, "subpubid");
                const SubPubHash = _.get(objectToValidate, "subpubhash");
                const p2hash = _.get(objectToValidate, "p2hash");
                const p2 = _.get(objectToValidate, "p2");
                const ClickCountSubPub = _.get(contextToValidateWith,`offer.Totals.Offers[${OfferID}].SubPub[${SubPubHash}].clicks[${simpleDateYMD}].T`,0);
                const InstallCount  = _.get(contextToValidateWith,`offer.Totals.Offers[${OfferID}].SubPub[${SubPubHash}].installs[${simpleDateYMD}].T`,0);
                const offer = _.get(contextToValidateWith, "offer");
                let CRMin = _.get(contextToValidateWith, "offer.CampaignHead.CRMin");
                let CR = _.get(contextToValidateWith, "offer.CampaignHead.CR");
                const debug_validation = _.get(objectToValidate, "debug_validation", false);
                let lOK = true;

                // Valido si existe para el Advertiser, Campaign u Offers alguna blacklist
                //var countBlackList = await entityManager.getBlacklist(ListType, AdvertiserID.toString(), CampaignID.toString(), OfferID.toString()) 
                if( CRMin > 0 ) {
                    if ( InstallCount == 0 ) {
                        if (ClickCountSubPub  > CRMin ) lOK = false;    
                        else lOK = true;
                    } else {
                        CRMin = CRMin * (InstallCount+1);
                        if (ClickCountSubPub  > CRMin ) lOK = false;    
                        else lOK = true;
                    }             
                } else lOK = true;

                lOK = await validClick.validClickCount(contextToValidateWith, lOK);
                if (lOK) {
                    if (debug_validation) log(`-- Valido 05-${NAME}: CR MIN InstallCount = ${InstallCount} - ClickCountSubPub = ${ClickCountSubPub} - CRMin ${CRMin}`)
                    resolve({ 
                        name: NAME,
                        rotator: false,
                        rotatorReason: ''
                    }); 
                } else {
                    if (debug_validation) log(`** ERROR - ${NAME} - CR MIN InstallCount = ${InstallCount} - ClickCountSubPub = ${ClickCountSubPub} - CRMin ${CRMin}`);

                    const blacklist = { SubPubID: SubPubID, 
                        OfferID: OfferID, 
                        AdvertiserID: AdvertiserID, 
                        CampaignID: CampaignID, 
                        SupplierID: SupplierID, 
                        AccountManagerID: AccountManagerID, 
                        ListType: 'BL', 
                        blackListReason: 'Low CR', 
                        Status: true,
                        offer: offer,
                        SubPubHash: SubPubHash,
                        p2hash: p2hash,
                        SubPubID: SubPubID,
                        p2: p2
                     };
                    entityManager.emitEvent(c.EVENTS_KEY_NAMES.NEW_BLACKLIST_REGISTERED, blacklist);

                    reject({ 
                        name: NAME,
                        rotator: true,
                        rotatorReason: `${NAME} - CR MIN InstallCount = ${InstallCount} - ClickCountSubPub = ${ClickCountSubPub} - CRMin ${CRMin}`
                    }); 
                }
            } catch (e) {
                if (debug_validation) log(`ERROR - Running validation ${NAME} -> ${e}`)
                resolve({
                    name: NAME,
                    rotator: false,
                    rotatorReason: `ERROR - Running validation ${NAME} -> ${e}`
                });
            }

        });
    }
};

module.exports=validator;
