var _ = require("lodash");
var db = require("../db/index");
const COLLECTION_NAME = "CampaignClicksTotal";
var moment = require("moment");
var log = require("../log");
let ClickCounter = require("./counters/ClickCounter");
let CampaignTotalGroupCounter = require("./counters/CampaignTotalGroupCounter");
let CampaignTotalSubPubCounter = require("./counters/CampaignTotalSubPubCounter");
var utils = require("./utils/index");
var hash = require('object-hash');
let OfferAdvertiser = require('./offer_entity');
let Advertiser = require('./advertiser_entity');

//Example structure
const structure = {
  GUID: "GUID", //Campaña Head
  clicks: {
    T: 14,
    TotalRevenue: 1.2,
    TotalCost: 1.2,
    TotalProfit: 1.2,
    "20190902": 1,
    "20190902": 13,
  },
  installs: {
    T: 14,
    TotalRevenue: 5.0, //u$d -
    TotalCost: 3.0, //u$d    |--- Se calculan en el momento del install
    TotalProfit: 2.0, //u$d  -
    TrackingProxy: 4, //
    TrackingTime: 4, // Cuenta el tiempo desde el click hasta la instalacion
    "20190902": {
      "T:": 2,
      TotalRevenue: 5.0, //u$d -
      TotalCost: 3.0, //u$d    |--- Se calculan en el momento del install
      TotalProfit: 2.0, //u$d  -
      TrackingProxy: 4, //
      TrackingTime: 4, // Cuenta el tiempo desde el click hasta la instalacion
    },
    "20190902": {
      "T:": 2,
      TotalRevenue: 5.0, //u$d -
      TotalCost: 3.0, //u$d    |--- Se calculan en el momento del install
      TotalProfit: 2.0, //u$d  -
      TrackingProxy: 4, //
      TrackingTime: 4, // Cuenta el tiempo desde el click hasta la instalacion
    },
  },
  events: {
    T: 14,
    TotalRevenue: 5.0, //u$d -
    TotalCost: 3.0, //u$d    |--- Se calculan en el momento del install
    TotalProfit: 2.0, //u$d  -
    TrackingProxy: 4, //
    TrackingTime: 4,
    "20190902": {
      TotalRevenue: 5.0, //u$d -
      TotalCost: 3.0, //u$d    |--- Se calculan en el momento del install
      TotalProfit: 2.0, //u$d  -
      TrackingProxy: 4, //
      TrackingTime: 4,
    },
    "20190902": {
      click_next: 1,
      click_previous: 1,
    },
  },
  Campaigns: {
    //Campaign
    "11": {
      clicks: {
        "20190902": 13,
        "20190901": 1,
        T: 14,
      },
      install: {
        TotalRevenue: 5.0, //u$d -                                             *sale del campaign Campaign.revenue
        TotalCost: 3.0, //u$d    |--- Se calculan en el momento del install, *el costo sale de la oferta Offer.cost
        TotalProfit: 2.0, //u$d  -      la oferta tiene el profit              *Es la diferencia entre el cost y el revenue
        TrackingProxy: 4, //
        TrackingTime: 4, // Cuenta el tiempo desde el click hasta la instalacion
        "20190902": {
          TotalRevenue: 5.0, //u$d -
          TotalCost: 3.0, //u$d    |--- Se calculan en el momento del install
          TotalProfit: 2.0, //u$d  -
          TrackingProxy: 4, //
          TrackingTime: 4, // Cuenta el tiempo desde el click hasta la instalacion
        },
      },
      events: {
        click_previous: 12,
        click_next: 9,
        20190908: {
          click_next: 9,
          click_previous: 10,
        },
        201909010: {
          click_previous: 1,
        },
      },
    },
    "12": {
      "20190902": 13,
      "20190901": 1,
      T: 14,
    },
    SubPub: {
      "12": {
        "20190902": 13,
        "20190901": 1,
        T: 1,
      },
      "13": {
        "20190902": 13,
        "20190901": 1,
        T: 1,
      },
    },
  },
  Offers: {
    //Ofertas
    "11": {
      clicks: {
        "20190902": 13,
        "20190901": 1,
        T: 14,
      },
      install: {
        TotalRevenue: 5.0, //u$d -                                             *sale del campaign Campaign.revenue
        TotalCost: 3.0, //u$d    |--- Se calculan en el momento del install, *el costo sale de la oferta Offer.cost
        TotalProfit: 2.0, //u$d  -      la oferta tiene el profit              *Es la diferencia entre el cost y el revenue
        TrackingProxy: 4, //
        TrackingTime: 4, // Cuenta el tiempo desde el click hasta la instalacion
        "20190902": {
          TotalRevenue: 5.0, //u$d -
          TotalCost: 3.0, //u$d    |--- Se calculan en el momento del install
          TotalProfit: 2.0, //u$d  -
          TrackingProxy: 4, //
          TrackingTime: 4, // Cuenta el tiempo desde el click hasta la instalacion
        },
      },
      events: {
        click_previous: 12,
        click_next: 9,
        20190908: {
          click_next: 9,
          click_previous: 10,
        },
        201909010: {
          click_previous: 1,
        },
      },
    },
    "12": {
      "20190902": 13,
      "20190901": 1,
      T: 14,
    },
    SubPub: {
      "12": {
        "20190902": 13,
        "20190901": 1,
        T: 1,
      },
      "13": {
        "20190902": 13,
        "20190901": 1,
        T: 1,
      },
    },
  },
};

