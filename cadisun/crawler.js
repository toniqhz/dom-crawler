const Fetcher = require('../fetcher')
// const Dissector = require('./dissector')
const Utils = require('../utils')
const fetcher = new Fetcher()
const cheerio = require('cheerio')
const md5 = require('md5');
const path = require('path');

const host = 'http://cadisun.com.vn/'
const allProductPage = "http://cadisun.com.vn/san-pham-dich-vu/san-xuat.aspx"



const getListCategoryUrl = async () => {
  const pageSource = await fetcher.getPageSource(allProductPage)
  const listCategory = await inspectListCats(pageSource)

  return listCategory
}

const inspectListCats = async(pageSource) => {
  const $ = cheerio.load(pageSource, {
    decodeEntities: false
  })

  const cats = []
  await Utils.asyncForEach($('.level li', '.left_body .menuroot'), async (el, i) => {
    const name = $('.warpcatname', el).text()
    const url = $('a', el).attr('href')

    cats.push({
      name: name,
      url:host + url,
    })
  })
  return cats
}


const getListProduct = async (catUrl) => {
  const firstPage = await fetcher.getPageSource(catUrl)
  const maxPage = await getMaxPageNumber(firstPage)
  let page = 1
  let products = []

  while(page <= maxPage){
    const url = page > 1 ? catUrl.replace('.aspx','') + `/pageindex-${page}.aspx` : catUrl
    const categoryPage = await fetcher.getPageSource(url)
    const listProduct = await inspectListProduct(categoryPage)
    products = [...products, ...listProduct]
    page = page + 1
  }
  // const listProduct = await inspectListProduct(firstPage)
  return products
}
const getMaxPageNumber = async (pageSource) => {
  const $ = cheerio.load(pageSource)
  const lastPaginate = $('.selectpage').children().eq(-2)
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
  const images = []
  const sortDetail = $('.jScrollPanel').text()

  await Utils.asyncForEach($('li', '#myGallery'), async (el, i) => {
    const imagePath = $('img', el).attr('src')
    images.push(path.join(host, imagePath))
  })
  let detail =  $('.relateproductcontentpanel', '#tabs-thongsokithuat').html()
  let pricing = $('.productpricepanel', '#tabs-bangbaogia').html()

  detail.replace("src=\"/", `src=${host}`)
  pricing.replace("src=\"/", `src=${host}`)
  return {
    sortDetail, images, detail, pricing
  }
}




const exec = async () => {


  // const categoryProduct = await getListProduct('http://cadisun.com.vn/cap-trung-the.aspx')
  // console.log("==*", categoryProduct)
  const postDetail = await inspectProductDetail("http://cadisun.com.vn/san-pham/cap-trung-the/cap-3-loi-man-chan-bang-dong-khong-giap-12/2024kv.aspx")
  console.log("++++++++ detail", postDetail)
  console.log("============ ALL DONE")


}


exec()