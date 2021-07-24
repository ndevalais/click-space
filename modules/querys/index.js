const queryOffer = `SELECT Offers.OfferID, (SELECT
  O.OfferID AS [id],
  O.OfferID AS [OfferID],
  O.OfferGUID AS [OfferGUID],
  O.Offer AS [Offer],
  O.StatusID AS [StatusID],
  T.[Description] AS [Status],
  O.PostBackURL AS [PostBackURL],
  O.Proxy AS [Proxy],
  O.Cost AS [Cost],
  O.CreationDate AS [CreationDate],
  CH.CampaignHeadID AS [CampaignHead.CampaignHeadID],
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
  C.CampaignID AS [Campaign.CampaignID],
  C.Campaign AS [Campaign.Campaign],
  C.CampaignTypeID AS [Campaign.CampaignTypeID],
  C.URL AS [Campaign.URL],
  C.StatusID AS [Campaign.StatusID],
  TC.[Description] AS [Campaign.Status],
  C.DeviceID AS [Campaign.DeviceID],
  CASE WHEN  C.DeviceVersion IS NULL THEN 0 ELSE CAST(C.DeviceVersion AS INT) END AS [Campaign.DeviceVersion],
  C.Countrys AS [Campaign.Countrys],
  ISNULL(C.BudgetAmount,0) AS [Campaign.BudgetAmount],
  ISNULL(C.BudgetQuantity,0) AS [Campaign.BudgetQuantity],
  ISNULL(C.DailyAmount,0) AS [Campaign.DailyAmount],
  ISNULL(C.DailyQuantity,0) AS [Campaign.DailyQuantity],
  C.Leads AS [Campaign.Leads],
  C.EventsGoal AS [Campaign.EventsGoal],
  C.LeadsGoal AS [Campaign.LeadsGoal],
  C.Strictly AS [Campaign.Strictly],
  C.Revenue AS [Campaign.Revenue],
  C.Cost AS [Campaign.Cost],
  C.Proxy AS [Campaign.Proxy],
  C.CarrierTypeID AS [Campaign.CarrierTypeID],
  C.CarriersTypes AS [Campaign.CarriersTypes],
  ISNULL(C.CitiesTypes,'') AS [Campaign.CitiesTypes],
  C.DeviceIdentifier AS [Campaign.DeviceIdentifier],
  C.Languages AS [Campaign.Languages],
  C.AvailableIPs AS [Campaign.AvailableIPs],
  C.Featured AS [Campaign.Featured],
  C.ForeignCampaignID AS [Campaign.ForeignCampaignID],
  ISNULL(C.isAppName,0) AS [Campaign.isAppName],
  ISNULL(C.isFraude,0) AS [Campaign.isFraude],
  C.DailyQuantityClick AS [Campaign.DailyQuantityClick],
  C.StatusAffiliTest AS [Campaign.StatusTest],
  C.DetailsAffiliTest AS [Campaign.DetailsTest],
  C.CountAffiliTest AS [Campaign.CountTest],
  C.RedirAffiliText AS [Campaign.RedirText],
  C.[eventsName1] AS [Campaign.eventsName1],
  C.[eventPayOut1] AS [Campaign.eventPayOut1],
  C.[eventCost1] AS [Campaign.eventCost1],
  C.[eventProxy1] AS [Campaign.eventProxy1],
  C.[eventOptimizarInstall1] AS [Campaign.eventOptimizarInstall1],
  C.[eventOptimizarEvent1] AS [Campaign.eventOptimizarEvent1],
  C.[eventsName2] AS [Campaign.eventsName2],
  C.[eventPayOut2] AS [Campaign.eventPayOut2],
  C.[eventCost2] AS [Campaign.eventCost2],
  C.[eventProxy2] AS [Campaign.eventProxy2],
  C.[eventOptimizarEvent11] AS [Campaign.eventOptimizarEvent11],
  C.[eventOptimizarEvent2] AS [Campaign.eventOptimizarEvent2],
  C.[eventsName3] AS [Campaign.eventsName3],
  C.[eventPayOut3] AS [Campaign.eventPayOut3],
  C.[eventCost3] AS [Campaign.eventCost3],
  C.[eventProxy3] AS [Campaign.eventProxy3],
  C.[eventOptimizarEvent21] AS [Campaign.eventOptimizarEvent21],
  C.[eventOptimizarEvent3] AS [Campaign.eventOptimizarEvent3],
  A.AdvertiserID AS [Advertiser.AdvertiserID],
  A.Advertiser AS [Advertiser.Advertiser],
  A.PostBackURL AS [Advertiser.Parameters],
  ISNULL(A.BlockSubsource,0) AS [Advertiser.BlockSubsource],
  ISNULL(A.SubPub1,0) AS [Advertiser.SubPub1],
  ISNULL(A.SubPub2,0) AS [Advertiser.SubPub2],
  ISNULL(A.SubPub3,0) AS [Advertiser.SubPub3],
  ISNULL(A.Separetor,'-') AS [Advertiser.Separetor],
  ISNULL(A.AccountManagerID,0) AS [Advertiser.AccountManagerID],
  ISNULL(USR.Name,'') AS [Advertiser.AccountManager],
  ISNULL(USR.[Image],'') AS [Advertiser.AccountManagerPhoto],
  ISNULL(USR.EMail,'') AS [Advertiser.AccountManagerEmail],
  A.ApiKey AS [Advertiser.ApiKey],
  A.PrepayTerms AS [Advertiser.PrepayTerms],
  A.Prepay AS [Advertiser.Prepay],
  S.SupplierID AS [Supplier.SupplierID],
  S.Supplier AS [Supplier.Supplier],
  ISNULL(O.PostBackURL,S.PostBackURL) AS [Supplier.PostBackURL],
  S.PostBackSendEvents AS [Supplier.PostBackSendEvents],
  S.InstallAlternativeName AS [Supplier.InstallAlternativeName],
  S.StatusID AS [Supplier.StatusID],
  S.AdvertiserID AS [Supplier.AdvertiserID],
  ISNULL(S.AccountManagerID,0) AS [Supplier.AccountManagerID],
  ISNULL(USRS.Name,'') AS [Supplier.AccountManager],
  ISNULL(USRS.[Image],'') AS [Supplier.AccountManagerPhoto],
  ISNULL(USRS.EMail,'') AS [Supplier.AccountManagerEmail],
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
WHERE 
  O.OfferID = Offers.OfferID
ORDER BY O.OfferID DESC
FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) AS Offer 
FROM Offers 
WHERE CampaignID = __CAMPAIGN_ID__`;