function getOffer(offer) {
  const OfferGUID = _.get(offer, "OfferGUID", "");
  const AdvertiserID = parseInt(_.get(offer, "Advertiser.AdvertiserID", 0));
  const Advertiser = _.get(offer, "Advertiser.Advertiser", "");
  const AccountManagerIDAdv = parseInt(
    _.get(offer, "Advertiser.AccountManagerID", 0)
  );
  const AccountManagerAdv = _.get(offer, "Advertiser.AccountManager", "");
  const CampaignID = parseInt(_.get(offer, "Campaign.CampaignID", 0));
  const Campaign = _.get(offer, "Campaign.Campaign", "");
  const SupplierID = parseInt(_.get(offer, "Supplier.SupplierID", 0));
  const Supplier = _.get(offer, "Supplier.Supplier", "");
  const AccountManager = _.get(offer, "Supplier.AccountManager", "");
  const AccountManagerID = parseInt(
    _.get(offer, "Supplier.AccountManagerID", 0)
  );
  const Cost = parseFloat(_.get(offer, "Campaign.Cost", 0));
  const Revenue = parseFloat(_.get(offer, "Campaign.Revenue", 0));
  const StatusID = _.get(offer, "StatusID", "A");
  const Status = _.get(offer, "Status", "");
  const Device = _.get(offer, "Campaign.DeviceID", "");
  const Category = _.get(offer, "CampaignHead.CampaignCategory", "");
  const CampaignTypeID = _.get(offer, "CampaignHead.CampaignTypeID", "");
  const DailyCap = parseInt(_.get(offer, "Campaign.BudgetQuantity", 0));
  const Countries = _.get(offer, "Campaign.Countrys", "");
  let Proxy = parseInt(_.get(offer, "Proxy", 0));
  if (CampaignTypeID == "CP2") {
    Proxy = _.get(offer, "Campaign.eventProxy1", 0);
    if (Proxy == 0) Proxy = _.get(offer, "Campaign.eventProxy2", 0);
    if (Proxy == 0) Proxy = _.get(offer, "Campaign.eventProxy3", 0);
  }

  return {
    OfferGUID: OfferGUID,
    AdvertiserID: AdvertiserID,
    Advertiser: Advertiser,
    AccountManagerIDAdv: AccountManagerIDAdv,
    AccountManagerAdv: AccountManagerAdv,
    CampaignID: CampaignID,
    Campaign: Campaign,
    SupplierID: SupplierID,
    Supplier: Supplier,
    AccountManager: AccountManager,
    AccountManagerID: AccountManagerID,
    Proxy: Proxy,
    Cost: Cost,
    Revenue: Revenue,
    StatusID: StatusID,
    Status: Status,
    Device: Device,
    Category: Category,
    CampaignTypeID: CampaignTypeID,
    DailyCap: DailyCap,
    Countries: Countries,
  };
}
var addOneClick = async function (click, offer) {
  let simpleDateYMD = moment().format("YYYYMMDD");
  let SubPubID = _.get(click, "SubPubID");
  let SubPubHash = _.get(click, "SubPubHash");
  let OfferID = _.get(click, "OfferID");
  let OfferGUID = _.get(click, "OfferGUID");
  let CampaignID = _.get(click, "CampaignID");
  let CampaignHeadID = _.get(click, "CampaignHeadID");
  let CampaignTypeID = _.get(click, "CampaignTypeID");
  let Revenue = _.get(click, "Revenue");
  let Cost = _.get(click, "Cost");
  let Profit = 0;

  if (CampaignTypeID != "CPC") {
    Revenue = 0;
    Cost = 0;
    Profit = 0;
  } else {
    if (Revenue > Cost) Profit = Revenue - Cost;
  }

  ClickCounter.add(CampaignHeadID, `clicks.T`);
  ClickCounter.add(CampaignHeadID, `clicks.${simpleDateYMD}.T`);
  ClickCounter.add(
    CampaignHeadID,
    `Campaigns.${CampaignID}.clicks.${simpleDateYMD}.T`
  );
  ClickCounter.add(
    CampaignHeadID,
    `Offers.${OfferID}.clicks.${simpleDateYMD}.T`
  ); 
  let key = OfferGUID + "|" + SubPubHash;

  // Agrego al contador de CampaignTotalSubPub 
  CampaignTotalSubPubCounter.add(key, "Total");

  addOneTotalGroupClicks(click, offer);
};

