const fs = require('fs')
const Excel = require('exceljs')


const UPDATE_MODE = true

module.exports = {
  writeFilePromise: (path, data, fileEncoding) => {
    return new Promise(function(resolve, reject) {
      fs.writeFile(path, data, fileEncoding, function(err) {
          if (err) reject(err);
          else resolve(data);
      });
    });
  },

  extractURlQuery: (query) => {
    return query
      ? (/^[?#]/.test(query) ? query.slice(1) : query)
      .split('&')
      .reduce((params, param) => {
      const [key, value] = param.split('=');
      params[key] = value ? decodeURIComponent(value.replace(/\\+/g, ' ')) : '';
      return params;
      }, {})
      : {};
  },

  paramQuery: (data) =>  {
    const formEncodeURIComponent = uri => encodeURIComponent(uri).replace(/%20/g, '+');
    return Object.keys(data).sort().map(k => `${formEncodeURIComponent(k)}=${formEncodeURIComponent(data[k])}`).join('&');
  },


  saveExcel: async (sheetName, fileName, columns, rows) => {
    const workbook = new Excel.Workbook();
    let worksheet

    const path = `./files/${fileName}.xlsx`
    if(fs.existsSync(path) && UPDATE_MODE){
      // update to exist file
      await workbook.xlsx.readFile(path)
      worksheet = workbook.getWorksheet(sheetName)
    } else {
      //create new file 
      worksheet = workbook.addWorksheet(sheetName);
    }

    worksheet.columns = columns
    worksheet.addRows(rows)
    await workbook.xlsx.writeFile(path)
  }
}