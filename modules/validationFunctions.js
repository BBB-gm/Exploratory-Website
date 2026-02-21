function sendErrorResponse(response, message){
    response.status(400);
    response.send({success: false, code: 0, body: message});
}

function validateRequestField(value,type,response,valueName){ //allowing for consistent and verbose error messages for basic value validation (Type & if defined)
    if(typeof value === type){
        return true;
    } else {
        sendErrorResponse(response, valueName+" is not a "+type)
        return false;
    }
}

function validateHexcode(value, response, valueName) { //allowing for consistent and verbose error messages for Hexcode colors
    
    if(validateRequestField(value, "string", response, valueName)){
        
        if(value.length === 7){
            
            if(value[0] === "#" ){
                
                var re = /#[0-9A-Fa-f]{6}/g;
                if(re.test(value)){
                    
                    return true;
                } else {
                    
                    sendErrorResponse(response, valueName+" does not contain proper hexadecimal");
                }
            } else {
                
                sendErrorResponse(response, valueName+" does not start with a #");
            }
        } else {
            
            sendErrorResponse(response, valueName+" is improperly sized for a hexcode");
        }
    }
    
    return false;
}

function validateNumberRange(value, response, valueName, minInclusive, maxExclusive) {
    if(validateRequestField(value, "number", response, valueName)){
        if(value >= minInclusive){
            if(value < maxExclusive){
                return true;
            } else {
                sendErrorResponse(response, valueName+" must be < "+max);
            }
        } else {
            sendErrorResponse(response, valueName+" must be >= "+min);
        }
    }

    return false;
}


module.exports.sendErrorResponse = sendErrorResponse;
module.exports.validateRequestField = validateRequestField;
module.exports.validateHexcode = validateHexcode;
module.exports.validateNumberRange = validateNumberRange;