var addOneInstall = async function (param, offer) {
  try {
    let simpleDateYMD = moment().format("YYYYMMDD");
    let OfferID = parseInt(_.get(param, "context.click.OfferID"));
    let SubPubHash = _.get(param, "context.click.SubPubHash");
    let CampaignID = parseInt(_.get(param, "context.click.CampaignID"));
    let CampaignHeadID = parseInt(_.get(param, "context.click.CampaignHeadID"));
    let IP2Long = parseInt(_.get(param, "context.click.LocationInfo.IP2Long"));
    let TrackingProxy = _.get(param, "context.params.TrackingProxy", false);
    let TrackingTime = parseInt(_.get(param, "context.params.TrackingTime", 0));
    //const CampaignTypeID = _.get(param,"context.offer.CampaignHead.CampaignTypeID");

    let CampaignTypeID = _.get(param, "context.click.CampaignTypeID");
    let Revenue = _.get(param, "context.click.Revenue", 0);
    let Cost = _.get(param, "context.click.Cost", 0);
    let Profit = 0;
    let CountTrackingProxy = 1;
    let events = "installs";
    let incs = {};

    if (Revenue == null) Revenue = 0;
    Revenue = parseFloat(Revenue);
    if (Cost == null) Cost = 0;
    Cost = parseFloat(Cost);

    // Si no envio callback el costo es 0, no cuento al supplier
    if (!TrackingProxy) {
      CountTrackingProxy = 0;
      Cost = 0;
    }
    if (CampaignTypeID == "CPC") {
      Revenue = 0;
      Cost = 0;
      Profit = 0;
      incs = JSON.parse(`{"$inc":{ 
              "${events}.T":1,
              "${events}.TrackingProxy":${CountTrackingProxy},
              "${events}.${simpleDateYMD}.T":1,
              "${events}.${simpleDateYMD}.TrackingProxy":${CountTrackingProxy},
              "Campaigns.${CampaignID}.${events}.T":1,
              "Campaigns.${CampaignID}.${events}.TrackingProxy":${CountTrackingProxy},
              "Campaigns.${CampaignID}.${events}.${simpleDateYMD}.T":1,
              "Campaigns.${CampaignID}.${events}.${simpleDateYMD}.TrackingProxy":${CountTrackingProxy},
              "Campaigns.${CampaignID}.SubPub.${SubPubHash}.${events}.T":1,
              "Campaigns.${CampaignID}.SubPub.${SubPubHash}.${events}.TrackingProxy":${CountTrackingProxy},
              "Campaigns.${CampaignID}.SubPub.${SubPubHash}.${events}.${simpleDateYMD}.T":1,
              "Campaigns.${CampaignID}.SubPub.${SubPubHash}.${events}.${simpleDateYMD}.TrackingProxy":${CountTrackingProxy},
              "Offers.${OfferID}.${events}.T":1,
              "Offers.${OfferID}.${events}.TrackingProxy":${CountTrackingProxy},
              "Offers.${OfferID}.${events}.${simpleDateYMD}.T":1,
              "Offers.${OfferID}.${events}.${simpleDateYMD}.TrackingProxy":${CountTrackingProxy},
              "Offers.${OfferID}.SubPub.${SubPubHash}.${events}.T":1,
              "Offers.${OfferID}.SubPub.${SubPubHash}.${events}.TrackingProxy":${CountTrackingProxy},
              "Offers.${OfferID}.SubPub.${SubPubHash}.${events}.${simpleDateYMD}.T":1,
              "Offers.${OfferID}.SubPub.${SubPubHash}.${events}.${simpleDateYMD}.TrackingProxy":${CountTrackingProxy},
              "Offers.${OfferID}.IPs.${IP2Long}.T":1
          }}`);
    } else {
      if (Revenue > Cost) Profit = Revenue - Cost;
      incs = JSON.parse(`{"$inc":{ 
              "${events}.T":1,
              "${events}.TotalRevenue":${Revenue},
              "${events}.TotalCost":${Cost},
              "${events}.TotalProfit":${Profit},
              "${events}.TrackingProxy":${CountTrackingProxy},
              "${events}.${simpleDateYMD}.T":1,
              "${events}.${simpleDateYMD}.TotalRevenue":${Revenue},
              "${events}.${simpleDateYMD}.TotalCost":${Cost},
              "${events}.${simpleDateYMD}.TotalProfit":${Profit},
              "${events}.${simpleDateYMD}.TrackingProxy":${CountTrackingProxy},
              "Campaigns.${CampaignID}.${events}.T":1,
              "Campaigns.${CampaignID}.${events}.TotalRevenue":${Revenue},
              "Campaigns.${CampaignID}.${events}.TotalCost":${Cost},
              "Campaigns.${CampaignID}.${events}.TotalProfit":${Profit},
              "Campaigns.${CampaignID}.${events}.TrackingProxy":${CountTrackingProxy},
              "Campaigns.${CampaignID}.${events}.${simpleDateYMD}.T":1,
              "Campaigns.${CampaignID}.${events}.${simpleDateYMD}.TotalRevenue":${Revenue},
              "Campaigns.${CampaignID}.${events}.${simpleDateYMD}.TotalCost":${Cost},
              "Campaigns.${CampaignID}.${events}.${simpleDateYMD}.TotalProfit":${Profit},
              "Campaigns.${CampaignID}.${events}.${simpleDateYMD}.TrackingProxy":${CountTrackingProxy},
              "Campaigns.${CampaignID}.SubPub.${SubPubHash}.${events}.T":1,
              "Campaigns.${CampaignID}.SubPub.${SubPubHash}.${events}.TotalRevenue":${Revenue},
              "Campaigns.${CampaignID}.SubPub.${SubPubHash}.${events}.TotalCost":${Cost},
              "Campaigns.${CampaignID}.SubPub.${SubPubHash}.${events}.TotalProfit":${Profit},
              "Campaigns.${CampaignID}.SubPub.${SubPubHash}.${events}.TrackingProxy":${CountTrackingProxy},
              "Campaigns.${CampaignID}.SubPub.${SubPubHash}.${events}.${simpleDateYMD}.T":1,
              "Campaigns.${CampaignID}.SubPub.${SubPubHash}.${events}.${simpleDateYMD}.TotalRevenue":${Revenue},
              "Campaigns.${CampaignID}.SubPub.${SubPubHash}.${events}.${simpleDateYMD}.TotalCost":${Cost},
              "Campaigns.${CampaignID}.SubPub.${SubPubHash}.${events}.${simpleDateYMD}.TotalProfit":${Profit},
              "Campaigns.${CampaignID}.SubPub.${SubPubHash}.${events}.${simpleDateYMD}.TrackingProxy":${CountTrackingProxy},
              "Offers.${OfferID}.${events}.T":1,
              "Offers.${OfferID}.${events}.TotalRevenue":${Revenue},
              "Offers.${OfferID}.${events}.TotalCost":${Cost},
              "Offers.${OfferID}.${events}.TotalProfit":${Profit},
              "Offers.${OfferID}.${events}.TrackingProxy":${CountTrackingProxy},
              "Offers.${OfferID}.${events}.${simpleDateYMD}.T":1,
              "Offers.${OfferID}.${events}.${simpleDateYMD}.TotalRevenue":${Revenue},
              "Offers.${OfferID}.${events}.${simpleDateYMD}.TotalCost":${Cost},
              "Offers.${OfferID}.${events}.${simpleDateYMD}.TotalProfit":${Profit},
              "Offers.${OfferID}.${events}.${simpleDateYMD}.TrackingProxy":${CountTrackingProxy},
              "Offers.${OfferID}.SubPub.${SubPubHash}.${events}.T":1,
              "Offers.${OfferID}.SubPub.${SubPubHash}.${events}.TotalRevenue":${Revenue},
              "Offers.${OfferID}.SubPub.${SubPubHash}.${events}.TotalCost":${Cost},
              "Offers.${OfferID}.SubPub.${SubPubHash}.${events}.TotalProfit":${Profit},
              "Offers.${OfferID}.SubPub.${SubPubHash}.${events}.TrackingProxy":${CountTrackingProxy},
              "Offers.${OfferID}.SubPub.${SubPubHash}.${events}.${simpleDateYMD}.T":1,
              "Offers.${OfferID}.SubPub.${SubPubHash}.${events}.${simpleDateYMD}.TotalRevenue":${Revenue},
              "Offers.${OfferID}.SubPub.${SubPubHash}.${events}.${simpleDateYMD}.TotalCost":${Cost},
              "Offers.${OfferID}.SubPub.${SubPubHash}.${events}.${simpleDateYMD}.TotalProfit":${Profit},
              "Offers.${OfferID}.SubPub.${SubPubHash}.${events}.${simpleDateYMD}.TrackingProxy":${CountTrackingProxy},
              "Offers.${OfferID}.IPs.${IP2Long}.T":1
          }}`);
    }

    log(`addOneInstall for click.CampaignHeadID:  ${CampaignHeadID}`);
    db.connection().collection(COLLECTION_NAME).updateOne(
      {
        CampaignHeadID: CampaignHeadID,
        Date: simpleDateYMD,
      },
      incs,
      {
        upsert: true,
      }
    );

    addOneTotalGroupInstall(param, offer);

    // Valido si es Prepay 
    if (CampaignTypeID!='CP2') {
      OfferAdvertiser.saveAdvertiserPrePay(param, Revenue);
      Advertiser.updateAdvertiserPrePay(param, Revenue);
    }
  } catch (error) {
    log('Error TOTALES' + error + ' rows');
  }
};

