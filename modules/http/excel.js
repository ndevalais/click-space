const _ = require('lodash');
const log = require('../log');
var Excel = require('exceljs');


function reportExcel(res, params) {
  var workbook = new Excel.Workbook();
  var worksheet = workbook.addWorksheet('Sheet');
  const name = _.get(params,"excel.file","name_file.csv");
  const type = _.get(params,"excel.type","csv");
  var columns = [];

  workbook.creator = 'Laikad';
  workbook.lastModifiedBy = 'Laikad';
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.lastPrinted = new Date();

  if (params.result.length > 0) {

    // Titulos del Excel
    for (var i = 0; i < params.tituls.length; i++) {
      columns.push({ header: params.tituls[i], key: params.tituls[i] })
    }
    worksheet.columns = columns;

    // Contenido de las columnas
    for (var i = 0; i < params.result.length; i++) {
      worksheet.addRow(params.result[i]);
    }

    //res.setHeader(`Content-disposition', 'attachment; filename=${name}`);
    //res.setHeader('Content-type', 'application/vnd.ms-excel');
    if (type=='xls'||type=='xlsx') {
      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="' + name + '"',
        'x-processed-filename': name
      });
    } else if (type=='csv') {
      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="' + name + '"',
        'x-processed-filename': name
      });
    }
    //if (type=='csv') res.setHeader('Content-Type', 'text/csv');
    //if (type=='xls'||type=='xlsx') res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    //res.setHeader('Content-Disposition', `attachment; filename=${name}`);

    if (type=='xls'||type=='xlsx') {
      workbook.xlsx.writeBuffer()
        .then(function (buffer) {
          // done
          log("saved");
          res.send(buffer);
          res.flush();
        })
        .catch((err) => {
          log("err", err);
        });
    } else {
      workbook.csv.writeBuffer()
        .then(function (buffer) {
          // done
          log( `Save: ${name}` );
          res.send(buffer);
          res.flush();
        })
        .catch((err) => {
          log("err", err);
        });
    }
      //workbook.xlsx.writeFile(`${name}`);
  }

  /*res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${ name }.xlsx`);
  res.setHeader('Content-Length', stream.length);
  res.send(stream);

  res.send({
    code: 200
  });
  res.flush();*/
  /*


    const fs = require('fs');

    fs.writeFile("/tmp/test", "Hey there!", function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }); 

    // Or
    fs.writeFileSync('/tmp/test-sync', 'Hey there!');


  */
}

module.exports = {
  reportExcel: reportExcel
}