const _ = require('lodash');
const log = require('../log');
var moment = require('moment');
const HttpRequest = require('request');

async function parseURLFromContext(context){
    try{
        //let url = _.get(context,'param.PostBackURL');
        const key = '6fe68ab5e56bb38fcd1ccab6d3fef480';
        const ID = _.get(context,'context.install._id');
        const AdvertiserID = _.get(context,'context.offer.Advertiser.AdvertiserID');
        const SupplierID = _.get(context,'context.offer.Supplier.SupplierID'); // affiliate_id
        const CampaignID = _.get(context,'context.offer.Campaign.CampaignID'); 
        const clickDate = _.get(context,"context.click.CreationDate");
        const installDate = new Date();
        const session_time = moment(clickDate).format("YYYY-MM-DD HH:mm:ss");
        const conversion_time = moment(installDate).format("YYYY-MM-DD HH:mm:ss");
        const SubPubID = _.get(context,"context.click.SubPubID");
        const session_ip = _.get(context,"context.click.LocationInfo.ControlIp", "");
        const UserAgent = _.get(context,"context.click.ua", "");
        const offer_name = _.get(context,"context.offer.Campaign.Campaign", "");
        const click_id = _.get(context,"context.click.ClickID", "");
        const advertiser_manager_name = _.get(context,'context.offer.Advertiser.AccountManager');
        //const advertiser_manager_id = _.get(context,'context.offer.Advertiser.AdvertiserID');

        let conversion_ip = _.get(context,"param.AdditionalIPInfo.IP", "");
        if (conversion_ip=='?') conversion_ip = '';
        const country_code = _.get(context,"context.click.LocationInfo.CountryCode", "");
        const device_os = _.get(context,"context.click.OSInfo.OSfamily", "");
        let device_os_version = _.get(context,"context.click.OSInfo.OSversion", "");
        if (device_os_version==null) device_os_version = '';
        let android_id = _.get(context,"context.click.android_adid", "");
        if (android_id=='') android_id = _.get(context,"context.click.android_id", "");
        if (android_id=='') android_id = _.get(context,"context.click.GAID", "");
        if (android_id==null) android_id = '';
        let idfa = _.get(context,"context.click.IDFA", "");
        if (idfa=='') idfa = _.get(context,"context.click.ExtraParams.tr_sub2", "");
        if (idfa==null) idfa = '';
        let aff_sub2 = _.get(context,"context.click.ExtraParams.p2", "");
        if (aff_sub2==null) aff_sub2 = '';

        let url = `https://events.fraudscore.mobi/?c=install&key=${key}&id=${ID}&`;
        url += `advertiser_id=${AdvertiserID}&affiliate_id=${SupplierID}&offer_id=${CampaignID}&`;
        url += `session_time=${session_time}&conversion_time=${conversion_time}&aff_sub1=${SubPubID}`;
        if (session_ip!='') url += `&session_ip=${session_ip}`;
        if (UserAgent!='') url += `&ua=${UserAgent}`;
        url += `&advertiser_name=${AdvertiserID}`;
        url += `&offer_name=${offer_name}`;
        url += `&click_id=${click_id}`;
        url += `&conversion_ip=${conversion_ip}`;
        url += `&country_code=${country_code}`;
        if (device_os!='') url += `&device_os=${device_os}`;
        if (device_os_version!='') url += `&device_os_version=${device_os_version}`;
        if (android_id!='') url += `&android_id=${android_id}`;
        if (idfa!='') url += `&idfa=${idfa}`;
        if (aff_sub2!='') url += `&aff_sub2=${aff_sub2}`;
        if (advertiser_manager_name!='') url += `&advertiser_manager_name=${advertiser_manager_name}`;

        log(`Fraude: ${url}`)
        return url;

    } catch(e) {
        log(`ERROR: parseURL() - [${e}]`);
        return false;
    }
}

async function sendCallBackFraude(response, params){  
    const headers = {
    'Content-type': 'application/json'
    };
    
    if(params.status == 'all_validators_ok'){        
        let parsedUrl = await parseURLFromContext(params); //Parse URL with macros
        const options = {
            url: parsedUrl,
            method: 'GET',
            headers: headers
        };
        HttpRequest( options );
    }
}

module.exports = {
    sendCallBackFraude: sendCallBackFraude
}