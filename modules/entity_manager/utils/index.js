
let config = require("../../../modules/config");
let moment = require("moment");
const nodemailer = require('nodemailer');
var _ = require('lodash');
var request = require('request');

let signature = {};

function requestApps(options) {
  return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
          if (error) reject(error);
          //Too many active keys
          if (response.statusCode != 200 && response.statusCode != 429) {
              reject('Invalid status code <' + response.statusCode + '>');
          }
          resolve(body);
      });
  });
}
/**
 * crear un objeto transportador reutilizable utilizando el transporte SMTP predeterminado
 * @param {*} transporter -- Transporte SMTP
 */
let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'laikad2021@gmail.com', //'azure_eb3c91984278980d47747dc396efd21f@azure.com',
    pass: 'levtcukjxgulozph' //'qwe123123'
  }
});

/**
 * 
 * @param {*} mailOptions 
 * @returns 
 */
const sendMail = (mailOptions) => new Promise((resolve, reject) => {
  transporter.sendMail(mailOptions, function (error, info) {
      if (error) reject(error);
      else resolve(info);
  });
})

/**
 * 
 * @param {*} result = {To: <Email Sender>, Subject: <Asunto del Email>, Body: <contenido Email>}
 * @returns 
 */
var sendMailBlackList = async function (result) {
  const Subject = result.Subject || `BlackList Θ SubPub ✔ (${ (new Date()).toString() })`;
  const mail = await sendMail({
      from: 'laikad2021@gmail.com',
      to: result.To,
      subject: Subject,
      text: `
      \n${result.Body}.`
  });
  return true;
}


var sendEmailFromAppsFlyer = async function (result) {
  const Subject = result.Subject || `APPSFLYER blocked ✔ (${ (new Date()).toString() })`;
  const mail = await sendMail({
      from:  'laikad2021@gmail.com',
      to: result.To,
      cc: 'laikad2021@gmail.com;nestor@diemp.net',
      subject: Subject,
      text: `
      \n${result.Body}.`
  });
  return true;
}

/**
 * Valido cantidad de clicks desde los cuales inicio las validaciones
 * @param {*} contextToValidateWith 
 */
var validClickCount = async function (contextToValidateWith, lOK) {
  const simpleDateYMD = moment().format('YYYYMMDD');
  const OfferID = _.get(contextToValidateWith, "offer.OfferID");
  let ClickCountValid = parseInt(_.get(config, "CLICK_COUNT_VALID", 0))
  let ClickCounOffer = _.get(contextToValidateWith, `offer.Totals.Offers[${OfferID}].clicks[${simpleDateYMD}].T`, 0);

  if (!lOK)
    return ( ClickCountValid > ClickCounOffer);
  else 
  return lOK;
}

/**
 * Calculo el costo del evento
 * @param {*} event                 -- Nombre del Evento
 * @param {*} TrackingProxy         -- Parametro que indica si envio el callback 
 * @param {*} offer                 -- Oferta
 * @param {*} existingEventInstall  -- PArametro que indica si ya se realizo el calculo del install
 */
var eventCost = async function (event, TrackingProxy, offer, existingEventInstall) {
  try {
    const CampaignTypeID = _.get(offer, "CampaignHead.CampaignTypeID",'');
    const eventsName1 = _.get(offer, "Campaign.eventsName1", '').toUpperCase();
    const eventsName2 = _.get(offer, "Campaign.eventsName2", '').toUpperCase();
    const eventsName3 = _.get(offer, "Campaign.eventsName3", '').toUpperCase();

    let Revenue = 0; 
    let Cost = 0; 
    let Profit = 0;
    let CountTrackingProxy = 0;

    if (existingEventInstall==0) {
      CountTrackingProxy = 1;
      TrackingCost = {
        CountTrackingProxy: CountTrackingProxy,
        Cost: Cost,
        Revenue: Revenue,
        Profit: Profit
      };

      if (CampaignTypeID=='CP2') {
        if (event == eventsName1) {
            Revenue = parseFloat(_.get(offer, "Campaign.eventPayOut1", 0));
            Cost = parseFloat(_.get(offer, "Campaign.eventCost1", 0));
        } else if (event == eventsName2) {
            Revenue = parseFloat(_.get(offer, "Campaign.eventPayOut2", 0));
            Cost = parseFloat(_.get(offer, "Campaign.eventCost2", 0));
        } else if (event == eventsName3) {
            Revenue = parseFloat(_.get(offer, "Campaign.eventPayOut3", 0));
            Cost = parseFloat(_.get(offer, "Campaign.eventCost3", 0));
        } 
        if (!TrackingProxy) {
          CountTrackingProxy = 0;
          Cost = 0;
        }
        if (Revenue > Cost) Profit = Revenue - Cost;
      }
    }
    TrackingCost = {
      CountTrackingProxy: CountTrackingProxy,
      Cost: Cost,
      Revenue: Revenue,
      Profit: Profit
    };
    return TrackingCost;
  }  catch (error) {
    console.log(`Error ${error} rows`);
    return {
      CountTrackingProxy: 0,
      Cost: 0,
      Revenue: 0,
      Profit: 0
    };
  }
}

