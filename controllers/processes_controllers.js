//const db = require("../modules/db");
var moment = require('moment');
var log = require("../modules/log");
var _ = require('lodash');
var entityCampaignTotals = require('../modules/entity_manager/campaign_totals_entity');
var entityReports = require('../modules/entity_manager/reports_entity');
var entityProcess = require('../modules/entity_manager/processes_entity');
//const ExcelJS = require('exceljs');

var processesDashBoard = function (params) {
  return new Promise(async (resolve, reject) => {
    const NameProcess = 'DashBoard';

    try {
      var DateFrom = moment(params.datefrom, "YYYY-MM-DD");
      var DateTo = moment(params.dateto, "YYYY-MM-DD").add(23, 'hours').add(59, 'minutes');
      const hoy = new Date(); 
      const inicio = new Date(hoy.getFullYear() ,hoy.getMonth() ,hoy.getDate(),0,0,0);
      const fin = new Date(hoy.getFullYear() ,hoy.getMonth() ,hoy.getDate(),23,59,0);
      //let process = {}; 

      await entityProcess.updateStart( NameProcess );

      // Si el dia recien comienza proceso desde el dia anterior
      if (hoy.getHours()< 2)  inicio.setDate(hoy.getDate() - 1);

      // Si las fechas no se pasaron por parametro , las reinicializo con las fechas del dia.
      if (!DateFrom.isValid() && !DateTo.isValid()) {
        DateFrom = moment(inicio.toISOString().substring(0,10).replace(/-/g,''), "YYYY-MM-DD").add(00, 'hours').add(00, 'minutes');
        DateTo = moment(inicio.toISOString().substring(0,10).replace(/-/g,''), "YYYY-MM-DD").add(23, 'hours').add(59, 'minutes');
      } 

      if (DateFrom.isValid() && DateTo.isValid()) {
        
        let temp = await entityReports.getReportDashBoardDate( DateFrom, DateTo );

        let result = await entityCampaignTotals.insertCampaignTotals( DateFrom, DateTo, temp );
 
        //process.dateFrom = DateFrom;
        //process.dateTo = DateTo;
        //process.count = temp.length;

        await entityProcess.updateEnd(NameProcess, result, 'End');
        let process = await entityProcess.getProcess(NameProcess)
        resolve({ write_output: true, result: result, process: process, data: temp });

      } else {
        await entityProcess.updateEnd(NameProcess, 'Ivalid parameters date.' , 'Error');
        resolve({ write_output: true, messaje: 'Ivalid parameters date.' });
      }

    } catch (error) {
      await entityProcess.updateEnd(NameProcess,`Error ${error} rows`, 'Error');
      log(`Error ${error} rows`);
      reject(`Error ${error} rows`);
    }
  });
}

var processesCampaignTotals = function (params) {
  return new Promise(async (resolve, reject) => {
    const NameProcess = 'CampaignTotals';

    try {
      var DateFrom = moment(params.datefrom, "YYYY-MM-DD");
      var DateTo = moment(params.dateto, "YYYY-MM-DD").add(23, 'hours').add(59, 'minutes');
      const hoy = new Date(); 
      const inicio = new Date(hoy.getFullYear() ,hoy.getMonth() ,hoy.getDate(),0,0,0);
      const fin = new Date(hoy.getFullYear() ,hoy.getMonth() ,hoy.getDate(),23,59,0);
      //let process = {}; 

      await entityProcess.updateStart( NameProcess );

      // Si el dia recien comienza proceso desde el dia anterior
      if (hoy.getHours()< 2)  inicio.setDate(hoy.getDate() - 1);

      // Si las fechas no se pasaron por parametro , las reinicializo con las fechas del dia.
      if (!DateFrom.isValid() && !DateTo.isValid()) {
        DateFrom = moment(inicio.toISOString().substring(0,10).replace(/-/g,''), "YYYY-MM-DD").add(00, 'hours').add(00, 'minutes');
        DateTo = moment(inicio.toISOString().substring(0,10).replace(/-/g,''), "YYYY-MM-DD").add(23, 'hours').add(59, 'minutes');
      } 

      if (DateFrom.isValid() && DateTo.isValid()) {
        
        let temp = await entityReports.getReportsCampaignTotals( DateFrom, DateTo, 0, 0, 0, 0, 0 );

        let result = await entityCampaignTotals.insertCampaignTotals( DateFrom, DateTo, temp );
 
        //process.dateFrom = DateFrom;
        //process.dateTo = DateTo;
        //process.count = temp.length;

        await entityProcess.updateEnd(NameProcess, result, 'End');
        let process = await entityProcess.getProcess(NameProcess)
        resolve({ write_output: true, result: result, process: process, data: temp });

      } else {
        await entityProcess.updateEnd(NameProcess, 'Ivalid parameters date.' , 'Error');
        resolve({ write_output: true, messaje: 'Ivalid parameters date.' });
      }

    } catch (error) {
      await entityProcess.updateEnd(NameProcess,`Error ${error} rows`, 'Error');
      log(`Error ${error} rows`);
      reject(`Error ${error} rows`);
    }
  });
}
module.exports = {
  processesDashBoard: processesDashBoard,
  processesCampaignTotals: processesCampaignTotals
}