/********************
    VALIDO que solo se registre el install 1 vez.
    - El install debe existir 1 vez por cada click.
    - Si ya existe un click entonces, dispara el evento de registro de eventos

*/
const NAME = "check_no_install_already_registered";
const log = require('../../../log');
var _ = require('lodash');
var entityManager = require('../../../entity_manager');
const c = require('../../../constants');

var validator = {
    name: NAME,
    doValidate: function (objectToValidate, contextToValidateWith) {
        return new Promise(function (resolve, reject) {
            log(`Running validation ${NAME} on Install for Click ${objectToValidate.click}`)
            let click = _.get(objectToValidate, "click");
            let install = _.get(objectToValidate, "install");
            
            resolve({ name: NAME, proxy: true });

            /*if (install) {
                //Envio un evento para que se contabilicen los eventos
                entityManager.emitEvent(c.EVENTS_KEY_NAMES.NEW_EVENT_ARRIVED,
                    {
                        eventGenerator: NAME,
                        object: objectToValidate,
                        context: contextToValidateWith
                    });
                //Si existe ya un install, rechazo pero además 
                reject({
                    name: NAME,
                    reason: 'click_already_registered'
                });
                //Si hay un click pero no hay un install registrado
            } else if (click && !install) {
                resolve({ name: NAME });
            } else {
                reject({
                    name: NAME,
                    reason: 'click_already_registered'
                });
            }*/
        });
    }
};

module.exports = validator;