const queryOfferGUID = `SELECT Offers.OfferID, (SELECT
  O.OfferID AS [id],
  O.OfferID AS [OfferID],
  O.OfferGUID AS [OfferGUID],
  O.Offer AS [Offer],
  O.StatusID AS [StatusID],
  T.[Description] AS [Status],
  O.PostBackURL AS [PostBackURL],
  O.Proxy AS [Proxy],
  O.Cost AS [Cost],
  O.CreationDate AS [CreationDate],
  CH.CampaignHeadID AS [CampaignHead.CampaignHeadID],
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
  C.CampaignID AS [Campaign.CampaignID],
  C.Campaign AS [Campaign.Campaign],
  C.CampaignTypeID AS [Campaign.CampaignTypeID],
  C.URL AS [Campaign.URL],
  C.StatusID AS [Campaign.StatusID],
  TC.[Description] AS [Campaign.Status],
  C.DeviceID AS [Campaign.DeviceID],
  CASE WHEN  C.DeviceVersion IS NULL THEN 0 ELSE CAST(C.DeviceVersion AS INT) END AS [Campaign.DeviceVersion],
  C.Countrys AS [Campaign.Countrys],
  ISNULL(C.BudgetAmount,0) AS [Campaign.BudgetAmount],
  ISNULL(C.BudgetQuantity,0) AS [Campaign.BudgetQuantity],
  ISNULL(C.DailyAmount,0) AS [Campaign.DailyAmount],
  ISNULL(C.DailyQuantity,0) AS [Campaign.DailyQuantity],
  C.Leads AS [Campaign.Leads],
  C.EventsGoal AS [Campaign.EventsGoal],
  C.LeadsGoal AS [Campaign.LeadsGoal],
  C.Strictly AS [Campaign.Strictly],
  C.Revenue AS [Campaign.Revenue],
  C.Cost AS [Campaign.Cost],
  C.Proxy AS [Campaign.Proxy],
  C.CarrierTypeID AS [Campaign.CarrierTypeID],
  C.CarriersTypes AS [Campaign.CarriersTypes],
  ISNULL(C.CitiesTypes,'') AS [Campaign.CitiesTypes],
  C.DeviceIdentifier AS [Campaign.DeviceIdentifier],
  C.Languages AS [Campaign.Languages],
  C.AvailableIPs AS [Campaign.AvailableIPs],
  C.Featured AS [Campaign.Featured],
  C.ForeignCampaignID AS [Campaign.ForeignCampaignID],
  ISNULL(C.isAppName,0) AS [Campaign.isAppName],
  ISNULL(C.isFraude,0) AS [Campaign.isFraude],
  C.DailyQuantityClick AS [Campaign.DailyQuantityClick],
  C.StatusAffiliTest AS [Campaign.StatusTest],
  C.DetailsAffiliTest AS [Campaign.DetailsTest],
  C.CountAffiliTest AS [Campaign.CountTest],
  C.RedirAffiliText AS [Campaign.RedirText],
  C.[eventsName1] AS [Campaign.eventsName1],
  C.[eventPayOut1] AS [Campaign.eventPayOut1],
  C.[eventCost1] AS [Campaign.eventCost1],
  C.[eventProxy1] AS [Campaign.eventProxy1],
  C.[eventOptimizarInstall1] AS [Campaign.eventOptimizarInstall1],
  C.[eventOptimizarEvent1] AS [Campaign.eventOptimizarEvent1],
  C.[eventsName2] AS [Campaign.eventsName2],
  C.[eventPayOut2] AS [Campaign.eventPayOut2],
  C.[eventCost2] AS [Campaign.eventCost2],
  C.[eventProxy2] AS [Campaign.eventProxy2],
  C.[eventOptimizarEvent11] AS [Campaign.eventOptimizarEvent11],
  C.[eventOptimizarEvent2] AS [Campaign.eventOptimizarEvent2],
  C.[eventsName3] AS [Campaign.eventsName3],
  C.[eventPayOut3] AS [Campaign.eventPayOut3],
  C.[eventCost3] AS [Campaign.eventCost3],
  C.[eventProxy3] AS [Campaign.eventProxy3],
  C.[eventOptimizarEvent21] AS [Campaign.eventOptimizarEvent21],
  C.[eventOptimizarEvent3] AS [Campaign.eventOptimizarEvent3],
  A.AdvertiserID AS [Advertiser.AdvertiserID],
  A.Advertiser AS [Advertiser.Advertiser],
  A.PostBackURL AS [Advertiser.Parameters],
  ISNULL(A.BlockSubsource,0) AS [Advertiser.BlockSubsource],
  ISNULL(A.SubPub1,0) AS [Advertiser.SubPub1],
  ISNULL(A.SubPub2,0) AS [Advertiser.SubPub2],
  ISNULL(A.SubPub3,0) AS [Advertiser.SubPub3],
  ISNULL(A.Separetor,'-') AS [Advertiser.Separetor],
  ISNULL(A.AccountManagerID,0) AS [Advertiser.AccountManagerID],
  ISNULL(USR.Name,'') AS [Advertiser.AccountManager],
  ISNULL(USR.[Image],'') AS [Advertiser.AccountManagerPhoto],
  ISNULL(USR.EMail,'') AS [Advertiser.AccountManagerEmail],
  A.ApiKey AS [Advertiser.ApiKey],
  A.PrepayTerms AS [Advertiser.PrepayTerms],
  A.Prepay AS [Advertiser.Prepay],
  S.SupplierID AS [Supplier.SupplierID],
  S.Supplier AS [Supplier.Supplier],
  ISNULL(O.PostBackURL,S.PostBackURL) AS [Supplier.PostBackURL],
  S.PostBackSendEvents AS [Supplier.PostBackSendEvents],
  S.InstallAlternativeName AS [Supplier.InstallAlternativeName],
  S.StatusID AS [Supplier.StatusID],
  S.AdvertiserID AS [Supplier.AdvertiserID],
  ISNULL(S.AccountManagerID,0) AS [Supplier.AccountManagerID],
  ISNULL(USRS.Name,'') AS [Supplier.AccountManager],
  ISNULL(USRS.[Image],'') AS [Supplier.AccountManagerPhoto],
  ISNULL(USRS.EMail,'') AS [Supplier.AccountManagerEmail],
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
WHERE 
  O.OfferID = Offers.OfferID
ORDER BY O.OfferID DESC
FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) AS Offer 
FROM Offers 
WHERE CampaignID = (SELECT CampaignID FROM Offers WHERE OfferGUID = '__OFFERGUID__')`;

