const ip2loc = require("ip2location-nodejs");
const ip2proxy = require("ip2proxy-nodejs");
const config = require("./config");

module.exports = {
  /**
   * getCarrier
   * @ip = IPv4
   */

  getCarrier: async (ip, debug = false) => {
    const dbCarrier = `./${config.DB_CARRIER}`;
    ip2loc.IP2Location_init(dbCarrier);

    const result = await ip2loc.IP2Location_get_all(ip);

    return {
      IP: result.ip,
      IP_No: result.ip_no,
      CountryCode: result.country_short,
      CountryName: result.country_long,
      CityName: result.region,
      Latitude: result.latitude,
      Longitude: result.longitude,
      ISP: result.isp,
      Domain: result.domain,
      MobileBrand: result.mobilebrand,
    };
  },
  getProxy: async (ip, debug = false) => {
    const dbProxy= `./${config.DB_PROXY}`;
    ip2proxy.Open(dbProxy);

    const isProxy = await ip2proxy.isProxy( ip );
    let VPNProxyType = '';
    let VPNCountryCode = '';
    let VPNCountryName = '';
    if (isProxy!=0) {
      VPNProxyType = ip2proxy.getProxyType( ip );
      VPNCountryCode = ip2proxy.getCountryShort( ip );
      VPNCountryName = ip2proxy.getCountryLong( ip );
    }
    return {
      VPNProxyType,
      VPNCountryCode,
      VPNCountryName
    }  
  }
}