const cheerio = require('cheerio')
const Excel = require('exceljs')
const fetch = require('node-fetch');
const fs = require('fs')
const Ultils = require('../utils')
const Url = require('url');
const host = 'https://www.rittal.com'
class dissector {
  constructor(){
  
  }

  async getAccessories(pageSource){
    const $ = cheerio.load(pageSource, {
      decodeEntities: false
    })

    $('li.float-box').map(async (i, el) => {
      const typeUrl = host + $('a', '.toggle', el).attr('href')
      const typeName = $('a.more', el).first().text()

      const typeImage ='https:' + $('img.lt', '.toggle', el).attr('src')
      console.log("-----------", typeName, typeImage, typeUrl)
    })

  }

  async getSubcats(pageSource){
    const $ = cheerio.load(pageSource, {
      decodeEntities: false
    })
    $('li.bg-box').map(async (i, el) => {
      const subCatUrl = host + $('a.more', el).attr('href')
      const subCatName = $('a.more', el).first().text()
      const subCatImage = $('img.rt_productlist_image', el).attr('src')
      const detail = $('p', el).first().text()
      console.log("-----------", subCatName, subCatImage, subCatUrl, detail)
    })

  }

  async getListProductsGroup(pageSource){
    const $ = cheerio.load(pageSource, {
      decodeEntities: false
    })
    $('li.bg-box').map(async (i, el) => {
      const prodUrl = host + $('a.more', el).attr('href')
      const prodName = $('a.more', el).first().text()

      const prodImage = $('img.rt_productlist_image', el).attr('src')
      const detail = $('p', el).first().text()
      console.log("-----------", prodName, prodImage, prodUrl, detail)
    })
  }

  async getListProds(pageSource){
    const $ = cheerio.load(pageSource, {
      decodeEntities: false
    })
    $('li.bg-box').map(async (i, el) => {
      const url = host + $('a.more', el).attr('href')
      const name = $('a.more', el).first().text()

      const image = $('img.rt_productlist_image', el).attr('src')
      const detail = $('p', el).first().text()
      console.log("-----------", name, image, url, detail)
    })
  }

  async getProdDetail(pageSource){
    const $ = cheerio.load(pageSource, {
      decodeEntities: false
    })

    const imageUrls = []
    $('slide', '#slider-container').map(async (i, el) => {
      const imgUrl = $('img', el).attr('src')
      imageUrls.push(imgUrl)
    })

  }
}

module.exports = dissector