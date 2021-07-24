db.connection().collection(collection).updateMany(
    { "Advertiser.AdvertiserID": 1 },

    {
        $set:
        {
            "Advertiser": {
                "AdvertiserID": 1,
                "Advertiser": "Clicxy XXXX",
                "Parameters": "&sub1={CampaignClickGUID}&sub2={SubPubID}",
                "BlockSubsource": true,
                "SubPub1": true,
                "SubPub2": true,
                "SubPub3": false,
                "Separator": "_",
                "AccountManager":
                    "Teresa Manrique",
                    "AccountManagerPhoto": "avatar_2x.png",
                    "ApiKey": "6d7da78fa8f149a5873af40a6200e18768e261dc36ea49fb88209614160553b6",
                    "PrepayTerms": 1000.0000
            }
        }
    }, {
        multi: true
    })


