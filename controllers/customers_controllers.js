var log = require("../modules/log")
//const c = require('../modules/constants');
var _ = require('lodash');
const { roughSizeOfObject } = require('../modules/tools/index');
const HttpRequest = require('request');
var entityApiCustomer = require('../modules/entity_manager/api_customers_entity');
var entityApiCampaign = require('../modules/entity_manager/api_campaign_entity');
const { option } = require("yargs");

async function asyncRequest(url, arrheaders = [], user = '', password = '', method = 'GET') {
  try {
    var headers = {'Content-type': 'application/json'};
    // Agrego valores al Header
    for (let i in arrheaders) {
      headers = Object.assign(headers, arrheaders[i]);
    }

    let options = {
      url: url,
      method: method,
      headers: headers,
      json: true
    };

    if (user!='' && password!= '') {
      options.form = {
        'user': user,
        'password': password
      }
    }
    let retorno = new Promise((resolve, reject) => {
      HttpRequest(options, (error, response, body) => resolve({ error, response, body }));
    });
    return retorno;
  } catch (error) {
    log('Error ' + error + ' rows');
    reject({ status: 'asyncRequest_error' });
  }
}

async function getCampaignApis(json, value) {
  apis = {};
  for (let i in json) {
    for (let j in json[i]) {
      if (json[i][j] == value) {
        apis = json[i][1];
      }
    }
  }
  return apis;
}

/**
 * Funcion Recursiva para obtener el Valor de un Campo de un JSON
 * @param {*} json 
 * @param {*} value 
 */
async function getValue(json, value) {
  let retorno = '';
  let arr = Object.entries(json)
  for (let i in arr) {
    if (arr[i][0] == value) {
      if (retorno!='') retorno = retorno + ',';
      retorno = retorno + arr[i][1];
      //break;
    }
    // Si es un objeto sigo buscando , no tiene que ser un array
    if (retorno=='') {
      if (typeof arr[i][1] === 'object' && !Array.isArray(arr[i][1]) && arr[i][1] != null ) {
        retorno = await getValue(arr[i][1], value);
        if (retorno!='') {
          if (Array.isArray(retorno))  retorno = retorno.join();
          //retorno = retorno.join();
          break;
        }
      } else if (Array.isArray(arr[i][1]) && arr[i][1] != null ) {
        for (let j in arr[i][1]) {
          retorno = await getValue(arr[i][1][j], value);
          if (retorno!='') break;
        }
        if (retorno!='') break;
      }
    }
  }
  if (Array.isArray(retorno)) retorno = retorno.join();
  if (retorno==null || retorno=='null' || retorno==undefined) retorno = '';
  return retorno;
}

/**
 * Funcion para Obtener el AppID o Device de una URL de Apple o Google
 * @param {*} url 
 * @param {*} type 
 */
async function getAppIDDevice(url, type) {
  const urlParse = new URL(url);
  let Device = '';
  let AppID = '';
  let retorno;

  if (url.indexOf('play.google') >= 0) {
    Device = 'Android';
    AppID = urlParse.search.split('&')[0].split('=')[1]
  }
  if (url.indexOf('itunes.apple') >= 0) {
    Device = 'iOS';
    const pos = urlParse.pathname.indexOf('id');
    AppID = urlParse.pathname.substr(pos+2)
  }
  if (Device == '') Device = 'All';

  if (type=='device') {
    retorno = Device;
  } else {
    retorno = AppID;
  }
  return retorno;
}


