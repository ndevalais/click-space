var validatorEngine = require("../../modules/entity_manager/validator");
var entityManager = require('../../modules/entity_manager');
var log = require("../../modules/log");
const c = require('../../modules/constants'); 
var _ = require('lodash');

/**
 * Save Install
 * @param {*} validatorEngine 
 * @param {*} context 
 * @param {*} params 
 */
var saveInstall = async function(validator, context, params){
  const CampaignTypeID = _.get(context,"offer.Campaign.CampaignTypeID");
  let validatorsResult = await validatorEngine.validate( validator , context, params )

  let install = entityManager.installsEntity.createInstallStructFromInput(params, context, validatorsResult);

  //Saves Install
  let res = await entityManager.installsEntity.saveInstall(install);

  params.evento = 'install';

  //Informs of new click to EntityManager publishing event
  entityManager.emitEvent(c.EVENTS_KEY_NAMES.NEW_INSTALL_REGISTERED, {res,context});

  // Ejecuto el prepay solo si la campa no es CPA
  //if (CampaignTypeID!='CP2') {
  //  entityManager.emitEvent(c.EVENTS_KEY_NAMES.UPD_ADVERTISER_PREPAY, {res,context});
  //}
  //Adds insertedClickId to params for later use if needed.
  params.insertedClickId = res.insertedId.toHexString();
  // Agrego el id del install para tenerlo en cuenta en el Evento
  if (!context.install) context.install = { _id: params.insertedClickId };
  params.PostBackURL = _.get(context, "offer.Supplier.PostBackURL", "");

  return  {
      process_from: 'saveInstalls', 
      status: 'all_validators_ok', 
      param: params,
      context: context,
      callback: params.TrackingProxy,
      validatorsResult:validatorsResult,
    };
}

module.exports={
  saveInstall: saveInstall
}