var addOneEvents = async function (params, offer) {
  try {
    const simpleDateYMD = moment().format("YYYYMMDD");
    const CampaignHeadID = _.get(
      params,
      "context.offer.CampaignHead.CampaignHeadID"
    );
    const CampaignID = parseInt(_.get(params, "context.click.CampaignID"));
    //const CampaignTypeID = _.get(params,"context.offer.CampaignHead.CampaignTypeID");
    const OfferID = parseInt(_.get(params, "context.click.OfferID"));
    //const SubPubID = _.get(params, "context.click.SubPubID");
    const SubPubHash = _.get(params, "context.click.SubPubHash");
    let CampaignTypeID = _.get(params, "context.click.CampaignTypeID");
    let event = _.get(params, "context.params.event");
    event = event.toUpperCase();
    let TrackingProxy = _.get(params, "context.params.TrackingProxyEvent", false);
    const existingEventInstall = _.get(
      params,
      `context.install.events[${event}].T`,
      0
    );

    let TrackingCost = await utils.eventCost(
      event,
      TrackingProxy,
      offer,
      existingEventInstall
    );
    let Revenue = TrackingCost.Revenue;
    let Cost = TrackingCost.Cost;
    let Profit = TrackingCost.Profit;
    let CountTrackingProxy = TrackingCost.CountTrackingProxy;
    let incs;

    //let CampaignTypeID = _.get(params, "context.click.CampaignTypeID");
    //let Revenue = parseFloat(_.get(params, "context.click.TrackingCost.Revenue", 0));
    //let Cost = parseFloat(_.get(params, "context.click.TrackingCost.Cost", 0));
    //let Profit = parseFloat(_.get(params, "context.click.TrackingCost.Profit", 0));
    //let CountTrackingProxy = parseFloat(_.get(params, "context.click.TrackingCost.CountTrackingProxy", 0));

    if (Revenue == null) Revenue = 0;
    Revenue = parseFloat(Revenue);
    if (Cost == null) Cost = 0;
    Cost = parseFloat(Cost);
    // Si no envio callback el costo es 0, no cuento al supplier
    if (!TrackingProxy) {
      CountTrackingProxy = 0;
      Cost = 0;
    }
    if (CampaignTypeID == "CP2") {
      //if (Revenue > Cost) Profit = Revenue - Cost;
      incs = JSON.parse(`{"$inc":{ 
              "events.T":1,
              "events.TotalRevenue":${Revenue},
              "events.TotalCost":${Cost},
              "events.TotalProfit":${Profit},
              "events.TrackingProxy":${CountTrackingProxy},
              "events.${simpleDateYMD}.T":1,
              "events.${simpleDateYMD}.TotalRevenue":${Revenue},
              "events.${simpleDateYMD}.TotalCost":${Cost},
              "events.${simpleDateYMD}.TotalProfit":${Profit},
              "events.${simpleDateYMD}.TrackingProxy":${CountTrackingProxy},

              "events.${event}.T":1,
              "events.${event}.TotalRevenue":${Revenue},
              "events.${event}.TotalCost":${Cost},
              "events.${event}.TotalProfit":${Profit},
              "events.${event}.TrackingProxy":${CountTrackingProxy},

              "events.${event}.${simpleDateYMD}.T":1,
              "Campaigns.${CampaignID}.events.T":1,
              "Campaigns.${CampaignID}.events.TotalRevenue":${Revenue},
              "Campaigns.${CampaignID}.events.TotalCost":${Cost},
              "Campaigns.${CampaignID}.events.TotalProfit":${Profit},
              "Campaigns.${CampaignID}.events.TrackingProxy":${CountTrackingProxy},

              "Campaigns.${CampaignID}.events.${simpleDateYMD}.T":1,
              "Campaigns.${CampaignID}.events.${simpleDateYMD}.TotalRevenue":${Revenue},
              "Campaigns.${CampaignID}.events.${simpleDateYMD}.TotalCost":${Cost},
              "Campaigns.${CampaignID}.events.${simpleDateYMD}.TotalProfit":${Profit},
              "Campaigns.${CampaignID}.events.${simpleDateYMD}.TrackingProxy":${CountTrackingProxy},

              "Campaigns.${CampaignID}.events.${event}.T":1,
              "Campaigns.${CampaignID}.events.${event}.${simpleDateYMD}.T":1,
              "Campaigns.${CampaignID}.events.${event}.${simpleDateYMD}.TotalRevenue":${Revenue},
              "Campaigns.${CampaignID}.events.${event}.${simpleDateYMD}.TotalCost":${Cost},
              "Campaigns.${CampaignID}.events.${event}.${simpleDateYMD}.TotalProfit":${Profit},
              "Campaigns.${CampaignID}.events.${event}.${simpleDateYMD}.TrackingProxy":${CountTrackingProxy},

              "Campaigns.${CampaignID}.SubPub.${SubPubHash}.events.T":1,
              "Offers.${OfferID}.events.T":1,    
              "Offers.${OfferID}.events.${simpleDateYMD}.T":1,  
              "Offers.${OfferID}.events.${event}.T":1,
              "Offers.${OfferID}.events.${event}.${simpleDateYMD}.T":1,
              "Offers.${OfferID}.events.${event}.${simpleDateYMD}.TrackingProxy":${CountTrackingProxy},       
              "Offers.${OfferID}.SubPub.${SubPubHash}.events.T":1,
              "Offers.${OfferID}.SubPub.${SubPubHash}.events.${simpleDateYMD}.T":1,
              "Offers.${OfferID}.SubPub.${SubPubHash}.events.${event}.T":1,
              "Offers.${OfferID}.SubPub.${SubPubHash}.events.${event}.${simpleDateYMD}.T":1
          }}`);
    } else {
      incs = JSON.parse(`{"$inc":{ 
              "events.T":1,
              "events.${simpleDateYMD}.T":1,
              "events.${simpleDateYMD}.TotalRevenue":${Revenue},
              "events.${simpleDateYMD}.TotalCost":${Cost},
              "events.${simpleDateYMD}.TotalProfit":${Profit},
              "events.${simpleDateYMD}.TrackingProxy":${CountTrackingProxy},
              "events.${event}.T":1,
              "events.${event}.${simpleDateYMD}.T":1,
              "Campaigns.${CampaignID}.events.T":1,
              "Campaigns.${CampaignID}.events.${simpleDateYMD}.T":1,
              "Campaigns.${CampaignID}.events.${event}.T":1,
              "Campaigns.${CampaignID}.events.${event}.${simpleDateYMD}.T":1,
              "Campaigns.${CampaignID}.SubPub.${SubPubHash}.events.T":1,
              "Offers.${OfferID}.events.T":1,    
              "Offers.${OfferID}.events.${simpleDateYMD}.T":1,  
              "Offers.${OfferID}.events.${event}.T":1,
              "Offers.${OfferID}.events.${event}.${simpleDateYMD}.T":1,
              "Offers.${OfferID}.events.${event}.${simpleDateYMD}.TrackingProxy":${CountTrackingProxy},       
              "Offers.${OfferID}.SubPub.${SubPubHash}.events.T":1,
              "Offers.${OfferID}.SubPub.${SubPubHash}.events.${simpleDateYMD}.T":1,
              "Offers.${OfferID}.SubPub.${SubPubHash}.events.${event}.T":1,
              "Offers.${OfferID}.SubPub.${SubPubHash}.events.${event}.${simpleDateYMD}.T":1
          }}`);
    }

    /*
    "events.T":1,
    "events.TotalRevenue":${Revenue},
    "events.TotalCost":${Cost},
    "events.TotalProfit":${Profit},
    "events.TrackingProxy":${CountTrackingProxy},

    "events.${simpleDateYMD}.T":1,
    "events.${simpleDateYMD}.TotalRevenue":${Revenue},
    "events.${simpleDateYMD}.TotalCost":${Cost},
    "events.${simpleDateYMD}.TotalProfit":${Profit},
    "events.${simpleDateYMD}.TrackingProxy":${CountTrackingProxy},

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

    "Campaigns.${CampaignID}.events.T":1,
    "Campaigns.${CampaignID}.events.TotalRevenue":${Revenue},
    "Campaigns.${CampaignID}.events.TotalCost":${Cost},
    "Campaigns.${CampaignID}.events.TotalProfit":${Profit},
    "Campaigns.${CampaignID}.events.TrackingProxy":${CountTrackingProxy},

    "Campaigns.${CampaignID}.events.${simpleDateYMD}.T":1,
    "Campaigns.${CampaignID}.events.${simpleDateYMD}.TotalRevenue":${Revenue},
    "Campaigns.${CampaignID}.events.${simpleDateYMD}.TotalCost":${Cost},
    "Campaigns.${CampaignID}.events.${simpleDateYMD}.TotalProfit":${Profit},
    "Campaigns.${CampaignID}.events.${simpleDateYMD}.TrackingProxy":${CountTrackingProxy},

    "Campaigns.${CampaignID}.events.${event}.T":1,
    "Campaigns.${CampaignID}.events.${event}.TotalRevenue":${Revenue},
    "Campaigns.${CampaignID}.events.${event}.TotalCost":${Cost},
    "Campaigns.${CampaignID}.events.${event}.TotalProfit":${Profit},
    "Campaigns.${CampaignID}.events.${event}.TrackingProxy":${CountTrackingProxy},

    "Campaigns.${CampaignID}.events.${event}.${simpleDateYMD}.T":1,
    "Campaigns.${CampaignID}.events.${event}.${simpleDateYMD}.TotalRevenue":${Revenue},
    "Campaigns.${CampaignID}.events.${event}.${simpleDateYMD}.TotalCost":${Cost},
    "Campaigns.${CampaignID}.events.${event}.${simpleDateYMD}.TotalProfit":${Profit},
    "Campaigns.${CampaignID}.events.${event}.${simpleDateYMD}.TrackingProxy":${CountTrackingProxy},

    "Campaigns.${CampaignID}.SubPub.${SubPubHash}.events.T":1,
    "Campaigns.${CampaignID}.SubPub.${SubPubHash}.events.${simpleDateYMD}.T":1,
    "Campaigns.${CampaignID}.SubPub.${SubPubHash}.events.${event}.T":1,  
    "Campaigns.${CampaignID}.SubPub.${SubPubHash}.events.${event}.${simpleDateYMD}.T":1,   
    */

    log(`addOneInstall for install.CampaignHeadID:  ${CampaignHeadID}`);
    db.connection().collection(COLLECTION_NAME).updateOne(
      {
        CampaignHeadID: CampaignHeadID,
        Date: simpleDateYMD,
      },
      incs,
      {
        upsert: true,
      }
    );

    addOneTotalGroupEvents(params, offer);

    //Actualizo Prepay del Advertiser
    if (CampaignTypeID=='CP2') {
      OfferAdvertiser.saveAdvertiserPrePay(params, Revenue);
      Advertiser.updateAdvertiserPrePay(params, Revenue);
    }
  } catch (error) {
    log('Error TOTALES' + error + ' rows');
  }
};

