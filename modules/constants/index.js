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
            P2:"p2",
            SUBPUBID:"spi",
            OFFER_GUID:"og",
            SUBPUBHASH:"sph",
            P2HASH:'p2h',
            CAMPAIGN_CLICK_GUID:'ccg',
            IDFA:'idfa',
            CLICKID:'cid',
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
            ANDROID_ID:'androidadid',
            USER_AGENT:'UserAgent',
            SOURCE_IP:'SourceIP',
            name:'click'
        }        
    }
}
