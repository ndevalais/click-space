
module.exports = {
  /**
   * getUserAgent 
   * @return 
   *  {
   *   browser: {
   *     name:"Safari 5.0.1", 
   *     version:"5.0.1", 
   *     family:"Safari", 
   *     major:"5", 
   *     minor:"0", 
   *     patch:"1"
   *   }, 
   *   os: {
   *     name:"iOS 5.1", 
   *     version:"5.1", 
   *     family:"iOS", 
   *     major:"5", 
   *     minor:"1", 
   *     patch:null
   *   }
   *  }
   */
  getUserAgent: (req, resp, debug = false) => {
    //WARNING WARNING WARNING! 
    //TODO: Limit  all input to libraryes

    const r = require('ua-parser').parse(req.headers['user-agent']);
    const retorno = {
      browser: {
        name: r.ua.toString(),
        version: r.ua.toVersionString(),
        family: r.ua.family,
        major: r.ua.major,
        minor: r.ua.minor,
        patch: r.ua.patch
      },
      os: {
        name: r.os.toString(),
        version: r.os.toVersionString(),
        family: r.os.family,
        major: (r.os.major>0) ? r.os.major*100:'',
        minor: (r.os.minor>0) ? r.os.minor*10:'',
        patch: (r.os.patch>0) ? r.os.patch*1:''
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