function addOneTotalGroupClicks(click, offer) {
  const OfferID = _.get(click, "OfferID");
  const simpleDateYMDT = moment().format("YYYY-MM-DDT00:00:00Z");
  const DateYMDT = new Date(simpleDateYMDT);
  const SubPubID = _.get(click, "SubPubID");
  const SubPubHash = _.get(click, "SubPubHash");
  const hora = moment().format("HH");
  const p2 = _.get(click, "ExtraParams.p2", "");
  const p2hash = _.get(click, "p2hash", "");
  const SearchIndex = hash({ OfferID, SubPubHash, p2hash, DateYMDT });

  let where = {
    OfferID: OfferID,
    SubPubHash: SubPubHash,
    p2hash: p2hash,
    Date: DateYMDT,
  };

  let set = getOffer(offer);
  set.SearchIndex = SearchIndex;
  set.SubPubID = SubPubID;
  set.P2 = p2;

  CampaignTotalGroupCounter.add(where, `ClickCount`, 1, set);
  CampaignTotalGroupCounter.add(where, `${hora}.c`, 1, set);
}

var addOneTotalGroupInstall = async function (param, offer) {
  let simpleDateYMDT = moment().format("YYYY-MM-DDT00:00:00Z");
  let DateYMDT = new Date(simpleDateYMDT);
  let OfferID = parseInt(_.get(param, "context.click.OfferID"));
  let SubPubID = _.get(param, "context.click.SubPubID");
  let p2hash = _.get(param, "context.click.p2hash", '');
  let p2 = _.get(param, "context.click.ExtraParams.p2", "");
  let SubPubHash = _.get(param, "context.click.SubPubHash", "");
  let TrackingProxy = _.get(param, "context.params.TrackingProxy", false);
  let TrackingTime = parseInt(_.get(param, "context.params.TrackingTime", 0));

  let CampaignTypeID = _.get(param, "context.offer.CampaignHead.CampaignTypeID");
  let Revenue = _.get(param, "context.click.Revenue", 0);
  let Cost = _.get(param, "context.click.Cost", 0);
  let Profit = 0;
  let CountTrackingProxy = 1;
  const hora = moment().format("HH");

  if (Revenue == null) Revenue = 0;
  Revenue = parseFloat(Revenue);
  if (Cost == null) Cost = 0;
  Cost = parseFloat(Cost);

  // Si no envio callback el costo es 0, no cuento al supplier
  if (!TrackingProxy) {
    CountTrackingProxy = 0;
    Cost = 0;
  }
  if (CampaignTypeID == "CPC") {
    Revenue = 0;
    Cost = 0;
    Profit = 0;
  } else {
    if (Revenue > Cost) Profit = Revenue - Cost;
  } 

  // Si el install entro con el evento valido si es CPI / CP2  
  const PROCESAR = _.get(param, 'context.params.PROCESAR', 'INSTALL');
  if (PROCESAR=='AMBOS' && CampaignTypeID != 'CPI' ) CountTrackingProxy = 0;

  let incs = JSON.parse(`{"$inc":{
        "TrackingProxy":${CountTrackingProxy},
        "TrackingCount":1,
        "TotalRevenue":${Revenue},
        "TotalCost":${Cost},
        "TotalProfit":${Profit},
        "${hora}.i":1,
        "${hora}.p":${CountTrackingProxy}
    }}`);
    //"00.i": 1,
    //"00.p": ${CountTrackingProxy}
  incs.$set = getOffer(offer);
  const SearchIndex = hash({ OfferID, SubPubHash, p2hash, DateYMDT });
  incs.$set.SearchIndex = SearchIndex;
  incs.$set.SubPubID = SubPubID;
  incs.$set.P2 = p2;

  db.connection().collection("CampaignTotalGroup").updateOne(
    {
      OfferID: OfferID,
      SubPubHash: SubPubHash,
      p2hash: p2hash,
      Date: DateYMDT,
    },
    incs,
    {
      upsert: true,
    }
  );
};

