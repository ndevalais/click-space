
let config = require("../../../modules/config");
let moment = require("moment");
const nodemailer = require('nodemailer');
var _ = require('lodash');

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

module.exports = {
  validClickCount: validClickCount,
  eventCost: eventCost,
  sendMailBlackList: sendMailBlackList
}
