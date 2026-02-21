function log(text){
    let d = new Date();
    let dString = "D: " + d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();

    console.log(dString+"  "+text);
}


module.exports.log = log;