var addOneTotalGroupEvents = async function (param, offer) {
  let simpleDateYMDT = moment().format("YYYY-MM-DDT00:00:00Z");
  let DateYMDT = new Date(simpleDateYMDT);
  let OfferID = parseInt(_.get(param, "context.click.OfferID"));
  let SubPubID = _.get(param, "context.click.SubPubID");
  let p2 = _.get(param, "context.click.ExtraParams.p2", '');
  const SubPubHash = _.get(param, "context.click.SubPubHash");
  const p2hash = _.get(param, "context.click.p2hash", "");

  let TrackingProxy = _.get(param, "context.params.TrackingProxyEvent", false);
  let CampaignTypeID = _.get(param, "context.offer.CampaignHead.CampaignTypeID");
  let Revenue = parseFloat(
    _.get(param, "context.click.TrackingCost.Revenue", 0)
  );
  let Cost = parseFloat(_.get(param, "context.click.TrackingCost.Cost", 0));
  let Profit = parseFloat(_.get(param, "context.click.TrackingCost.Profit", 0));
  let CountTrackingProxy = parseFloat(
    _.get(param, "context.click.TrackingCost.CountTrackingProxy", 0)
  );
  const hora = moment().format("HH");
  const SearchIndex = hash({ OfferID, SubPubHash, p2hash, DateYMDT });
  const PROCESAR = _.get(param, 'context.params.PROCESAR', 'EVENTS');
  if ( CampaignTypeID == 'CPI' ) CountTrackingProxy = 0; //PROCESAR=='AMBOS' &&

  let incs = JSON.parse(`{"$inc":{
    "TrackingEvent":1,
    "TrackingProxy":${CountTrackingProxy},
    "TotalRevenue":${Revenue},
    "TotalCost":${Cost},
    "TotalProfit":${Profit},
    "${hora}.e":1,
    "${hora}.p":${CountTrackingProxy}
  }}`);

  incs.$set = getOffer(offer);
  incs.$set.SearchIndex = SearchIndex;
  incs.$set.SubPubID = SubPubID;
  incs.$set.P2 = p2;

  db.connection().collection("CampaignTotalGroup").updateOne(
    {
      OfferID: OfferID,
      SubPubHash: SubPubHash,
      p2hash: p2hash,
      Date: DateYMDT,
    },
    incs,
    {
      upsert: true,
    }
  );
};