var registerCustomer = async function(params){
  return new Promise (async (resolve,reject)=>{

    try {
      //let path = _.get(params,'path').split('/');
      let customer = _.get(params,'api');  
      let timeInitial = Date.now();
      let timeTotal = 0;
      let retorno;
      const headers = {
        'Content-type': 'application/json'
      };

      let Api = await entityApiCustomer.getApiCustomers( customer );

      if (Api.length>0) {
        let key = _.get(Api[0],'ApiKey',''); //Api[0].ApiKey;  
        let urlApi = _.get(Api[0],'ApiURL',''); //Api[0].ApiURL;  
        let urlApiLogin = _.get(Api[0],'Login.ApiURLLogin',''); // Api[0].Login.ApiURLLogin; 
        let urlApiLogout = _.get(Api[0],'ApiURLLogout',''); //Api[0].ApiURLLogout;  
        let ApiLogin = _.get(Api[0],'Login',''); // Api[0].Login;
        let cookie = _.get(Api[0],'Login.cookie','');  //_.get(Api[0],'Login.cookie','');
        const Parameters = _.get(Api[0],'Parameters','');  //Api[0].Parameters;
        const AdvertiserID = _.get(Api[0],'AdvertiserID','');  //Api[0].AdvertiserID; //488;
        const fields = _.get(Api[0],'data','');  //Api[0].data;
        const LevelData = _.get(Api[0],'LevelData','');  //Api[0].LevelData;
        const isPortal = 0;
        const Status = 'approved';
        let Pages = _.get(Api[0],'Pages',''); 
        let nextPages = '';
        let result;
        let resultLogin;
        let ForeignCampaignID;
        let Icon72;
        let MarcketURL;
        let Campaign;
        let CountryID;
        let CampaignTypeID;
        let Payout;
        let URLTracking;
        let Device;
        let DailyQuantity;
        let DailyAmount;
        let Comments;
        let AppID;
        let Incentivized;
        let Macros;
        let retorno;
        let temp = []
        let header= [];
        let totalPages = 0;

        // Elimino campas creadas en coridas anteriores
        await entityApiCampaign.deleteApiCampaign( AdvertiserID );

        // Valido si tengo que realizar un login 
        if ( ApiLogin!='' ) {
          resultLogin = await asyncRequest(urlApiLogin, [], ApiLogin.user, ApiLogin.password, ApiLogin.method);
          const arrHeader = resultLogin.response.rawHeaders;
          for (let i in arrHeader) {
            if (arrHeader[i]==cookie) {
              header.push({ cookie:arrHeader[parseInt(i)+1] });
              break;
            }
          }
        }

        // Pages 
        for (let page = 0; page <= totalPages; page++) {

          // PAGINACION - Valido si existe paginacion 
          if (Pages!='') { 
            urlApi = urlApi.replace('NRO_PAGE', page);
          }

          // Obtengo informacion de la api 
          result = await asyncRequest( urlApi, header );

          // Transformo el resultado en json
          json = Object.entries(result.body)

          // PAGINACION - Valido si existe una pagina siguiente
          if (Pages!='') {
            nextPages = await getValue(result.body, Pages);
            urlApi = nextPages;
            totalPages += (nextPages!='') ? 1 : 0
          }

          // Obtengo las Campaigns
          apiCampaigns = await getCampaignApis(json, LevelData)

          // Recorro campaigns y obtengo los valores de los campos 
          for (let id in apiCampaigns) {
            // log(apiCampaigns[id]);
            
            ForeignCampaignID = (fields.ForeignCampaignID=='') ? '' :  await getValue(apiCampaigns[id], fields.ForeignCampaignID);
            // DEBUG 
            /*if (ForeignCampaignID=='5f5b9d3c6c4b863') {
              x= 1;
            }*/
            log(`ForeignCampaignID --> ${ForeignCampaignID}`);
            Icon72 = (fields.Icon72=='') ? '' :  await getValue(apiCampaigns[id], fields.Icon72);
            MarcketURL = (fields.MarcketURL=='') ? '' :  await getValue(apiCampaigns[id], fields.MarcketURL);
            Campaign = (fields.Campaign=='') ? '' :  await getValue(apiCampaigns[id], fields.Campaign);
            CountryID = (fields.CountryID=='') ? '' :  await getValue(apiCampaigns[id], fields.CountryID);
            CampaignTypeID = (fields.CampaignTypeID=='') ? '' :  await getValue(apiCampaigns[id], fields.CampaignTypeID);
            Payout = (fields.Payout=='') ? '' :  await getValue(apiCampaigns[id], fields.Payout);
            URLTracking = (fields.URL=='') ? '' :  await getValue(apiCampaigns[id], fields.URL);
            Device = (fields.Device=='') ? '' :  await getValue(apiCampaigns[id], fields.Device);
            DailyQuantity = (fields.DailyQuantity=='') ? '' :  await getValue(apiCampaigns[id], fields.DailyQuantity);
            DailyAmount = (fields.DailyAmount=='') ? '' :  await getValue(apiCampaigns[id], fields.DailyAmount);
            Comments = (fields.Comments=='') ? '' :  await getValue(apiCampaigns[id], fields.Comments);
            AppID = (fields.AppID=='') ? '' :  await getValue(apiCampaigns[id], fields.AppID);
            Incentivized = (fields.Incentivized=='') ? 0 :  await getValue(apiCampaigns[id], fields.Incentivized);

            // Valido contenido de los campos
            if (Device==null || Device==undefined) Device = '';
            if (AppID=='' && MarcketURL !='') AppID = await getAppIDDevice(MarcketURL, '');
            if (Device=='' && MarcketURL !='') Device = await getAppIDDevice(MarcketURL, 'device');
            if (Device.toUpperCase()=='ANDROID' || Device.toUpperCase()=='AND') Device = 'Android';
            if (Device.toUpperCase()=='IOS') Device = 'iOS';
            if (Device=='iOS') AppID = AppID.replace("id",""); 
            if (CampaignTypeID=='') CampaignTypeID = 'CPI';
            if (DailyQuantity!='') DailyQuantity= Math.round(DailyQuantity);
            if (Comments!='') Comments = Comments.replace(/'/gi,"`"); 
            Campaign = Campaign.replace(/'/gi,"`"); 
            Payout = parseFloat(Payout);

            // Reemplazo Macros en la URL de Tracking
            Macros = Object.entries(Api[0].Macros);
            for (let i in Macros) {
              URLTracking = URLTracking.replace(Macros[i][1], `{${Macros[i][0]}}`);
            }

            // Agrego Parametros a la URL de Traking
            URLTracking = URLTracking + `${Parameters}`;

            // Guardo ApiCampaign en SQL SERVER solo si el Payout es mayor a 0.3
            retorno= { retorno: 'payout NO OK'}
            if (Payout > 0.3) {
              retorno = await entityApiCampaign.updateApiCampaign(ForeignCampaignID, AdvertiserID, Campaign, Icon72, MarcketURL, CountryID,
                CampaignTypeID, Payout, URLTracking, Status, Device, DailyQuantity, DailyAmount, Comments, AppID, Incentivized, isPortal);
            }
            // Agrego Salida 
            temp.push({ForeignCampaignID, AdvertiserID, Campaign, action: retorno.retorno });
          }
        }
        
        if (urlApiLogout!='') await asyncRequest( urlApiLogout  );

        let total = temp.length;

        // Obtengo size de la consulta y lo paso a kb
        let totalSize = await roughSizeOfObject(temp);
        totalSize = (totalSize)/1000;
        timeTotal = (Date.now() - timeInitial )/1000;

        resolve({ status: customer, write_output: true, result: temp, total: total, time: timeTotal, size: totalSize });
      } else {
        reject({ status: 'Api Customer', write_output: true, error: 'Api Customer not found' });
      }
    } catch (error) {
      log('Error ' + error + ' rows');
      reject({ status: 'Api Customer error', write_output: true, error: error });
    }
  });
}

module.exports={
  registerCustomer: registerCustomer
}