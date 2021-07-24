/*
Entidad para el control de los procesos
*/
var _ = require('lodash');
var db = require('../db/index');
const COLLECTION_NAME = 'Processes';

//Example structure
const structure = {
    "Name": undefined,
    "Status": undefined,
    "StartDate": undefined,
    "EndDate": undefined,
    "Description": undefined
};

var updateStart = async function (name) {
    Start = new Date();
    try {
        db.connection().collection(COLLECTION_NAME).updateOne(
            {
                "Name": name
            },
            {
                $set: {
                    "StartDate": Start,
                    "Status": "Start"
                }
            },
            {
                upsert: true
            }
        );
    } catch (error) {
        log(`Error ${error} rows`);
    }
}

var updateEnd = async function (name, Description, Status) {
    End = new Date();
    try {
        db.connection().collection(COLLECTION_NAME).updateOne(
            {
                "Name": name
            },
            {
                $set: {
                    "EndDate": Start,
                    "Status": Status,
                    "Description": Description
                }
            },
            {
                upsert: false
            }
        );
    } catch (error) {
        log(`Error ${error} rows`);
    }
}

var getProcess = async function (name) {
    try {        
        return db.connection().collection(COLLECTION_NAME).findOne({ 'Name': name });
    } catch (error) {
        log(error);
        return false
    }
}

module.exports = {
    updateStart: updateStart,
    updateEnd: updateEnd,
    getProcess: getProcess
}