var signatureAppsflyer = async function () {
  try{ 
    const key ='Bearer eyJhbGciOiJBMjU2S1ciLCJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwidHlwIjoiSldUIiwiemlwIjoiREVGIn0.7EgPLtG6tIyZgTQNJ7lV5rAYmopcAZC5tfSGN1Orpz9hd9P-uRTjVw.dMFqbYw1JwbS6oFy.No4E069tos1BN4A09VuEAhFq85rmp4C1TxpIzA9dXF5Ah0uEFoW134oilafS-j1Vw8zSvIhAG5MSZFEW7ItNTvgdUIYhfRWC93My2GeddclzgLXNUd1o2uJJ0ORR9fbRknFqrjSIOLVWIhvZ_P0M2Q6_u8-ysD8q-G4moNpre63ru7IO1QBL3cAVj7yEzNYVwhCO6hQgGmdVa5K6I68F-zoIhIM-jahQQhdCmdnwP8foa8IpNDYq8hVUQh6fkyB2BWuksfhLjTE3hcvk7f0CeyFFvoDbi9IYHc3jqlSuHbypcnKW-Z_r3k_pl5WVqNOe2WRN6ZouhtkVHqBDVkFgt3_a4NjrbeDS-UxD8Udl4AfgO_oN3TL83pHMDvO4me_I158FqZSEmenMPAd7H0dHqbQXzFXq4VBTxi_yejmSWECOv2DUju_DvFabc8ZO1Vn7wtXJKCM4sKCHUDjEZ5-JANXO-OHvs5dKbT9DHk1XtS86P7Ca6aLMuQmJdGy9a61rpIQG7V4rwNNJST9_glM5.osY488-NLBj450rynZnkjQ';
    var optionsCreate = {
      'method': 'POST',
      'url': 'https://hq1.appsflyer.com/api/p360-click-signing/secret?ttlHours=4',
      'headers': {
        'Content-Type': 'application/json',
        'Authorization': key
      }
    };
    var optionsConfig = {
      'method': 'GET',
      'url': 'https://hq1.appsflyer.com/api/p360-click-signing/config',
      'headers': {
        'Content-Type': 'application/json',
        'Authorization': key
      }
    };
    if (!signature["secret-key"]) {
      let temp = await requestApps(optionsCreate);
      if (temp=='Too many active keys') {
        // DEBO OCREAR OTRO KEY
        let temp1 = await requestApps(optionsConfig);
        temp1 = JSON.parse(temp1);
        // Elimino las firmas
        revoca1 = temp1["active-key-ids"][0]["secret-key-id"];
        revoca2 = temp1["active-key-ids"][1][ "secret-key-id"];
        var optionsDel1 = {
          'method': 'DELETE',
          'url': 'https://hq1.appsflyer.com/api/p360-click-signing/secret/' + revoca1,
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': key
          }
        };
        var optionsDel2 = {
          'method': 'DELETE',
          'url': 'https://hq1.appsflyer.com/api/p360-click-signing/secret/' + revoca2,
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': key
          }
        };
        await requestApps(optionsDel1);
        await requestApps(optionsDel2);
        // Creo nueva firma
        temp1 = await requestApps(optionsConfig);
        temp1 = JSON.parse(temp1);
      }
      signature = temp;
      signature = JSON.parse(signature);
      /*return signature; = {
        "secret-key-id": "38e93022-df8c-4fce-9362-66ac5bcc267b",
        "secret-key": "+IppYJ6aErve7pzVWPIqTWtEI4eXhwe2BWt7mz8mq40=",
        "expiration": 1653200785
      }*/
    }
    return signature;
  }  catch (error) {
    console.log(`Error ${error} `);
  }
}

module.exports = {
  validClickCount: validClickCount,
  eventCost: eventCost,
  sendMailBlackList: sendMailBlackList,
  signatureAppsflyer: signatureAppsflyer,
  sendEmailFromAppsFlyer: sendEmailFromAppsFlyer
}
