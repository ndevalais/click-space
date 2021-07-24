//TODO: Make configurable from mongo too
module.exports = {
   CampaignClickGUID: '<%= param.insertedClickId %>',  // the ObjectID Of the last succesfully inserted CLICK
   SubPubID: '<%= param.subpubid %>',
   SubPubHash: '<%= param.subpubhash %>',
   HashPubId: '<%= context.offer.Supplier.SupplierID %>',
   ClickID: '<%= context.click.ClickID %>',
   IP: '<%= param.SourceIP %>',
   Android_AdID: '<%= param.android_adid %>',
   Android_ID: '<%= param.android_id %>',
   IDFA: '<%= param.idfa %>',
   IDFA: '<%= param.tr_sub2 %>',
   tr_sub1: '<%= param.tr_sub1 %>',
   tr_sub2: '<%= param.tr_sub2 %>',
   tr_sub3: '<%= param.tr_sub3 %>',
   tr_sub4: '<%= param.tr_sub4 %>',
   p1: '<%= context.click.ExtraParams.p1 %>',
   p2: '<%= context.click.ExtraParams.p2 %>',
   p3: '<%= context.click.ExtraParams.p3 %>',
   p4: '<%= context.click.ExtraParams.p4 %>',
   p5: '<%= context.click.ExtraParams.p1 %>',
   Language: '<%= param.Language %>',
   UserAgent: '<%=  param.UserAgent %>'
}


/* LEAVING HERE FOR REF PURPOSES */
/*
{
   "status":"all_validators_ok",
   "param":{
      "insertedClickId":"5c79f1bf24c93754086c185d"
      "subpubid":"99999",
      "android_adid":"test20190604",
      "clickid":"test_TEST-REDIRECCIONAMIENTO-POR-DEVICE_20190604",
      "offerguid":"3D7DEE00-463C-E911-85B3-2818780EF331",
      "SourceIP":"18.231.122.0",
      "UserAgent":"PostmanRuntime/7.6.0",
      "AdditionalIPInfo":{
         "IP":"18.231.122.0",
         "IP_No":"317159936",
         "CountryCode":"BR",
         "CountryName":"Brazil",
         "CityName":"Sao Paulo",
         "Latitude":-23.547501,
         "Longitude":-46.636108,
         "ISP":"Amazon Data Services Brazil",
         "Domain":"amazon.com",
         "MobileBrand":"-"
      },
      "AdditionalProxyInfo":{
         "VPNProxyType":"DCH",
         "VPNCountryCode":"BR",
         "VPNCountryName":"Brazil"
      },
      "AdditionalUserAgentInfo":{
         "browser":{
            "name":"Other",
            "version":"",
            "family":"Other",
            "major":null,
            "minor":null,
            "patch":null
         },
         "os":{
            "name":"Other",
            "version":"",
            "family":"Other",
            "major":"",
            "minor":"",
            "patch":""
         }
      }
   },
   "context":{
      "offer":{
         "_id":"5c79f1bf24c93754086c185d",
         "id":2324294,
         "OfferID":2324294,
         "OfferGUID":"3D7DEE00-463C-E911-85B3-2818780EF331",
         "Offer":"URL TEST LINK",
         "StatusID":"A",
         "Status":"Active",
         "Proxy":100,
         "Cost":1,
         "CampaignHead":{
            "CampaignHead":"Skyscanner para TEST LINK",
            "Device":"All",
            "CampaignCategory":"Books & Reference",
            "DeviceVersionDesc":"",
            "DailyQuantity":0,
            "DailyAmount":0,
            "SumDailyQuantity":1000,
            "CR":12,
            "CRMin":0,
            "TimeInstall":0,
            "TimeInstallMin":0,
            "PackageName":"415458524",
            "DeviceVersion":"0",
            "VPNCheck":0,
            "LanguageCheck":0,
            "PrepayTerms":0,
            "Prepay":false,
            "Icon72":"http://is4.mzstatic.com/image/thumb/Purple19/v4/ab/2d/16/ab2d1693-9686-4774-be26-8f8f93c05a5f/mzl.lffwpamk.png/175x175bb-85.jpg"
         },
         "Campaigns":{
            "CampaignID":1440,
            "Campaign":"URL TEST LINK",
            "URL":"https://itunes.apple.com/br/app/skyscanner-compare-passagens/id415458524?mt=8?clickid={CampaignClickGUID}&SubPubID={SubPubID}",
            "StatusID":"A",
            "Status":"Active",
            "DeviceID":"NON",
            "DeviceVersion":0,
            "Countrys":"11",
            "BudgetAmount":0,
            "BudgetQuantity":0,
            "DailyAmount":0,
            "DailyQuantity":1000,
            "Revenue":1,
            "Cost":1,
            "Proxy":100,
            "CarriersTypes":"ALL-WIFI-SI",
            "CitiesTypes":"",
            "Languages":"ES,",
            "AvailableIPs":1,
            "Featured":0,
            "isAppName":0,
            "DailyQuantityClick":0,
            "StatusTest":0,
            "DetailsTest":"",
            "CountTest":2118,
            "RedirText":1
         },
         "Advertiser":{
            "AdvertiserID":19,
            "Advertiser":"VENTAS",
            "BlockSubsource":false,
            "SubPub1":false,
            "SubPub2":false,
            "SubPub3":false,
            "Separetor":"-",
            "AccountManager":"Florencia Schenone",
            "AccountManagerPhoto":"florencia.jpg",
            "PrepayTerms":0
         },
         "Supplier":{
            "SupplierID":1721,
            "Supplier":"RadiumAd",
            "PostBackURL":"https://radiumad.com/s2s?token=7fbbc9a6-3c3c-11e9-82dd-901b0ededfcf&transaction_id={ClickID}",
            "PostBackSendEvents":false,
            "StatusID":"A",
            "AccountManagerID":7,
            "AccountManager":"Florencia Schenone",
            "AccountManagerPhoto":"florencia.jpg",
            "ApiKey":"a4be89e7bfb74f26b5eb03af6441725ccc702814f6c24a6ab0def038d099d95b",
            "GroupID":5
         },
         "Totals":"",
         "points":10
      }
   },
   "validatorsResult":[
      {
         "name":"check_if_proxy"
      },
      {
         "name":"ip_location"
      }
   ]
}
*/
