//TODO: Check With Nes
var apiVersionPrefix = "";
const controllers = require('../controllers');
const schema = require('../controllers/schemas/offers_schema');
module.exports = {
  'registerOffers': {
    type: "get",
    url: apiVersionPrefix + '/offers',
    schema: schema.createOffers,
    controller: controllers.offers.registerOffers
  },
  'registerOffersAll': {
    type: "get",
    url: apiVersionPrefix + '/offersall',
    schema: schema.createOffers,
    controller: controllers.offers.registerOffersAll
  },
  'registerOffersAdvertisers': {
    type: "get",
    url: apiVersionPrefix + '/advertiser',
    schema: schema.updateAdvertiser,
    controller: controllers.offers.registerOffersAdvertisers
  },
  'registerOffersCampaignsHead': {
    type: "get",
    url: apiVersionPrefix + '/campaignshead',
    schema: schema.updateCampaignsHead,
    controller: controllers.offers.registerOffersCampaignsHead
  },
  'registerOffersCampaigns': {
    type: "get",
    url: apiVersionPrefix + '/campaign',
    schema: schema.updateCampaigns,
    controller: controllers.offers.registerOffersCampaigns
  },
  'registerOffersSuppliers': {
    type: "get",
    url: apiVersionPrefix + '/supplier',
    schema: schema.updateSuppliers,
    controller: controllers.offers.registerOffersSuppliers
  },
  'registerAppsNamesWhiteListOffer': {
    type: "get",
    url: apiVersionPrefix + '/offers_whitelist',
    schema: schema.updateWhiteList,
    controller: controllers.appsnames.registerAppsNamesWhiteListOffer
  },
  'registerAppsNamesWhiteListAdvertiser':{
    type: "get",
    url: apiVersionPrefix + '/advertiser_whitelist',
    schema: schema.updateAdvertiser,
    controller: controllers.appsnames.registerAppsNamesWhiteListAdvertiser
  },
  'registerAppsNamesWhiteListCampaign':{
    type: "get",
    url: apiVersionPrefix + '/campaign_whitelist',
    schema: schema.updateCampaigns,
    controller: controllers.appsnames.registerAppsNamesWhiteListCampaign
  },
  'registerAppsNamesBlackListOffer':{
    type: "get",
    url: apiVersionPrefix + '/offers_blacklist',
    schema: schema.updateBlackList,
    controller: controllers.appsnames.registerAppsNamesBlackListOffer
  },
  'registerAppsNamesBlackListAdvertiser':{
    type: "get",
    url: apiVersionPrefix + '/advertiser_blacklist',
    schema: schema.updateAdvertiser,
    controller: controllers.appsnames.registerAppsNamesBlackListAdvertiser
  },
  'registerAppsNamesBlackListCampaign':{
    type: "get",
    url: apiVersionPrefix + '/campaign_blacklist',
    schema: schema.updateCampaigns,
    controller: controllers.appsnames.registerAppsNamesBlackListCampaign
  },
  'registerAdvertiserPrePay': {
    type: "get",
    url: apiVersionPrefix + '/advertiser_prepay',
    schema: schema.updateAdvertiserPrePay,
    controller: controllers.offers.registerAdvertiserPrePay
  }
}