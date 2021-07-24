//Exposes all the event watchers
module.exports = [
    require('./new_click_created'),
    require('./new_debug_created'),
    require('./new_event_arrived'),
    require('./new_install_registered'),
    require('./new_blacklist_registered'),
    require('./upd_advertiser_prepay')
]