const queryCamaignActive = `SELECT (SELECT distinct O.CampaignID
FROM dbo.Offers AS O
  JOIN dbo.Campaigns CA ON O.CampaignID = CA.CampaignID
  JOIN dbo.CampaignsHead CH ON CH.CampaignHeadID = CA.CampaignHeadID
  JOIN dbo.Types AS T ON CA.StatusID = T.TypeID AND T.TypeGroup = 'STATUS'
WHERE CA.StatusID = 'A'
  AND O.StatusID = 'A'
  AND CH.MarcketURL IS NOT NULL
ORDER  by O.CampaignID
FOR JSON PATH , WITHOUT_ARRAY_WRAPPER) as Campaigns`;

const queryCampaignHead = `SELECT
(SELECT
  CH.CampaignHeadID AS [CampaignHead.CampaignHeadID],
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
  ISNULL(CH.Icon72,'') AS [CampaignHead.Icon72]
FROM [dbo].[CampaignsHead] CH 
  LEFT JOIN (SELECT CampaignHeadID, SUM(CAST(DailyAmount AS BIGINT)) as SumDailyAmount, SUM(CAST(DailyQuantity AS BIGINT)) as SumDailyQuantity
  FROM dbo.Campaigns
  GROUP BY  CampaignHeadID ) SCH ON SCH.CampaignHeadID = CH.CampaignHeadID
	LEFT JOIN [dbo].[Types] DEV ON CH.DeviceID = DEV.TypeID AND DEV.TypeGroup = 'DEVICES'
	LEFT JOIN [dbo].[Types] ANDROID ON CH.DeviceVersion = ANDROID.TypeID AND ANDROID.TypeGroup = 'ANDROID'
	LEFT JOIN [dbo].[Types] IOS ON CH.DeviceVersion = IOS.TypeID AND IOS.TypeGroup = 'iOS'
	LEFT JOIN [dbo].[Types] CAT ON CH.CampaignCategoryID = CAT.TypeID AND CAT.TypeGroup = 'CAMPAIGNCATEGORY'
WHERE 
  CH.CampaignHeadID = __CAMPAIGN_HEAD_ID__
ORDER BY CH.CampaignHeadID DESC
FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) AS CampaignHead`;

