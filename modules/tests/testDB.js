var db=require("../db/index");
console.log("Log:", db);
var con = {};
async function doTest(){
    try{
        con = await db.connect();
        var off = await con.collection("Offers").findOne();
        console.log(off);
    }catch(e){
        console.log(e);
    }
}


doTest();