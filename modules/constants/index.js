module.exports = {
    LENGTHS: {
        STRING_S: 50,
        STRING_M: 100,
        STRING_L: 150,
        STRING_XL: 255,
        STRING_XXL: 1024,
    },
    LANGS: ['es', 'en', 'fr', 'pt'],

    EVENTS_KEY_NAMES: {
        NEW_CLICK_CREATED: 'new_click_created',
        NEW_EVENT_ARRIVED: 'new_event_arrived',
        NEW_INSTALL_REGISTERED: 'new_install_registered',
        NEW_BLACKLIST_REGISTERED: 'new_blacklist_registered',
        NEW_DEBUG_CREATED: 'new_debug_created',
        UPD_ADVERTISER_PREPAY: 'upd_advertiser_prepay'
    },

    P_NAMES:{
        click:{
            SUBPUBID:"subpub_id",
            OFFER_GUID:"offer_id",
            SUBPUBHASH:"sph",
            P2:"p2",
            P2HASH:'p2h',
            CAMPAIGN_CLICK_GUID:'trace_id',
            IDFA:'idfa',
            GAID:'gaid',
            CLICKID:'click_id',
            IP_NUM: "AdditionalIPInfo.IP_No",
            TR_SUB1:'tr_sub1',
            TR_SUB2:'tr_sub2',
            TR_SUB3:'tr_sub3',
            TR_SUB4:'tr_sub4',
            P1:'p1',
            P2:'p2',
            P3:'p3',
            P4:'p4',
            P5:'p5',
            USER_AGENT:'UserAgent',
            SOURCE_IP:'SourceIP',
            name:'click',
            EVENT: 'event'
        }        
    },

    Reject_reasons: {
        ctit_anomalies: "CTIT anomalies are attributed clicks that have been blocked based on unreasonable CTIT (click to install time).",
        store_install_validation: "Installs that failed validation from the App Store",
        site_blacklist: "Installs coming from Site IDs that AppsFlyer blocked due to a high density of fraudulent activity. Determined by our internal algorithms.",
        install_validation_rules: "nstalls are defined as invalid by the advertiser using user-defined validation rules. For example, the advertiser defines that they would like to promote their app only in the United States. Installs coming from outside of the United States, are considered invalid and are not attributed.",
        bots: "Blocked install attempts made by Bots",
        click_flood: "Installs coming from clusters blocked by AppsFlyer due to a large number of installs with a high CTIT and low conversion rate.",
        behavioral_anomalies: "Behavioral anomalies being install fraud blocked due to inconsistent and abnormal post-install behavior.",
        install_hijacking: "Install hijacking being attributed clicks blocked based on unreasonable click and install time, based on Google Play Server-Side API.",
        validation_bots: "Customer-defined rule.",
        validation_hijacking: "Customer-defined rule.",
        inapps_bots: "AppsFlyer algorithm detects fraud",
        validation_inapps: "Based on requested or manually defined validation rule"
    }
}
