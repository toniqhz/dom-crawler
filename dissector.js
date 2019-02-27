
const cheerio = require('cheerio')
const Excel = require('exceljs')
const fetch = require('node-fetch');
const fs = require('fs')
const Ultils = require('./utils')
const Url = require('url');

class dissector {
  constructor(){
    // this.workbook = new Excel.Workbook();

    // this.vatGiaSheet = this.workbook.addWorksheet('Vat Gia');
  }

  async getListProduct(pageSource){
    const $ = cheerio.load(pageSource)

    const rows = []
    $('.product_table_list .list').map(async (i, el) => {
      // console.log("++++++++++++++= el", el)
      // const product = $(this)
      const productId = $('input', '.No', el).attr('value')
      const productName = $('a', '.product_name', el).text()
      const productPictrure = $('.product_picture_thumbnail', el).attr('rel')
      const productPictureUrl = new RegExp("(?<=\').+?(?=\')", "g").exec(productPictrure)[0];
      const productDetail = $('.product_teaser', el).text()
      const productPrice = $('.price', '.product_price', el).text()
      // console.log("--------", productName, productPictrure, productDetail, productPrice)

      const picturePath = `./files/products/${productId}.png`

      rows.push({
        id: productId,
        name: productName,
        pictureUrl: productPictureUrl,
        picture: picturePath,
        detail: productDetail,
        price: productPrice
      })

      const res = await fetch(productPictureUrl)
      const dest = fs.createWriteStream(picturePath);
      res.body.pipe(dest)
     
    })

    // console.log("++++++++++++", rows)
    return rows
    // this.saveExcel('Vat Gia', './files/vat_gia.xlsx', this.vatGiaSheetColumns, rows)
  
  }


  async getListCategories(pageSource){
    const $ = cheerio.load(pageSource)

    const cats = []
    $('.menu_product .level_1').map(async (i, el) => {
      const catName = $('span', el).text()
      const catPath = $('a', el).attr('href')

      const urlParts = Ultils.extractURlQuery(catPath)

      const catId = urlParts.record_id

      cats.push({
        id: catId,
        name: catName,
        url: catPath
      })
    })

    return cats
  }


  async getMaxPageNumber(pageSource){
    const $ = cheerio.load(pageSource)

    const lastPaginate = $('.page_div', '.module_larger_border').children().last()
    
    if(!lastPaginate) return 0

    const lastUrl = lastPaginate.attr('href')
    const lastParams = Ultils.extractURlQuery(lastUrl)

    return (lastParams && lastParams.page) || 0
  }



  
}


module.exports = dissector