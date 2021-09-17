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
            TR_SUB1:'ts1',
            TR_SUB2:'ts2',
            TR_SUB3:'ts3',
            TR_SUB4:'ts4',
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
    }
}