var addOneTotalGroupBlackList = async function (param, offer) {
  let simpleDateYMDT = moment().format("YYYY-MM-DDT00:00:00Z");
  let DateYMDT = new Date(simpleDateYMDT);
  let OfferID = parseInt(_.get(param, "OfferID"));
  let SubPubID = _.get(param, "SubPubID");
  const SubPubHash = _.get(param, "SubPubHash");
  const p2hash = _.get(param, "p2hash", "");
  const p2 = _.get(param, "p2", "");

  //let StatusBL = _.get(param, "Status", true);
  const CampaignID = parseInt(_.get(param, "CampaignID", 0));
  const AdvertiserID = parseInt(_.get(param, "AdvertiserID", 0));
  const SupplierID = parseInt(_.get(param, "SupplierID", 0));
  const AccountManagerID = parseInt(_.get(param, "AccountManagerID", 0));
  let blackListReason = _.get(param, "blackListReason", "");
  let incs;
  const hora = moment().format("HH");
  const SearchIndex = hash({ OfferID, SubPubHash, p2hash, DateYMDT });

  blackListReason = blackListReason.replace(/ /g, "_");
  /**
   * Opciones de BlackList Reason
    CTIT
    High_CR
    Low_CR
    Low_Event_KPI
    MMP_Rejected
    ** P2
  */

  let where = {
    OfferID: OfferID,
    SubPubHash: SubPubHash,
    p2hash: p2hash,
    Date: DateYMDT,
  };

  let set = getOffer(offer);
  set.SearchIndex = SearchIndex;
  set.SubPubID = SubPubID;
  set.P2 = p2;

  CampaignTotalGroupCounter.add(where, `TotalSource`, 1, set);
  //CampaignTotalGroupCounter.add(where, `StatusBL`, 1, set);
  if (blackListReason != "") {
    CampaignTotalGroupCounter.add(where, `${blackListReason}`, 1, set);
  }
};

