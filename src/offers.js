const sqlServer = require("../modules/db_sql/connect");
const mongo = require("../db/connect");
const collection = 'Offers';

module.exports = {
  Offers: function (request, response) {
    /*
    let debug = '</br>';
    debug = debug + 'Obtengo parametros --------------------------------------</br>';

    const queryUpdate = `SELECT (SELECT
        O.OfferID AS [id],
        O.OfferID AS [OfferID],
        O.OfferGUID AS [OfferGUID],
        O.Offer AS [Offer],
        O.StatusID AS [StatusID],
        T.[Description] AS [Status],
        O.PostBackURL AS [PostBackURL],
        O.Proxy AS [Proxy],
        O.Cost AS [Cost],
        CH.CampaignHead AS [CampaignHead.CampaignHead],
        ISNULL(DEV.[Description], '') AS [CampaignHead.Device],
        ISNULL(CAT.[Description], '') AS [CampaignHead.CampaignCategory],
        CASE WHEN CH.DeviceID = 'AND' THEN ISNULL(ANDROID.[Description], '') 
              WHEN CH.DeviceID = 'IOS' THEN ISNULL(IOS.[Description], '')
              ELSE '' END AS [CampaignHead.DeviceVersionDesc],
        ISNULL(CH.DailyQuantity,0) AS [CampaignHead.DailyQuantity],
        ISNULL(CH.DailyAmount,0) AS [CampaignHead.DailyAmount],
        SCH.SumDailyAmount AS [CampaignHead.SumDailyAmount],
        SCH.SumDailyQuantity AS [CampaignHead.SumDailyQuantity],
        ISNULL(CH.CR,0) AS [CampaignHead.CR],
        ISNULL(CH.CRMin, 0) AS [CampaignHead.CRMin],
        ISNULL(CH.TimeInstall,0) AS [CampaignHead.TimeInstall],
        ISNULL(CH.TimeInstallMin,0) AS [CampaignHead.TimeInstallMin],
        ISNULL(CH.PackageName,'') AS [CampaignHead.PackageName],
        ISNULL(CH.DeviceVersion,0)  AS [CampaignHead.DeviceVersion],
        CH.VPNCheck AS [CampaignHead.VPNCheck],
        CH.LanguageCheck AS [CampaignHead.LanguageCheck],
        ISNULL(CH.PrepayTerms,0) AS [CampaignHead.PrepayTerms],
        ISNULL(CH.Prepay ,0) AS [CampaignHead.Prepay],
        ISNULL(CH.Icon72,'') AS [CampaignHead.Icon72],
        C.CampaignID AS [Campaigns.CampaignID],
        C.Campaign AS [Campaigns.Campaign],
        C.URL AS [Campaigns.URL],
        C.StatusID AS [Campaigns.StatusID],
        TC.[Description] AS [Campaigns.Status],
        C.DeviceID AS [Campaigns.DeviceID],
        CASE WHEN  C.DeviceVersion IS NULL THEN 0 ELSE CAST(C.DeviceVersion AS INT) END AS [Campaigns.DeviceVersion],
        C.Countrys AS [Campaigns.Countrys],
        ISNULL(C.BudgetAmount,0) AS [Campaigns.BudgetAmount],
        ISNULL(C.BudgetQuantity,0) AS [Campaigns.BudgetQuantity],
        ISNULL(C.DailyAmount,0) AS [Campaigns.DailyAmount],
        ISNULL(C.DailyQuantity,0) AS [Campaigns.DailyQuantity],
        C.Leads AS [Campaigns.Leads],
        C.EventsGoal AS [Campaigns.EventsGoal],
        C.LeadsGoal AS [Campaigns.LeadsGoal],
        C.Strictly AS [Campaigns.Strictly],
        C.Revenue AS [Campaigns.Revenue],
        C.Cost AS [Campaigns.Cost],
        C.Proxy AS [Campaigns.Proxy],
        C.CarrierTypeID AS [Campaigns.CarrierTypeID],
        C.CarriersTypes AS [Campaigns.CarriersTypes],
        ISNULL(C.CitiesTypes,'') AS [Campaigns.CitiesTypes],
        C.DeviceIdentifier AS [Campaigns.DeviceIdentifier],
        C.Languages AS [Campaigns.Languages],
        C.AvailableIPs AS [Campaigns.AvailableIPs],
        C.Featured AS [Campaigns.Featured],
        C.ForeignCampaignID AS [Campaigns.ForeignCampaignID],
        ISNULL(C.isAppName,0) AS [Campaigns.isAppName],
        C.DailyQuantityClick AS [Campaigns.DailyQuantityClick],
        C.StatusAffiliTest AS [Campaigns.StatusTest],
        C.DetailsAffiliTest AS [Campaigns.DetailsTest],
        C.CountAffiliTest AS [Campaigns.CountTest],
        C.RedirAffiliText AS [Campaigns.RedirText],
        A.AdvertiserID AS [Advertiser.AdvertiserID],
        A.Advertiser AS [Advertiser.Advertiser],
        A.PostBackURL AS [Advertiser.Parameters],
        ISNULL(A.BlockSubsource,0) AS [Advertiser.BlockSubsource],
        ISNULL(A.SubPub1,0) AS [Advertiser.SubPub1],
        ISNULL(A.SubPub2,0) AS [Advertiser.SubPub2],
        ISNULL(A.SubPub3,0) AS [Advertiser.SubPub3],
        ISNULL(A.Separetor,'-') AS [Advertiser.Separetor],
        ISNULL(USR.Name,'') AS [Advertiser.AccountManager],
        ISNULL(USR.[Image],'') AS [Advertiser.AccountManagerPhoto],
        A.ApiKey AS [Advertiser.ApiKey],
        A.PrepayTerms AS [Advertiser.PrepayTerms],
        A.Prepay AS [Advertiser.Prepay],
        S.SupplierID AS [Supplier.SupplierID],
        S.Supplier AS [Supplier.Supplier],
        S.PostBackURL AS [Supplier.PostBackURL],
        S.PostBackSendEvents AS [Supplier.PostBackSendEvents],
        S.InstallAlternativeName AS [Supplier.InstallAlternativeName],
        S.StatusID AS [Supplier.StatusID],
        ISNULL(S.AccountManagerID,0) AS [Supplier.AccountManagerID],
        ISNULL(USRS.Name,'') AS [Supplier.AccountManager],
        ISNULL(USR.[Image],'') AS [Supplier.AccountManagerPhoto],
        S.ApiKey AS [Supplier.ApiKey],
        S.Click2 AS [Supplier.Click2],
        S.GroupID AS [Supplier.GroupID]
      FROM [dbo].[Offers] O WITH (NOLOCK) JOIN [dbo].[Campaigns] C ON  O.CampaignID = C.CampaignID
        JOIN [dbo].[Types] T ON O.StatusID = T.TypeID AND T.TypeGroup = 'STATUS'
        JOIN [dbo].[Types] TC ON C.StatusID = TC.TypeID AND TC.TypeGroup = 'STATUS'
        JOIN [dbo].[Advertisers] A ON C.AdvertiserID = A.AdvertiserID
        LEFT JOIN [dbo].[CampaignsHead] CH ON CH.CampaignHeadID = C.CampaignHeadID
        LEFT JOIN (SELECT CampaignHeadID, SUM(CAST(DailyAmount AS BIGINT)) as SumDailyAmount, SUM(CAST(DailyQuantity AS BIGINT)) as SumDailyQuantity
        FROM dbo.Campaigns
        GROUP BY  CampaignHeadID ) SCH ON SCH.CampaignHeadID = CH.CampaignHeadID
        LEFT JOIN [dbo].[Suppliers] S ON O.SupplierID = S.SupplierID
        LEFT JOIN [dbo].[Types] DEV ON CH.DeviceID = DEV.TypeID AND DEV.TypeGroup = 'DEVICES'
        LEFT JOIN [dbo].[Types] CAT ON CH.CampaignCategoryID = CAT.TypeID AND CAT.TypeGroup = 'CAMPAIGNCATEGORY'
        LEFT JOIN [dbo].[Types] IOS ON CH.DeviceVersion = IOS.TypeID AND IOS.TypeGroup = 'iOS'
        LEFT JOIN [dbo].[Types] ANDROID ON CH.DeviceVersion = ANDROID.TypeID AND ANDROID.TypeGroup = 'ANDROID'
        LEFT JOIN [dbo].[Users] USR ON A.AccountManagerID = USR.UserID
        LEFT JOIN [dbo].[Users] USRS ON S.AccountManagerID = USRS.UserID
      WHERE O.OfferID = __OFFER_ID__ AND
        C.StatusID = 'A'
      ORDER BY O.OfferID DESC
      FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) Offer `; // 
      
      sqlServer.connect(function (err, connection) {
        if (err) {
          console.log('FAIL ON CONNECT: ' + err.message);
        } else {
          console.log('Parametros');
          const offers = request.query.offers; //.split(','); //for (i in offers)  
          console.log(offers + ' param ');
          const query = queryUpdate.replace('__OFFER_ID__', offers);
          sqlServer.execute(connection, query, function (err, results) {
            if (err) {
              console.log('Error ' + results + ' rows');
            } else {
              if (results != undefined) {
                console.log('Resultado: ' + results.length);
  
                // Obtengo resultado de la consulta
                results.forEach(o => {               
                  if (o.Offer == null) {
                    console.log(' NO EXISTE ');
                  } else {
                    const offer = JSON.parse(o.Offer);
                    console.log(offer.OfferID); 
                    debug = offer;
                    
                    mongo.connect()
                      .then(db => {
                        db.collection(collection).findOne({ "id": offer.OfferID }, function(err, result) {
                          if (err) {
                            mongo.disconnect();
                            throw err; 
                          } else {
                              //console.log(result.Offer); 
                            if (result != null) {
                              console.log("Offer exist");
                              db.collection(collection).findOneAndUpdate({ "id": offer.OfferID }, offer, function (err, result) {
                                console.log(`Update a document into the collection ${collection}.`);
                                mongo.disconnect();
                              })
                            } else {
                              console.log("Offer doesn't exist");
                              db.collection(collection).insertOne(offer, function (err, result) {
                                console.log(`Inserted a document into the collection ${collection}.`);
                                mongo.disconnect();
                              })
                            }
                          }
                        });
                      });
                      
                  }
                });
              }
            }
          });
          console.log('fin parametros');
        }
      });

    //response.send(debug);
    response.setHeader('Content-Type', 'application/json');
    response.status(200);
    response.end(JSON.stringify({ a: debug }, null, 3));
    */
    return true;
  },

  getOffer: function(request, response, OfferGUID) {
    console.log('offers.getOffer *******************************');
    console.log(`offers.getOffer: Buscar la Oferta ${OfferGUID}.`);
    mongo.connect()
    .then(db => {
      db.collection('Offers').findOne({ "OfferGUID": OfferGUID }, function(err, result) {
        if (result) {
          console.log('Collection with id of \'' + collection + '\' was found its _self is \'' + result.id + '\'');
          mongo.disconnect();
          return result;
        } else { 
          mongo.disconnect();
          return false;
          console.dir( result );
        }
      });
    });
  }
}