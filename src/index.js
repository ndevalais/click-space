const UserAgent = require("./user-agent");
const IPLocation = require("./ip2location");
const MongoClient = require("mongodb").MongoClient;
const config = require("../db/config");
const Paramters = require("./params");
const connString = `mongodb://${config.DB_USERNAME}:${config.DB_PRIMARY}@${config.DB_HOST}:${config.DB_PORT}/?ssl=true`; //&sslverifycertificate=false

module.exports = {
  /** 
   * Proceso del Click
   */
  Process: async (request, response) => {
    // Obtengo parametros ***************************************************
    const debug = true;
    let db, client;
    let print = '</br>';

    try {
      const param = await Paramters.getParams(request, print, debug);
      print += param.print;

      // Obtengo valores del User-Agent Browser
      const UserOS = await UserAgent.getUserAgent(request, response, debug);
      const OSfamilyVersion = UserOS.os.name;
      const OSfamily = UserOS.os.family;
      const OSmajor = UserOS.os.major;
      const OSminor = UserOS.os.minor;
      const OSpatch = UserOS.os.patch;
      const OSversion = UserOS.os.version;

      print += `</br>Obtengo datos OS --------------------------------------</br>`;
      print += `OSfamilyVersion = ${ OSfamilyVersion } </br>`;
      print += `OSfamily = ${ OSfamily } </br>`;
      print += `OSmajor = ${ OSmajor } </br>`;
      print += `OSminor = ${ OSminor } </br>`;
      print += `OSpatch = ${ OSpatch }</br>`;
      print += `OSversion = ${ OSversion }</br>`;

      // Obtengo IP y Lenguaje 
      let ControlIp = '190.17.162.99'; // request.headers['x-forwarded-for'] || request.connection.remoteAddress;
      let CodeLanguage = request.headers['accept-language'];
      ControlIp = ControlIp.split(',')[0].split(':')[0];
      CodeLanguage = CodeLanguage.split(',')[0].split('-')[0].toUpperCase()
      print += `IP = ${ ControlIp } </br>`;
      print += `LG = ${ CodeLanguage } </br>`;

      // Obtengo datos IP Carriers 
      const ipCarrier = await IPLocation.getCarrier(ControlIp.split(',')[0].split(':')[0], true)
      print += `</br>Obtengo Carrier --------------------------------------</br>`;
      print += `CountryCode = ${ ipCarrier.CountryCode }</br>`;
      print += `CountryName = ${ipCarrier.CountryName }</br>`;
      print += `Domain = ${ ipCarrier.Domain }</br>`;
      print += `Latitude = ${ ipCarrier.Latitude }</br>`;
      print += `Longitude = ${ ipCarrier.Longitude }</br>`;

      // Obtengo datos IP Proxy 
      const ipProxy = await IPLocation.getProxy(ControlIp.split(',')[0].split(':')[0], true)
      print += `</br>Obtengo Proxy --------------------------------------</br>`;
      print += `VPNProxyType = ${ ipProxy.VPNProxyType }</br>`;
      print += `VPNCountryCode = ${ipProxy.VPNCountryCode }</br>`;
      print += `VPNCountryName = ${ipProxy.VPNCountryName }</br>`;

      // Connect Mongo
      print += `</br>Obtengo Offer --------------------------------------</br>`;
      client = await MongoClient.connect(connString, { useNewUrlParser: true });
      db = client.db(config.DB_NAME);

      // Obtener Offers
      console.log(` Obtengo Offer ${param.OfferGUID}.`);
      const Offer = await db.collection('Offers').find({ "OfferGUID": param.OfferGUID }, { OfferID: 1, Offer: 1, Campaigns: 1, Advertiser: 1, Supplier: 1 }).toArray();

      if (Offer.length > 0) {
        //print += `</br>Offer --------------------------------------</br>';
        print += `OfferID = ${ Offer[0].OfferID }</br>`;
        print += `Offer = ${ Offer[0].Offer }</br>`;
        print += `Advertiser = ${ Offer[0].Advertiser.Advertiser } ( ${ Offer[0].Advertiser.AdvertiserID } </br>`;
        print += `Campaign = ${ Offer[0].Campaigns.Campaign } ( ${ Offer[0].Campaigns.CampaignID } </br>`;
        print += `Supplier = ${Offer[0].Supplier.Supplier } ( ${ Offer[0].Supplier.SupplierID }</br>`;
        param.OfferID = Offer[0].OfferID;

        //-- OBTENGO CANTIDAD DE CLICKS *******************************************************

      } else {
        console.log('2'); // No existe la oferta
      }

      const ActualDate = new Date();
      const dia = ActualDate.getDate();
      const mes = ActualDate.getMonth() + 1;
      const ano = ActualDate.getFullYear();
      const hora = ActualDate.getHours();
      // ActualDate.toDateString()
      console.log('La fecha actual es', ActualDate, ' - ', dia, '/', mes, '/', ano);
      //console.log(`La fecha actual es ${dia} de ${meses[mes]} del ${ano}`) 
      console.log('Hora ', hora);
      //console.log('UNIX time:', ActualDate.getTime());

      console.log(request.originalUrl);

      //print += `getOffer = ' + Offer[0].id }</br>`;
      //console.dir(Offer);
      console.log(`resultado Offert ${param.OfferGUID}.`);
/*
      // Inserto Click
      const Click = await db.collection('CampaignsClicks').insertOne({
        "OfferGUID": param.OfferGUID,
        "OfferID": param.OfferID,
        "Date": dia,
        "Month": mes,
        "Year": ano,
        "Hours": hora,
        "SubPubID": param.SubPubID,
        "ClickID": param.ClickID,
        "Event": "Click",
        "tr_sub0": param.tr_sub0,
        "tr_sub1": param.tr_sub1,
        "tr_sub2": param.tr_sub2,
        "tr_sub3": param.tr_sub3,
        "tr_sub4": param.tr_sub4,
        "tr_sub5": param.tr_sub5,
        "tr_sub6": param.tr_sub6,
        "tr_sub7": param.tr_sub7,
        "tr_sub8": param.tr_sub8,
        "tr_sub9": param.tr_sub9,
        "IDFA": param.IDFA,
        "AndroidAdID": param.Android_AdID,
        "AndroidID": param.Android_ID,
        "MacAddress": param.Mac_Address,
        "IMEI": param.IMEI,
        "OSfamilyVersion": OSfamilyVersion,
        "OSfamily": OSfamily,
        "OSmajor": OSmajor,
        "OSminor": OSminor,
        "OSpatch": OSpatch,
        "OSversion": OSversion,
        "CountryCode": ipCarrier.CountryCode,
        "CountryName": ipCarrier.CountryName,
        "CodeLanguage": CodeLanguage,
        "Domain": ipCarrier.Domain,
        "Latitude": ipCarrier.Latitude,
        "Longitude": ipCarrier.Longitude,
        "VPNProxyType": ipProxy.VPNProxyType,
        "VPNCountryCode": ipProxy.VPNCountryCode,
        "VPNCountryName": ipProxy.VPNCountryName,
        "ControlIp": ControlIp,
        "CreationDate": ActualDate
      }, (err, result) => {
        if (err) throw err;
        console.log("CampaignsClicks: Los datos han sido insertados satisfactoriamente!");
        //print(err);
        //console.log(err);
        console.log(result.insertedId);
        //MongoClient.disconnect();
      });
*/  
      // Buscar OfferID / SubPubID

      const OfferUpdate = await db.collection('Offers').findOneAndUpdate(
        { id: param.OfferID, "Totals.SubPubID": param.SubPubID, "Totals.Date": ActualDate.toDateString() },
        { $push: { Totals: { SubPubID: param.SubPubID, Date: ActualDate.toDateString() } } }
        , (err, result) => {
          console.log(result);
          if (err) {
            console.log(Error); //throw err;
          } else {
            if (result.value == null) {
              const OfferInsert = db.collection('Offers').findOneAndUpdate(
                { id: param.OfferID },
                { $push: { Totals: { SubPubID: param.SubPubID, Date: ActualDate.toDateString() } } }
                , (err, result) => {
                  if (err) { console.log(Error); }
                  else { console.log('OK !!!!!!!!!!'); }
                });
              console.log("Offers: INSERT los datos han sido insertados satisfactoriamente!");
            } else {
              console.log("Offers: UPDATE los datos han sido insertados satisfactoriamente!");
            }
          }
          //console.log(result.insertedId);
        });
      //Totals: { SubPubID: '12345' }

      // Salida en PANTALLA 
      response.send(print);
      // 
      // ** DERIVACION A LA URL DE ---------------------
      /** 
      response.writeHead(301,
        {Location: 'http://google.com'}
      );
      response.end();
      */
      await client.close();
    }
    catch (Error) {
      //client.close();
      console.error(Error);
    }
  }

}
/*
response.writeHead(200, { "Content-Type": "text/plain" });
response.end("Hello World!");
*/
