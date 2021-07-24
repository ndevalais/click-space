let CacheHelper = require("./ClusteredAutoCache");
let ch = new CacheHelper();

async function test(){
    var f = async function (){
        var elem = {myObjectProp:"MyValue"};
        return elem;
    }
    
    let resultado = await ch.getObject("miObjeto", 1 , f , 0.5);
    console.log("Resultado:", resultado);

    setInterval(async function(){
        await ch.getObject("miObjeto", 1 , f , 0.5);
    }, 800);
}


test();