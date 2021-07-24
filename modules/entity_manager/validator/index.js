var _ = require("lodash");
const logger = require('../../../modules/log');
const IGNORED_VALIDATORS = _.get(require('../../config'), "IGNORED_VALIDATORS","").split(",");
const VALIDATORS = {
    CLICK_VALIDATOR:'click_validators',
    INSTALLS_VALIDATORS:'installs_validators',
    EVENTS_VALIDATORS:'events_validators'
};

let availableValidators = {};
require(`./${VALIDATORS.CLICK_VALIDATOR}`)().then(function(result){
    availableValidators.click_validators=result;    
})
require(`./${VALIDATORS.INSTALLS_VALIDATORS}`)().then(function(result){
    availableValidators.installs_validators=result;    
})
require(`./${VALIDATORS.EVENTS_VALIDATORS}`)().then(function(result){
    availableValidators.events_validators=result;    
})
/**
 * Function that takes an input object(@objectToValidate) and validates against rules defined in 
 * validators, defined in validators folder. If @validatorsArray is specified, will use only 
 * those.
 * @withValidator Wich set of validators to use
 * @objectToValidate Input object to validate
 * @contextToValidateWith Object. Passed to validators for aditional reference, ex: Offer object.
 * @validatorsArray Optional, Array. If available will only take those validators as validation.
 */

function validate(withValidator, objectToValidate, contextToValidateWith, validatorsArray){
    return new Promise(function(resolve, reject){
        //TODO:if present should only validate against these validators
        
        let validators = _.filter (_.get(availableValidators, withValidator) , function(v){
            return IGNORED_VALIDATORS.indexOf(v.name) < 0;
        });
        if(!validators){
            reject('ERROR:no validators group with name:', withValidator);
        }

        if(validatorsArray){

        }else{
            //Extracts all the validators
            var validatorsAsArrayOfPromises = _.map(validators,'doValidate');
            //Calls all the validators at same time        
            Promise.all(validatorsAsArrayOfPromises.map(cb => cb(objectToValidate,contextToValidateWith))).then(function(values) {
                //logger("values:",values);
                resolve(values);
            }).catch(function(error){
                logger("error:",error);
                reject(error);
            });
        }
    })
}
module.exports={
    validate:validate,
    VALIDATORS:VALIDATORS
}
