const uaParser = require('ua-parser');
var _ = require('lodash');
module.exports = {  
  getUserAgent: async (userAgentValue, debug = false) => {
    
    let r = uaParser.parse(userAgentValue);
    const retorno = {
      browser: {
        name: r.ua.toString(),
        version: r.ua.toVersionString(),
        family: r.ua.family,
        major: parseInt(_.get(r, "ua.major",0)),
        minor: parseInt(_.get(r, "ua.minor",0)),
        patch: parseInt(_.get(r, "ua.patch",0)),
      },
      os: {
        name: r.os.toString(),
        version: r.os.toVersionString(),
        family: r.os.family,
        major: (parseInt(_.get(r, "ua.major",0)) > 0 ) ? parseInt(_.get(r, "ua.major",0))*100:0,  //(r.os.major>0) ? r.os.major*100:''
        minor: (parseInt(_.get(r, "ua.minor",0)) > 0 ) ? parseInt(_.get(r, "ua.minor",0))*10:0,   //(r.os.minor>0) ? r.os.minor*10:'',
        patch: (parseInt(_.get(r, "ua.patch",0)) > 0 ) ? parseInt(_.get(r, "ua.patch",0))*1:0,    //(r.os.patch>0) ? r.os.patch*1:''
      }

    }
    if (debug) {
      console.log(' Browser --------------------------------------');
      console.log(r.ua.toString());        // -> "Safari 5.0.1"
      console.log(r.ua.toVersionString()); // -> "5.0.1"
      console.log(r.ua.family)             // -> "Safari"
      console.log(r.ua.major);             // -> "5"
      console.log(r.ua.minor);             // -> "0"
      console.log(r.ua.patch);             // -> "1"
      console.log(' OS --------------------------------------');
      console.log(r.os.toString());        // -> "iOS 5.1"
      console.log(r.os.toVersionString()); // -> "5.1"
      console.log(r.os.family)             // -> "iOS"
      console.log(r.os.major);             // -> "5"
      console.log(r.os.minor);             // -> "1"
      console.log(r.os.patch);             // -> null
      console.log(' Device --------------------------------------');
      console.log(r.device.family);        // -> "iPhone"
      console.log('--------------------------------------');
    }
    return retorno;
  }
}