const queryCampaign = `SELECT (
  SELECT
    C.CampaignID AS [Campaign.CampaignID],
    C.Campaign AS [Campaign.Campaign],
    C.CampaignTypeID AS [Campaign.CampaignTypeID],
    C.URL AS [Campaign.URL],
    C.StatusID AS [Campaign.StatusID],
    TC.[Description] AS [Campaign.Status],
    C.DeviceID AS [Campaign.DeviceID],
    CASE WHEN  C.DeviceVersion IS NULL THEN 0 ELSE CAST(C.DeviceVersion AS INT) END AS [Campaign.DeviceVersion],
    C.Countrys AS [Campaign.Countrys],
    ISNULL(C.BudgetAmount,0) AS [Campaign.BudgetAmount],
    ISNULL(C.BudgetQuantity,0) AS [Campaign.BudgetQuantity],
    ISNULL(C.DailyAmount,0) AS [Campaign.DailyAmount],
    ISNULL(C.DailyQuantity,0) AS [Campaign.DailyQuantity],
    C.Leads AS [Campaign.Leads],
    C.EventsGoal AS [Campaign.EventsGoal],
    C.LeadsGoal AS [Campaign.LeadsGoal],
    C.Strictly AS [Campaign.Strictly],
    C.Revenue AS [Campaign.Revenue],
    C.Cost AS [Campaign.Cost],
    C.Proxy AS [Campaign.Proxy],
    C.CarrierTypeID AS [Campaign.CarrierTypeID],
    C.CarriersTypes AS [Campaign.CarriersTypes],
    ISNULL(C.CitiesTypes,'') AS [Campaign.CitiesTypes],
    C.DeviceIdentifier AS [Campaign.DeviceIdentifier],
    C.Languages AS [Campaign.Languages],
    C.AvailableIPs AS [Campaign.AvailableIPs],
    C.Featured AS [Campaign.Featured],
    C.ForeignCampaignID AS [Campaign.ForeignCampaignID],
    ISNULL(C.isAppName,0) AS [Campaign.isAppName],
    ISNULL(C.isFraude,0) AS [Campaign.isFraude],
    C.DailyQuantityClick AS [Campaign.DailyQuantityClick],
    C.StatusAffiliTest AS [Campaign.StatusTest],
    C.DetailsAffiliTest AS [Campaign.DetailsTest],
    C.CountAffiliTest AS [Campaign.CountTest],
    C.RedirAffiliText AS [Campaign.RedirText],
    C.[eventsName1] AS [Campaign.eventsName1],
    C.[eventPayOut1] AS [Campaign.eventPayOut1],
    C.[eventCost1] AS [Campaign.eventCost1],
    C.[eventProxy1] AS [Campaign.eventProxy1],
    C.[eventOptimizarInstall1] AS [Campaign.eventOptimizarInstall1],
    C.[eventOptimizarEvent1] AS [Campaign.eventOptimizarEvent1],
    C.[eventsName2] AS [Campaign.eventsName2],
    C.[eventPayOut2] AS [Campaign.eventPayOut2],
    C.[eventCost2] AS [Campaign.eventCost2],
    C.[eventProxy2] AS [Campaign.eventProxy2],
    C.[eventOptimizarEvent11] AS [Campaign.eventOptimizarEvent11],
    C.[eventOptimizarEvent2] AS [Campaign.eventOptimizarEvent2],
    C.[eventsName3] AS [Campaign.eventsName3],
    C.[eventPayOut3] AS [Campaign.eventPayOut3],
    C.[eventCost3] AS [Campaign.eventCost3],
    C.[eventProxy3] AS [Campaign.eventProxy3],
    C.[eventOptimizarEvent21] AS [Campaign.eventOptimizarEvent21],
    C.[eventOptimizarEvent3] AS [Campaign.eventOptimizarEvent3]
  FROM [dbo].[Campaigns] C
    JOIN [dbo].[Types] TC ON C.StatusID = TC.TypeID AND TC.TypeGroup = 'STATUS'
  WHERE C.CampaignID = __CAMPAIGN_ID__
  ORDER BY C.CampaignID DESC
  FOR JSON PATH , WITHOUT_ARRAY_WRAPPER) as Campaign`;