/**
 * Obtengo Total de Eventos por Oferta y SubPubID, para utilizar en los validadores
 */
var getTotalGroupEvents = async function (OfferID, SubPubID) {
  let simpleDateYMDT = moment().format("YYYY-MM-DDT00:00:00Z");
  let DateYMDT = new Date(simpleDateYMDT);

  let total = await db
    .connection()
    .collection("CampaignTotalGroup")
    .aggregate(
      [
        {
          $match: {
            OfferID: OfferID,
            SubPubID: SubPubID,
          },
        },
        {
          $group: {
            _id: null,
            totalEvents: { $sum: "$TrackingEvent" },
          },
        },
      ],
      async function (err, data) {
        //Warning, this could for reasons bring more that one doc.
        //TODO: Esto está mal
        let res = _.get(await data.toArray(), "[0]");
        /*
        console.log("=====================");
        console.log(res);
        console.log("=====================");
        */
        return res;
      }
    );
  let retorno = _.get(total, "totalEvents", 0);
  return retorno;
};

/**
 * Obtengo Total de Installs por Oferta y SubPubID, para utilizar en los validadores
 */
var getTotalGroupInstall = async function (OfferID, SubPubID) {
  let simpleDateYMDT = moment().format("YYYY-MM-DDT00:00:00Z");
  let DateYMDT = new Date(simpleDateYMDT);

  let total = await db
    .connection()
    .collection("CampaignTotalGroup")
    .aggregate(
      [
        {
          $match: {
            OfferID: OfferID,
            SubPubID: SubPubID,
            Date: new Date(simpleDateYMDT),
          },
        },
        {
          $group: {
            _id: null,
            TrackingCount: { $sum: "$TrackingCount" },
          },
        },
      ],
      async function (err, data) {
        //Warning, this could for reasons bring more that one doc.
        //TODO: Esto está mal
        let res = _.get(await data.toArray(), "[0]");
        /*
        console.log("=====================");
        console.log(res);
        console.log("=====================");
        */
        return res;
      }
    );

  let retorno = _.get(total, "TrackingCount", 0);
  return retorno;
};

module.exports = {
  addOneClick: addOneClick,
  addOneInstall: addOneInstall,
  addOneEvents: addOneEvents,
  getTotalGroupEvents: getTotalGroupEvents,
  getTotalGroupInstall: getTotalGroupInstall,
  addOneTotalGroupBlackList: addOneTotalGroupBlackList,
};
