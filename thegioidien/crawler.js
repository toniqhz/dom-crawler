const Fetcher = require('../fetcher')
// const Dissector = require('./dissector')
const fetch = require('node-fetch');
const Utils = require('../utils')
const fetcher = new Fetcher()
const cheerio = require('cheerio')
const md5 = require('md5');
const path = require('path');
const fs = require('fs')
// const watermark = require('image-watermark');
var watermark = require('dynamic-watermark');

const host = 'http://thegioidien.com'
const allProductPage = "http://cadisun.com.vn/san-pham-dich-vu/san-xuat.aspx"


const manualHost = "http://www.nakito.com/"

const getListCategoryUrl = async () => {
  const pageSource = await fetcher.getPageSource(host)
  const listCategory = await inspectListCats(pageSource)

  return listCategory
}

const inspectListCats = async(pageSource) => {
  const $ = cheerio.load(pageSource, {
    decodeEntities: false
  })
  
  const menuHolder = $()

  const cats = []

  await Utils.asyncForEach($('#topnav > ul > li > ul >li', '#menuholderStyle'), async (el, i) => {
    const name = $('a', el).first().text().replace(/(\r\n|\n|\r)/gm, '')
    const url = $('a', el).first().attr('href')

    const subCat = []
    await Utils.asyncForEach($(' > ul > li', el), async (subEl) => {
      const subCatName = $('a', subEl).first().text().replace(/(\r\n|\n|\r)/gm, '')
      const subCaturl = $('a', subEl).first().attr('href')

      const childCat = []
      await Utils.asyncForEach($(' > ul > li', subEl), async (childEl) => {
        const childCatName = $('a', childEl).first().text().replace(/(\r\n|\n|\r)/gm, '')
        const childCaturl = $('a', childEl).first().attr('href')
  
        childCat.push({
          name: childCatName,
          url:  childCaturl
        })
      })


      subCat.push({
        name: subCatName,
        url:  subCaturl,
        childs: childCat
      })
    })

    cats.push({
      name: name,
      url:  url,
      childs: subCat
    })
  })
  return cats
}

const getChildCategoryDetail = async (catUrl) => {
  const listProd = await getListProduct(host + '/' + catUrl)
  console.log("********** list prod", listProd)
}


const getListProduct = async (catUrl) => {
  const firstPage = await fetcher.getPageSource(catUrl)
  const $ = cheerio.load(firstPage, {
    decodeEntities: false
  })
  const listProd = []
  
  await Utils.asyncForEach($('.drlist-sub ul li', '#dvxemnhanh'), async (el) => {
    const prodName = $('a', el).first().text().replace(/(\r\n|\n|\r)/gm, '')
    const prodUrl = $('a', el).first().attr('href').replace('../..', host + '/sanpham')

    listProd.push({
      name: prodName,
      url:  prodUrl
    })
  })

  return listProd
}
const getMaxPageNumber = async (pageSource) => {
  const $ = cheerio.load(pageSource)
  const lastPaginate = $('.NavegationBar').children().eq(-3)
  if(!lastPaginate) return 1

  const lastPageText = lastPaginate.text()
  return (lastPageText && +lastPageText) || 1
}
const inspectListProduct = async (pageSource) => {
  const $ = cheerio.load(pageSource, {
    decodeEntities: false
  })

  const products = []
  await Utils.asyncForEach($('ul li', '.P_Default'), async (el, i) => {
    const name = $('.P_Title a','.P_Body', el).text()
    const url = $('.P_Title a','.P_Body', el).attr('href')
    const featureImgPath = $('img','.P_Avatar', el).attr('src')

    products.push({
      name: name,
      url: url,
      featureImg: host + featureImgPath
    })
  })
  return products

}

const inspectProductDetail = async (prodUrl) => {
  const pageSource = await fetcher.getPageSource(prodUrl)
  const $ = cheerio.load(pageSource, {
    decodeEntities: false
  })
  // const images = []
  // const sortDetail = $('.jScrollPanel').text()

  // await Utils.asyncForEach($('li', '#myGallery'), async (el, i) => {
  //   const imagePath = $('img', el).attr('src')
  //   images.push(path.join(host, imagePath))
  // })
  let image = $('a', "#galleria").attr('href').replace('../../..', host)
  let detailHtml = $('.classtabprdt')
  let maSp = detailHtml.children().eq(0).text()
  let productId = $('font', detailHtml.children().eq(0)).children().eq(1).text()
  let secondInfo =  detailHtml.children().eq(1)
  let detailTable =  $('table', secondInfo).html()
  let removedTable = $('table', secondInfo).remove()
  let xuatxu = removedTable.text()
  let pricing = $('.spangiabanview').text()
  let marketPrice = $('.spangiattct').text()

  const imagePath = `../files/products/thegioidien/`
    if(!fs.existsSync(imagePath)){
      await fs.mkdirSync(imagePath);
    }

  const picturePath = imagePath + `${productId}.png`

  const wpFilepath = `wp-content\/uploads\/${productId}.png`
  const res = await fetch(image)
  const dest = fs.createWriteStream(picturePath);
  const stream = res.body.pipe(dest)
  stream.on('finish', () => {
    watermark.embed({
      type: "image", // Type 
          source: `../files/products/thegioidien/${productId}.png`, // Source image file 
          logo: 'nakito.png', // This is optional if you have provided text Watermark
          destination: `../files/products/thegioidien/marked/${productId}.png`,
          position: {
              logoX: 10,
              logoY: 100,
              logoHeight: 70,
              logoWidth: 250
          }
    }, status => {})
  })


  

  // pricing.replace("src=\"/", `src=${host}`)
  return {
    image, 
    maSp,
    productId,
    detailTable,
    xuatxu,
    picturePath,
    wpFilepath,
    // detail, 
    pricing, 
    marketPrice
  }
}




const exec = async () => {


  // const categoryProduct = await getListProduct('http://cadisun.com.vn/cap-trung-the.aspx')
  // console.log("==*", categoryProduct)
  // const cats = await getChildCategoryDetail("sanpham/4/10/Dong-Wide.aspx")
  // console.log("++++++++ detail", cats)
  const prod = await inspectProductDetail("http://thegioidien.com/sanpham/5/23818/Mat-dung-cho-6-thiet-bi.aspx")
  console.log(prod)

 

  console.log("============ ALL DONE")


}


exec()