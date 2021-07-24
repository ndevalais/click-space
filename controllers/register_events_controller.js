var validatorEngine = require("../modules/entity_manager/validator");
var entityManager = require("../modules/entity_manager");
var entityTotals = require("../modules/entity_manager/campaign_clicks_total");
var registerInstall = require("./register_events_helpers/register_install_helper");
var registerEvents = require("./register_events_helpers/register_events_helper");

var log = require("../modules/log");
const c = require("../modules/constants");
var _ = require("lodash");
const DEFAULT_EVENT_NAME = "Install";

var processEvents = async function(params) {
  return new Promise(async (resolve, reject) => {
    try {
      let retorno;
      let event = _.get(params, "event", DEFAULT_EVENT_NAME);
      let clickId = _.get(params, "campaignclickguid");

      let click = entityManager.getClickByID(clickId);
      let install = entityManager.getInstallByClickId(clickId);

      let result = await Promise.all([click, install]);
      let offerGUID = _.get(result[0], "OfferGUID");

      let PROCESAR = "INSTALL"; // INSTALL / EVENTS / AMBOS

      const IPLong = _.get(result[0], "LocationInfo.IP2Long");
      const SubPubHash = _.get(result[0], "SubPubHash"); // params.subpubid

      // Otengo la Oferta
      var offer = await entityManager.getOfferByUUID(
        offerGUID,
        SubPubHash,
        IPLong,
        event.toUpperCase()
      );

      //Creates a simple "ContextObject", to send to validator.
      var context = {
        click: result[0],
        install: result[1],
        offer: offer,
        params: params
      };

      // Obtengo Totales de Install y Eventos para validar KPI
      const OfferID = _.get(result[0], "OfferID");
      const SubPubID = _.get(result[0], "SubPubID");

      if(!OfferID){ 
        reject({});
        return;
      }

      let KPITrackingEvent = await entityTotals.getTotalGroupEvents(
        OfferID,
        SubPubID
      );
      let KPITrackingInstall = await entityTotals.getTotalGroupInstall(
        OfferID,
        SubPubID
      );

      context.KPITrackingEvent = KPITrackingEvent;
      context.KPITrackingInstall = KPITrackingInstall;

      // Valido si es un Install o Event
      if (event.toLowerCase() != "install") {
        if (context.install) {
          PROCESAR = "EVENTS";
        } else {
          // Si es un evento sin un install proceso el install y despues el evento
          PROCESAR = "AMBOS";
        }
      } else {
        // Si es Install Valido que no exista
        if (context.install) {
          // Si Es un install existente que viene como fraude lo agrego cambio como evento
          const fraud = _.get(context, "params.tr_sub1", "");
          if (fraud == "") {
            typeValidator = ""; // Agrego para que no realice validaciones
            log("install_exist");
            retorno = { status: "install_exist" };
            PROCESAR = "";
          } else {
            event = "fraud";
          }
        }
      }

      context.params.PROCESAR = PROCESAR;

      //Valido el install contra los validadores
      if (PROCESAR == "INSTALL" || PROCESAR == "AMBOS") {
        retorno = await registerInstall.saveInstall(
          validatorEngine.VALIDATORS.INSTALLS_VALIDATORS,
          context,
          params
        );
      }

      if (PROCESAR == "EVENTS" || PROCESAR == "AMBOS") {
        retorno = await registerEvents.saveEvent(
          validatorEngine.VALIDATORS.EVENTS_VALIDATORS,
          context,
          params,
          PROCESAR
        );
      }

      resolve(retorno);
    } catch (err) {
      log(err);
      reject({
        status: "error_saving_events",
        params: params
      });
    }
  });
};

module.exports = {
  processEvents: processEvents
};
