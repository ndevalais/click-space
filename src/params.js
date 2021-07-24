
module.exports = {
  /**
   * getCarrier
   * @ip = IPv4
   */

  getParams: async (request, print, debug = false) => {
    let Debug = false;
    let OfferGUID = '';
    let OfferID = '';
    let ClickID = '';
    let SubPubID = '';
    let Evento = 'Click';
    let tr_sub0 = '';
    let tr_sub1 = '';
    let tr_sub2 = '';
    let tr_sub3 = '';
    let tr_sub4 = '';
    let tr_sub5 = '';
    let tr_sub6 = '';
    let tr_sub7 = '';
    let tr_sub8 = '';
    let tr_sub9 = '';
    let p1 = '';
    let p2 = '';
    let p3 = '';
    let p4 = '';
    let p5 = '';
    let IDFA = '';
    let Android_AdID = '';
    let Mac_Address = '';
    let Android_ID = '';
    let IMEI = '';

    print = print + 'Obtengo parametros --------------------------------------</br>';
    for (var key in request.query) {
      request.query[key.toLowerCase()] = request.query[key];
      if (debug) console.log('Parametro ' + key + ' = ' + request.query[key]);
      if (key.toLowerCase() == 'offerguid') OfferGUID = request.query[key];
      if (key.toLowerCase() == 'offerid') OfferID = request.query[key];
      if (key.toLowerCase() == 'clickid') ClickID = request.query[key];
      if (key.toLowerCase() == 'subpubid') SubPubID = request.query[key];

      if (key.toLowerCase() == 'event') Evento = request.query[key];
      if (key.toLowerCase() == 'tr_sub0') tr_sub0 = request.query[key];
      if (key.toLowerCase() == 'tr_sub1') tr_sub1 = request.query[key];
      if (key.toLowerCase() == 'tr_sub2') tr_sub2 = request.query[key];
      if (key.toLowerCase() == 'tr_sub3') tr_sub3 = request.query[key];
      if (key.toLowerCase() == 'tr_sub4') tr_sub4 = request.query[key];
      if (key.toLowerCase() == 'tr_sub5') tr_sub5 = request.query[key];
      if (key.toLowerCase() == 'tr_sub6') tr_sub6 = request.query[key];
      if (key.toLowerCase() == 'tr_sub7') tr_sub7 = request.query[key];
      if (key.toLowerCase() == 'tr_sub8') tr_sub8 = request.query[key];
      if (key.toLowerCase() == 'tr_sub9') tr_sub9 = request.query[key];
      if (key.toLowerCase() == 'p1') p1 = request.query[key];
      if (key.toLowerCase() == 'p2') p2 = request.query[key];
      if (key.toLowerCase() == 'p3') p3 = request.query[key];
      if (key.toLowerCase() == 'p4') p4 = request.query[key];
      if (key.toLowerCase() == 'p5') p5 = request.query[key];

      if (key.toLowerCase() == 'idfa') IDFA = request.query[key];
      if (key.toLowerCase() == 'android_adid') Android_AdID = request.query[key];
      if (key.toLowerCase() == 'mac_address') Mac_Address = request.query[key];
      if (key.toLowerCase() == 'android_id') Android_ID = request.query[key];
      if (key.toLowerCase() == 'imei') IMEI = request.query[key];
      if (key.toLowerCase() == 'debug') Debug = request.query[key];
      print = print + ' Parametro ' + key + ' = ' + request.query[key] + '</br>';
    }

    // Imprimo Parametros recibidos **************************************
    /*print = print + 'OfferGUID = ' + OfferGUID + '</br>';
    print = print + 'OfferID = ' + OfferID + '</br>';
    print = print + 'SubPubID = ' + SubPubID + '</br>';
    print = print + 'ClickID = ' + ClickID + '</br>';

    print = print + 'event = ' + Evento + '</br>';
    print = print + 'tr_sub0 = ' + tr_sub0 + '</br>';
    print = print + 'tr_sub1 = ' + tr_sub1 + '</br>';
    print = print + 'tr_sub2 = ' + tr_sub2 + '</br>';
    print = print + 'tr_sub3 = ' + tr_sub3 + '</br>';
    print = print + 'tr_sub4 = ' + tr_sub4 + '</br>';
    print = print + 'tr_sub5 = ' + tr_sub5 + '</br>';
    print = print + 'tr_sub6 = ' + tr_sub6 + '</br>';
    print = print + 'tr_sub7 = ' + tr_sub7 + '</br>';
    print = print + 'tr_sub8 = ' + tr_sub8 + '</br>';
    print = print + 'tr_sub9 = ' + tr_sub9 + '</br>';

    print = print + 'IDFA = ' + IDFA + '</br>';
    print = print + 'Android_AdID = ' + Android_AdID + '</br>';
    print = print + 'Mac_Address = ' + Mac_Address + '</br>';
    print = print + 'Android_ID = ' + Android_ID + '</br>';
    print = print + 'IMEI = ' + IMEI + '</br>';*/

    return {
      OfferGUID,
      OfferID,
      ClickID,
      SubPubID,
      Evento,
      tr_sub0,
      tr_sub1,
      tr_sub2,
      tr_sub3,
      tr_sub4,
      tr_sub5,
      tr_sub6,
      tr_sub7,
      tr_sub8,
      tr_sub9,
      p1,
      p2,
      p3,
      p4,
      p5,
      IDFA,
      Android_AdID,
      Mac_Address,
      Android_ID,
      IMEI,
      Debug,
      print
    };
  }
}