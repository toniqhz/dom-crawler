
const cheerio = require('cheerio')
const Excel = require('exceljs')
const fetch = require('node-fetch');
const fs = require('fs')
const Ultils = require('../utils')
const Url = require('url');

class dissector {
  constructor(){
    // this.workbook = new Excel.Workbook();

    // this.vatGiaSheet = this.workbook.addWorksheet('Vat Gia');
  }

  async getProductDetail(imgFolderName, pageSource, catObj){
    const $ = cheerio.load(pageSource, {
      decodeEntities: false
    })

    const rows = []
    const imagePath = `../files/products/${imgFolderName}/`
    if(!fs.existsSync(imagePath)){
      await fs.mkdirSync(imagePath);
    }

    const productId = $('.product', '.site-main').attr('id')
    const productName = $('.product_title', '.site-main').text()
    const productPictrure = $('img', '.woocommerce-main-image', '.site-main').attr('src')
    const productPictureUrl = productPictrure
    const sortDescription = unescape($('.woocommerce-product-details__short-description', '.site-main').html())
    const productDetail = unescape($('.woocommerce-Tabs-panel--description', '.site-main').html())
    const productPrice = null

    rows.push({
      id: productId,
      name: productName,
      catId: catObj.id,
      catName: catObj.cat,
      pictureUrl: productPictureUrl,
      picture: productPictrure,
      shortDetail: sortDescription,
      detail: productDetail,
      price: null
    })

    return rows
  }

  async getListProduct(imgFolderName, pageSource, catObj){
    const $ = cheerio.load(pageSource)

    const rows = []
    const imagePath = `./files/products/${imgFolderName}/`
    if(!fs.existsSync(imagePath)){
      await fs.mkdirSync(imagePath);
    }
    
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

      const picturePath = imagePath + `${productId}.png`

      const wpFilepath = `${imgFolderName}\/${productId}.png`

      rows.push({
        id: productId,
        name: productName,
        catId: catObj.id,
        catName: catObj.name,
        pictureUrl: productPictureUrl,
        picture: wpFilepath,
        detail: productDetail,
        price: Number(productPrice.replace(/[^0-9]+/g,""))
      })

      // const res = await fetch(productPictureUrl)
      // const dest = fs.createWriteStream(picturePath);
      // res.body.pipe(dest)
     
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