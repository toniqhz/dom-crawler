const Fetcher = require('../fetcher')
// const Dissector = require('./dissector')
const Utils = require('../utils')
const fetcher = new Fetcher()
const cheerio = require('cheerio')
const md5 = require('md5');


const host = 'https://e-services.vn/'
const shopName = 'codiendika'

const rittalUrl = "https://e-services.vn/dong-san-pham/rittal-vi/"
const postDetail = "https://e-services.vn/san-pham/bo-dieu-khien-nhiet-thermostat/"

const sServiceColumn = [
  { header: 'Category', key: 'path', width: 10 },
  { header: 'Id', key: 'id', width: 10 },
  { header: 'Product Name', key: 'name', width: 32 },
  { header: 'Product Code', key: 'code', width: 10 },
  // { header: 'Category Name', key: 'catName', width: 32 },
  // { header: 'Picture Url', key: 'img', width: 30},
  { header: 'Picture', key: 'img', width: 30},
  { header: 'Short Detail', key: 'shortDes', width: 120},
  { header: 'Detail', key: 'detail', width: 200},
  // { header: 'Price', key: 'price', width: 10},
]

const getMainType = async (url) => {
  const mainTypeSource = await fetcher.getPageSource(url)
  // const dataInspect = await inspectMainType(mainTypeSource)
  const allPost = await inspectListURl(mainTypeSource)

  await Utils.saveExcel('eService.com', 'eService', sServiceColumn, allPost)


  // for (const type of listMainType) {
  //   const typeSource = await fetcher.getPageSource(type.url)
  //   const listProd = await inspectListProduct(typeSource)
  // }
}


const listProd = async (pageSource) => {
  const $ = cheerio.load(pageSource, {
    decodeEntities: false
  })

  const mainType = []
  const catName = $('.term-name').text()
  await Utils.asyncForEach($('.custom-col'), async (el, i) => {
    const name = $('h4 a', '.list-content-info', el).text()
    const url = $('h4 a', '.list-content-info', el).attr('href')

    mainType.push({
      name: name,
      url: url,
    })
  })

  return mainType
}

const inspectPostDetail = async (pageSource, productCode) => {
  const $ = cheerio.load(pageSource, {
    decodeEntities: false
  })
  const name = $('h1', '.product-header-right-wrapper').text()
  const img = $('.product-gallery-img-wrapper img', '.product-image-wrapper').attr('src')
  const shortDes = $('.product-info-description', '.product-header-right-wrapper').html()
  const detail = $('.product-detais').html()
  return {
    name, img, shortDes, detail
  }
}

const loadListPost = async (url, path) => {
  const listSourve = await fetcher.getPageSource(url)
  const postsUrl = await listProd(listSourve)
  const posts = []
  await Utils.asyncForEach(postsUrl, async (postItem, i) => {
    const postSource = await fetcher.getPageSource(postItem.url)
    const inspectUrl = postItem.url.split('/')
    const productCode = inspectUrl[inspectUrl.length - 2]
    const postDetail = await inspectPostDetail(postSource, productCode)
    const hash = md5(path)
    code = productCode + "-" + hash.substring(0,5)

    console.log("_____ success crawl post: ", postDetail.name, code)
    posts.push({...postDetail, path: path, code: productCode})
  })
  return posts
}
 

const inspectListURl = async (pageSource) => {
  const $ = cheerio.load(pageSource, {
    decodeEntities: false
  })

  const cats = []
  let posts = []
  
  const nav = $('#menu-menu-trai', ".sidebar-menu-wrapper")
  await Utils.asyncForEach($('.menu-level-0', nav), async (cat, i) => {
    const catName = $('a', '.menu-level-0', cat).first().text()
    const catUrl = $('a', '.menu-level-0', cat).first().attr('href')

    const catChilds = []
    let path = `${catName.toLocaleUpperCase()}`
    // const isHasChild = $('.dropdown-depth-0').html() ? true : false
    // if()

    await Utils.asyncForEach($('.dropdown-depth-0 li', cat), async (level0, i) => {
      const level0Name = $('a', level0).first().text()
      const level0Url = $('a', level0).first().attr('href')
      const child0 = []
      const level0path = path + ' > ' + level0Name

      await Utils.asyncForEach($('.dropdown-depth-1 li', level0), async (level1, i) => {
        const level1Name = $('a', level1).first().text()
        const level1Url = $('a', level1).first().attr('href')
        const level1path = level0path + ' > ' + level1Name
        const posts1 = await loadListPost(level1Url, level1path)
        posts = [...posts, ...posts1]
        child0.push({
          name: level1Name,
          url: level1Name,
        })
        
      })

      // catChilds.push({
      //   name: level0Name,
      //   url: level0Url,
      //   child: child0
      // })

       if(!child0.length){
          const posts0 = await loadListPost(level0Url, level0path)
          posts = [...posts, ...posts0]
        }

    })

    // if(!catChilds.length){
    //   const catPosts = await loadListPost(catUrl)
    // }

    // cats.push({
    //   name: catName,
    //   url: catUrl,
    //   child: catChilds
    // })

  })


  return posts
  

}













const exec = async () => {
  console.log("==============hash: ", md5("eService"))

  await getMainType(postDetail)
  console.log("============ ALL DONE")


}


exec()