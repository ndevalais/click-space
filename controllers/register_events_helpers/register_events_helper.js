var validatorEngine = require("../../modules/entity_manager/validator");
var entityManager = require("../../modules/entity_manager");
var log = require("../../modules/log");
const c = require("../../modules/constants");
var _ = require("lodash");

/**
 * Save Event
 * @param {*} validatorEngine
 * @param {*} context
 * @param {*} params
 */
var saveEvent = async function (validator, context, params, PROCESAR) {
  let retorno;
  let evento = _.get(params, "event", "").toUpperCase();
  const CampaignTypeID = _.get(context,"offer.Campaign.CampaignTypeID");

  // Ejecuto validadores de los Eventos
  let validatorsResultEvent = await validatorEngine.validate(
    validator,
    context,
    params
  );

  // Prepares EVENT to be saved
  let event = entityManager.installsEntity.createEventsStructFromInput(
    params,
    context,
    validatorsResultEvent
  );

  // Guardo el Evento en la coleccion Events
  let res = await entityManager.installsEntity.addOneEvents(
    params,
    context,
    event
  );

  params.evento = 'event';

  // Informs of new click to EntityManager publishing event
  entityManager.emitEvent(c.EVENTS_KEY_NAMES.NEW_EVENT_ARRIVED, {
    res,
    context,
  });
  params.PostBackURL = _.get(context, "offer.Supplier.PostBackURL", "");
  
  // Ejecuto el prepay solo si la campa es CPA
  //if (CampaignTypeID=='CP2') {
  //  entityManager.emitEvent(c.EVENTS_KEY_NAMES.UPD_ADVERTISER_PREPAY, {res,context});
  //}

  //Adds insertedClickId to params for later use if needed.
  if (PROCESAR == "EVENTS") {
    if (evento == "fraud") {
      retorno = {
        process_from: "registerEvents",
        write_output: true,
        callback: false
      };
    } else {
      retorno = {
        process_from: "registerEvents",
        status: "all_validators_ok",
        param: params,
        context: context,
        callback: params.TrackingProxyEvent,
        validatorsResult: validatorsResultEvent
      };
    }
  } else {
    // Analiza si es CPA el retorno lo define el evento
    retorno = { process_from: "registerEvents" };
    params.evento = 'install';
  }

  return retorno;
};

module.exports = {
  saveEvent: saveEvent,
};