queryAdvertiser = `SELECT (
  SELECT
    A.AdvertiserID AS [Advertiser.AdvertiserID],
    A.Advertiser AS [Advertiser.Advertiser],
    A.PostBackURL AS [Advertiser.Parameters],
    ISNULL(A.BlockSubsource,0) AS [Advertiser.BlockSubsource],
    ISNULL(A.SubPub1,0) AS [Advertiser.SubPub1],
    ISNULL(A.SubPub2,0) AS [Advertiser.SubPub2],
    ISNULL(A.SubPub3,0) AS [Advertiser.SubPub3],
    ISNULL(A.Separetor,'-') AS [Advertiser.Separetor],
    ISNULL(A.AccountManagerID,0) AS [Advertiser.AccountManagerID],
    ISNULL(USR.Name,'') AS [Advertiser.AccountManager],
    ISNULL(USR.[Image],'') AS [Advertiser.AccountManagerPhoto],
    ISNULL(USR.[EMail],'') AS [Advertiser.AccountManagerEMail],
    A.ApiKey AS [Advertiser.ApiKey],
    A.PrepayTerms AS [Advertiser.PrepayTerms],
    A.Prepay AS [Advertiser.Prepay]
  FROM [dbo].[Advertisers] A 
    LEFT JOIN [dbo].[Users] USR ON A.AccountManagerID = USR.UserID
  WHERE A.AdvertiserID = __ADVERTISER_ID__
  ORDER BY A.AdvertiserID DESC
  FOR JSON PATH , WITHOUT_ARRAY_WRAPPER) Advertiser`;


const querySupplier = `SELECT (
  SELECT 
    S.SupplierID AS [Supplier.SupplierID],
    S.Supplier AS [Supplier.Supplier],
    S.PostBackURL AS [Supplier.PostBackURL],
    S.PostBackSendEvents AS [Supplier.PostBackSendEvents],
    S.InstallAlternativeName AS [Supplier.InstallAlternativeName],
    S.StatusID AS [Supplier.StatusID],
    S.AdvertiserID AS [Supplier.AdvertiserID],
    ISNULL(S.AccountManagerID,0) AS [Supplier.AccountManagerID],
    ISNULL(S.AccountManagerID,0) AS [Supplier.AccountManagerID],
    ISNULL(USRS.Name,'') AS [Supplier.AccountManager],
    ISNULL(USRS.[Image],'') AS [Supplier.AccountManagerPhoto],
    S.ApiKey AS [Supplier.ApiKey],
    S.Click2 AS [Supplier.Click2],
    S.GroupID AS [Supplier.GroupID]
  FROM 
    [dbo].[Suppliers] S 
    LEFT JOIN [dbo].[Users] USRS ON S.AccountManagerID = USRS.UserID
  WHERE S.SupplierID = __SUPPLIER_ID__
  ORDER BY S.SupplierID DESC
  FOR JSON PATH , WITHOUT_ARRAY_WRAPPER) as Supplier `;

module.exports = {
  offer: queryOffer,
  OfferGUID: queryOfferGUID,
  CampaignsActive: queryCamaignActive,
  CampaignHead: queryCampaignHead,
  Campaign: queryCampaign,
  Advertiser: queryAdvertiser,
  Supplier: querySupplier
}