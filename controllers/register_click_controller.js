var validatorEngine = require('../modules/entity_manager/validator');
var entityManager = require('../modules/entity_manager');
var log = require("../modules/log")
const c = require('../modules/constants');
var _ = require('lodash');
var hash = require('object-hash');
let performance = require('perf_hooks').performance;
//var CrearOffer = require('./offers_controllers');

function stringToHash(str) {
    var hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
      chr   = str.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash + 2147483647 + 1;
  };

var registerClick = async function (params) {
    return new Promise(async (resolve, reject) => {
        //Gets the offer from the cache

        let IPLong;
        let pIP;
        const p2 = _.get(params, c.P_NAMES.click.P2 , "");
        const subpubid = _.get(params,c.P_NAMES.click.SUBPUBID,"").replace(/\./g, ''); 
        const subpubhash = stringToHash( subpubid );
        const offerguid =  _.get(params, c.P_NAMES.click.OFFER_GUID);

        try{
            pIP = _.get(params, params,c.P_NAMES.click.IP_NUM, 0)
            IPLong = parseInt( pIP );
        }catch(e){
            console.log("ERROR: registerClick() - No se reconoce la IP:", pIP);
        }

        var offer = await entityManager.getOfferByUUID(offerguid, subpubhash, IPLong, c.P_NAMES.click.name);


        params.subpubid = subpubid;     
        params.subpubhash = subpubhash;
        params.p2 = p2;
        params.p2hash = stringToHash( p2 );
        params.evento = c.P_NAMES.click.name;
        params.offerguid = offerguid;

        if (!offer) {
            // Si no existe, debo enviar al rotador. CREO OFFERTA
            //CrearOffer.registerOffersGuid(params.offerguid);
            
            resolve(
                {
                    status: 'offer_does_not_exist',
                    redirect: false,
                    param: params,
                    IPLong: IPLong,
                    offer: offer
                }
            );
            return true;
        }

        // Creates a simple "ContextObject", to send to validator.
        var context = {
            offer: offer
        };

        // Valido el click contra los validadores
        validatorEngine.validate(validatorEngine.VALIDATORS.CLICK_VALIDATOR, params, context).then(function (validatorsResult) {
            //Prepares click to be saved
            let click = entityManager.clickEntity.createNewClickStructFromInput(params, context, validatorsResult);

            // Saves click
            entityManager.clickEntity.saveClick(click).then(function (res) {
                //Informs of new click to EntityManager publishing event
                res.offer = context.offer;
                
                
                // Adds insertedClickId to params for later use if needed.
                params.insertedClickId = res.insertedId.toHexString();
                // Actualizo el  CampaignClickGUID
                entityManager.clickEntity.updateClick( params.insertedClickId );
                res.ops[0].CampaignClickGUID = params.insertedClickId;

                resolve({
                    status: 'all_validators_ok',
                    redirect: true,
                    param: params,
                    context: context,
                    validatorsResult: validatorsResult
                });
                
                entityManager.emitEvent(c.EVENTS_KEY_NAMES.NEW_CLICK_CREATED, res);                
                // Debug Click
                if (params.debug) {
                    entityManager.emitEvent(c.EVENTS_KEY_NAMES.NEW_DEBUG_CREATED, res);
                }                            
            }).catch(function (err) {
                log(err);
                reject(
                    {
                        status: 'error_saving_click',
                        params: params
                    }
                );
            });
        }).catch(async function (error) {
            //TODO : SEND TO ROTATOR
            /*
                Otener Rotador
                params , cambiar oferta !!
                context , reemplazar por nueva oferta
                Inserto  CLICK
            */
           
            const SupplierID = _.get(context, "offer.Supplier.SupplierID", 0);
            const DeviceID = _.get(params, "AdditionalUserAgentInfo.os.family", '').toUpperCase().substr(0, 3);
            //console.log("Rotador:");

            var rotador = await entityManager.getRotator(SupplierID, DeviceID);
            if (rotador) {
                params.offerguid = _.get(rotador,"OfferGUID");
                context.SourceOffer = context.offer;
                context.offer = rotador;
                //Saves click Rotador            
                resolve({
                        status: 'all_validators_ok',
                        redirect: true,
                        param: params,
                        context: context,
                        validatorsResult: error
                }); 
            } else {
                resolve({
                    status: 'all_validators_ok',
                    noredirect: true,
                    param: params,
                    context: context,
                    validatorsResult: error
                }); 
            }
            /* ESTO LO AGREGO DE FORMA TEMPORAL */
            // AGREGO INSERT DEL CLICK DEL ROTADOR ********
            let click = entityManager.clickEntity.createNewClickStructFromInput(params, context, error);
            entityManager.clickEntity.saveClick(click).then(function (res) {
                //Informs of new click to EntityManager publishing event
                res.offer = context.offer;
                res.SourceOffer = context.SourceOffer;
                
                // Adds insertedClickId to params for later use if needed.
                params.insertedClickId = res.insertedId.toHexString();
                // Actualizo el  CampaignClickGUID
                entityManager.clickEntity.updateClick( params.insertedClickId );
                res.ops[0].CampaignClickGUID = params.insertedClickId;
                
                entityManager.emitEvent(c.EVENTS_KEY_NAMES.NEW_CLICK_CREATED, res);
                entityManager.rotadorEntity.saveRotador(res);

                //entityManager.emitEvent(c.EVENTS_KEY_NAMES.NEW_ROTADOR_REGISTERED, res);
                // Debug Click
                if (params.debug) {
                    entityManager.emitEvent(c.EVENTS_KEY_NAMES.NEW_DEBUG_CREATED, res);
                }                            
            }).catch(function (err) {
                log(err);
                reject(
                    {
                        status: 'error_saving_click',
                        params: params
                    }
                );
            });
            let x=1;

            //**** FIN CLICK ROTADOR */
            // Debug Click
           /* if (params.debug) {
                //let click = entityManager.clickEntity.createNewClickStructFromInput(params, context, error);
                res = {offer: context.offer, click: click, context:context};
                res.ops = [];
                res.ops.push( click)
                entityManager.emitEvent(c.EVENTS_KEY_NAMES.NEW_DEBUG_CREATED, res);
            }*/
        })
    });
}

module.exports = {
    registerClick: registerClick
}
