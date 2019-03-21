
const cheerio = require('cheerio')
const Excel = require('exceljs')
const fetch = require('node-fetch');
const fs = require('fs')
const Utils = require('../utils')
const Url = require('url');
const Fetcher = require('../fetcher')
const fetcher = new Fetcher()

class dissector {
  constructor(){
    // this.workbook = new Excel.Workbook();

    // this.vatGiaSheet = this.workbook.addWorksheet('Vat Gia');
  }

  async getMainCatWithChild(pageSource){
    const $ = cheerio.load(pageSource, {
      decodeEntities: false
    })

    const mainCats = []

    await Utils.asyncForEach($('#content #sub_content .post'), async (el, i) => {
      // console.log($('h2 a', '.item', el).html())
      const mainCatName = $('h2 a', '.item', el).text()
      const mainCatUrl = $('h2 a', '.item', el).attr('href')
      const mainCatThumb = $('.post-thumbnail img', '.item', el).attr('src')
  
      const subCat = []
      $('ul li', '.item', el).map(async (s_i, s_el) => {
        const subCatName  = $('a', s_el).text()
        const subCatUrl  = $('a', s_el).attr('href')

        subCat.push({
          s_name: subCatName,
          s_url: subCatUrl
        })
      })
      mainCats.push({
        name: mainCatName,
        url: mainCatUrl,
        thumb: mainCatThumb,
        childs: subCat
      })
    })

    return mainCats
  }


  async getAllProductInCategory(pageSource){
    const $ = cheerio.load(pageSource)





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
    const $ = cheerio.load(pageSource, {
      decodeEntities: false
    })

    const rows = []
    const imagePath = `../files/products/${imgFolderName}/`
    if(!fs.existsSync(imagePath)){
      await fs.mkdirSync(imagePath);
    }


    await Utils.asyncForEach($('#sub_content ul').children(),async el => {
      const productName = $('a', '.entry-title', el).text()
      const productUrl = $('a', '.entry-title', el).attr('href')
      const urlPath = productUrl.split('/')
      const productId = urlPath[urlPath.length - 2]
      const productPictrure = $('img', '.post-thumbnail', el).attr('src')

      const productPage = await fetcher.getPageSource(productUrl)


      const c$ = cheerio.load(productPage, {
        decodeEntities: false
      })

      const shortDetail = c$('header strong', '#sub_content').text()
      const fullDetail = unescape(c$('.c', '#sub_content').html())
      // const productPictureUrl = new RegExp("(?<=\').+?(?=\')", "g").exec(productPictrure)[0];
      // const productDetail = $('.product_teaser', el).text()
      // const productPrice = $('.price', '.product_price', el).text()
      // console.log("--------", productName, productPictrure, productDetail, productPrice)

      // const picturePath = imagePath + `${productId}.png`

      // const wpFilepath = `${imgFolderName}\/${productId}.png`
      if(productName){
        rows.push({
          id: productId,
          name: productName,
          url: productUrl,
          // catId: catObj.id,
          catName: catObj.s_name,
          pictureUrl: productPictrure,
          shortDetail: shortDetail,
          detail: fullDetail
          // picture: wpFilepath,
          // detail: productDetail,
          // price: Number(productPrice.replace(/[^0-9]+/g,""))
        })
      }
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
    const lastPaginate = $('ul', '.navigation').children().eq(-2)
    
    if(!lastPaginate) return 1

    const lastPageText = lastPaginate.text()
    // const lastParams = Ultils.extractURlQuery(lastUrl)

    return (lastPageText && +lastPageText) || 1
  }



  
}


module.exports = dissector