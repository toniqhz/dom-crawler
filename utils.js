const fs = require('fs')
const Excel = require('exceljs')
const iconv = require('iconv-lite');
var xlsx = require('node-xlsx');
const util = require('util')
const Fetcher = require('./fetcher')
const fetcher = new Fetcher()

const _ =  require('underscore')
const xss = require('xss')
const cheerio = require('cheerio')

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

    const path = `../files/${fileName}.xlsx`
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
  },

  reformatCSV: (fileName)=> {
    const filePath = `./files/${fileName}.xlsx`
    var obj = xlsx.parse(filePath); // parses a file
    var rows = [];
    var writeStr = "";

    //looping through all sheets
    for(var i = 0; i < obj.length; i++)
    {
        var sheet = obj[i];
        //loop through all rows in the sheet
        for(var j = 0; j < sheet['data'].length; j++)
        { 
                const escapedSheet = sheet['data'][j].map(c => {
                  let newC = c
                  newC = newC.replace(/"/g, '""');
                  newC = newC.replace(/,/g, '\,');
                  newC = newC.replace(/'/g, '\'');

                  // console.log(newC)
                  newC = '\"' + newC + '\"'
                  return newC
                })

                //add the row to the rows array
                rows.push(escapedSheet);
        }
    }

    //creates the csv string to write it to a file
    for(var i = 0; i < rows.length; i++)
    {
      writeStr += rows[i].join(",") + "\n";
    }

    //writes to a file, but you will presumably send the csv as a      
    //response instead
    const newCsvPath = `./files/${fileName}.csv`
    fs.writeFile(newCsvPath, writeStr, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("csv file was saved in the current directory!");
    });
  },

  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  },

  escapeHtml: (unsafe) => {
    if(!unsafe) return ''
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 },

 logDeep: (obj) => {
  return util.inspect(obj, {showHidden: false, depth: null})
 },

 standardizeHtml: (body) => {
  let realBody = _.unescape(body);
  let sanitizedBody = xss(realBody, {
    whiteList: {
      img: ['src', 'alt', 'width', 'height'],
      // div: [],
      // // a: ['class', 'href', 'fragment'],
      // b: [],
      p: [],
      // strong: [],
      // h1: [],
      // h2: [],
      // h3: [],
      // h4: [],
      // h5: []
    }, 
    escapeHtml(html) {
      return html
        .replace(/&#39;/g, '\'')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/\u2028/g, '')
        .replace(/\u2029/g, '')


        // .replace('Nguyễn Minh Hoà', 'Tuan Nguyen')
        // .replace('hoa.nguyen@huphaco.vn', 'edwardevans094@gmail.com')
        // .replace('0978 79 55 66', '033 507 9666')
        // .replace('thietbikythuat.com.vn', 'sensena.net')

    },
    // stripIgnoreTagBody: ['script', 'style', 'meta', 'header', 'section'],
    onIgnoreTag: (tag, html, options) => {
      // if (tag === "img" ) {
      //   const $ = cheerio.load(html, {
      //     decodeEntities: false
      //   })
      //   const imageUrl = $('img').attr('src')
      //   // //todo download this image to local and change src
      //   const urlPath = imageUrl.split('/')
      //   const imgName = urlPath[urlPath.length - 1]
      //   const picPath = "/wp-content/uploads/custom/" + imgName
        
      //   fetcher.asyncFetchImg(imageUrl, 'custom/' + imgName)
      //   // return `<img src="${picPath}"/>`
      //   // console.log(typeof html, html)
        
      //   return $.html($('img').attr('src', picPath))
      // }

      if(tag == 'a'){
        const $ = cheerio.load(html, {
          decodeEntities: false
        })
        const href = $('a').attr('href')
        if(href && href[0] !== '#') return ''
      }

      
      // Return nothing, means keep the default handling measure
    },
    // onTag(tag, html, options) {
    //   if(tag == 'p'){
    //     const lowercaseHtml = value ?  value.toLowerCase() : ''
    //     console.log("____________", lowercaseHtml)
    //     if(lowercaseHtml.includes('nguyễn minh hoà') || lowercaseHtml.includes('mobi :') || lowercaseHtml.includes('web :') || lowercaseHtml.includes('mail :')) return ''
    //   }
    // }
  });
  let brTrailling = '<div><br></div>';
  
  while (sanitizedBody.endsWith(brTrailling)) {

    sanitizedBody = sanitizedBody.substring(0, sanitizedBody.length - brTrailling.length).trim();
  }

  return sanitizedBody;
},





}