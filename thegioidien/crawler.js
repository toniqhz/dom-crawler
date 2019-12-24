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
var sizeOf = require('image-size');
const host = 'http://thegioidien.com'
const allProductPage = "http://cadisun.com.vn/san-pham-dich-vu/san-xuat.aspx"
var sanitizeHtml = require('sanitize-html');
const pLimit = require('p-limit');
const manualHost = "http://www.nakito.com/"

const columns = [
  { header: 'Name', key: 'name', width: 10 },
  // { header: 'Host Path Image', key: 'hostPath', width: 20 },
  { header: 'Category', key: 'catPath', width: 10 },
  // { header: 'Id', key: 'productId', width: 10 },
  { header: 'Product Code', key: 'productId', width: 10 },
  // { header: 'Category Name', key: 'catName', width: 32 },
  { header: 'Picture Name', key: 'imageName', width: 10},
  { header: 'Picture', key: 'hostPath', width: 30},
  // { header: 'Short Detail', key: 'shortDes', width: 120},
  { header: 'Short Detail', key: 'shortDetail', width: 200},
  { header: 'Detail', key: 'detailTable', width: 200},
  { header: 'Price', key: 'pricing', width: 10},
  { header: 'Old Price', key: 'marketPrice', width: 10},
]


function sleep(ms) {
  console.log("!!!!! sleep ", ms)
  return new Promise(resolve => setTimeout(resolve, ms));
}

const sanitizeHtmlOptions = {
  allowedTags: [ 'div', 'table', 'tbody', 'tr', 'td', 'th', 'font', 'b', 'span' ],
  // allowedAttributes: {
  //   'a': [ 'href' ]
  // },
  allowedIframeHostnames: ['www.youtube.com']
}
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

  let prods = []

  await Utils.asyncForEach($('#topnav > ul > li > ul >li', '#menuholderStyle'), async (el, i) => {
    const name = $('a', el).first().text().replace(/\r?\n|\r/g, '')
    const url = $('a', el).first().attr('href')

    const subCat = []
    await Utils.asyncForEach($(' > ul > li', el), async (subEl) => {
      const subCatName = $('a', subEl).first().text().replace(/\r?\n|\r/g, '')
      const subCaturl = $('a', subEl).first().attr('href')

      // const childCat = []
      await Utils.asyncForEach($(' > ul > li', subEl), async (childEl) => {
        const childCatName = $('a', childEl).first().text().replace(/\r?\n|\r/g, '')
        const childCaturl = $('a', childEl).first().attr('href')
        const catPath =  `${name} > ${subCatName} > ${childCatName}`
        // cats.push({
        //   path: catPath,
        //   name: childCatName,
        //   url:  childCaturl,
        //   // listProd: await getChildCategoryProdList(childCaturl, catPath)
        // })

        await Utils.saveExcel('thegioidien', 'thegioidien', columns,  await getChildCategoryProdList(childCaturl, catPath))

        // prods = [...prods, ... await getChildCategoryProdList(childCaturl, catPath)]
      })


      // subCat.push({
      //   name: subCatName,
      //   url:  subCaturl,
      //   childs: childCat
      // })
    })

    

    // cats.push({
    //   name: name,
    //   url:  url,
    //   childs: subCat
    // })
  })
  return prods
}

const getChildCategoryProdList = async (catUrl, catPath) => {
  console.log("-------- process cat detail: ", catUrl, catPath)
  const listProd = await getListProduct(host + '/' + catUrl, catPath)
  await sleep(500)
  // console.log("********** list prod", listProd)
  return listProd
}


const getListProduct = async (catUrl, catPath) => {
  try {

  
    console.log("************ get list prod ", catPath)
    const firstPage = await fetcher.getPageSource(catUrl)
    const $ = cheerio.load(firstPage, {
      decodeEntities: false
    })
    const listProd = []
    // const limit = pLimit(5);
    await Utils.asyncForEach($('.drlist-sub ul li', '#dvxemnhanh'), async (el) => {
      const shortDetail = $('a', el).first().text().replace(/\r?\n|\r/g, '')
      const prodUrl = $('a', el).first().attr('href').replace('../..', host + '/sanpham')

      listProd.push({
        shortDetail: shortDetail,
        url:  prodUrl,
        catPath: catPath,
        // ... inspectProductDetail(prodUrl)
      })
    })
    console.log(`+++++++++ start fetch prod detail of ${listProd.length} items`)
    const chunkArray = Utils.chunkArray(listProd, 3)
    let listProdWithDetail = []

    await Utils.asyncForEach(chunkArray, async miniArray => {
      console.log(`=================== chunk ${miniArray.length} items`)
      const chunkDetail = await Promise.all(miniArray.map(p => {
        return inspectProductDetail(p.url)
      }))
      
      console.log(` ++++++++ success fetched list product detail ${chunkDetail.length} prod`)
      listProdWithDetail = [...listProdWithDetail, ...chunkDetail]
    })
    console.log(`+@@@@@@@@@@@@ finish fetch prod detail of ${listProdWithDetail.length} items`)
    const totalProduct = listProd.map((p,i) => ({
      ...p,
      ...listProdWithDetail[i]
    }))
    console.log(`done with ${totalProduct.length} products`)
    return totalProduct




  } catch (err) {
    console.log("~~~~~~~~~~~ get prod list err", err)
    return []
  }
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
  console.log("-------- process prod: ", prodUrl)

  try{
    const pageSource = await fetcher.getPageSource(prodUrl)
    console.log("1 ------ fetch page source done", prodUrl)
    const $ = cheerio.load(pageSource, {
      decodeEntities: false
    })
    console.log("------ cherio load page source", prodUrl)
    
    let name = $('#dvprdthd').text()
    let image = $('a', "#galleria").attr('href') ? $('a', "#galleria").attr('href').replace('../../..', host) : null
    let detailHtml = $('.classtabprdt')
    let maSp = detailHtml.children().eq(0).text()
    // let productId = $('font', detailHtml.children().eq(0)).children().eq(1).text().replace(/(\r\n|\n|\r| )/g, '').replace(/\//g, '-')
    // if(!productId && name){
    //   productId = name.split('- ')[0].replace(/(\r\n|\n|\r| )/g, '').replace(/\//g, '-')
    // }

    let productId = name.split('- ')[0].replace(/(\r\n|\n|\r| )/g, '').replace(/\//g, '-')
    let secondInfo =  detailHtml.children().eq(1)
    let detailTable = cheerio.html($('table', secondInfo))
    let removedTable = $('table', secondInfo).remove()
    let xuatxu = removedTable.text()
    let pricing = $('.spangiabanview').text().replace(' VNĐ', '').replace(/\./g, ',')
    let marketPrice = $('.spangiattct').text().replace(' VNĐ', '').replace(/\./g, ',')
    

    console.log("2 ------ inspect done", prodUrl)

    const imagePath = `../files/products/thegioidien/`
      if(!fs.existsSync(imagePath)){
        await fs.mkdirSync(imagePath);
      }

    const picturePath = imagePath + `${productId}.png`

    const wpFilepath = `wp-content\/uploads\/${productId}.png`

    const hostPath = `http://localhost:8888/nakito/wp-content/uploads/2019/09/${productId}.png`
    const sourceUrl = `../files/products/thegioidien/${productId}.png`
    const destUrl = `../files/products/thegioidien/marked/${productId}.png`
    const imageName = `${productId}.png`
    if(image && !fs.existsSync(destUrl) ){
      console.log("3 ----- image not found, try to download")
      try {
        const res = await fetch(image)
        const dest = fs.createWriteStream(picturePath);
        const stream = res.body.pipe(dest)
        
        stream.on('finish', async () => {
          const dimensions = await sizeOf(sourceUrl);
          // console.log("-------dimensions----", dimensions)
          watermark.embed({
            type: "image", // Type 
                source: sourceUrl, // Source image file 
                logo: 'nakito-red.png', // This is optional if you have provided text Watermark
                destination: destUrl,
                position: {
                    logoX: (dimensions.width - 240) / 2,
                    logoY: (dimensions.height - 65 ) / 2,
                    logoHeight: 65,
                    logoWidth: 240
                }
          }, status => {})
        })
      } catch (err) {
        console.log("################ process img error", prodUrl)
      }
    } else {
      console.log("3 ----- image existed")
    }
    
    

    // pricing.replace("src=\"/", `src=${host}`)
    return {
      name,
      image, 
      imageName,
      hostPath,
      // catPath,
      maSp,
      productId,
      detailTable: sanitizeHtml(detailTable, sanitizeHtmlOptions),
      xuatxu,
      picturePath,
      wpFilepath,
      // detail, 
      pricing, 
      marketPrice
    }
  }
  catch (ItemErr) {
    console.log("^^^^^^^^^^^^^^ process prod detail error", ItemErr)
    return {}
  }
}



const testPromise = async () => {
  const func1 = async () => {
    console.log("func1 run")
  }

  const func2 = async () => {
    console.log("func2 run")
    await sleep(2000)
    console.log("func2 done")
  }

  const func3 = async () => {
    console.log("func3 run")
    await sleep(3000)
    console.log("func3 done")
  }

  await Promise.all([func1(), func2(), func3()])
}



const exec = async () => {


  // const categoryProduct = await getListProduct('http://cadisun.com.vn/cap-trung-the.aspx')
  // console.log("==*", categoryProduct)
  await getListCategoryUrl()
  console.log("************* get list prod done")
  // const prods = await getChildCategoryProdList("sanpham/4/10/Dong-Wide.aspx", "a > b > c")
  // console.log("++++++++ detail", cats)
  // const prods = await inspectProductDetail("http://thegioidien.com/sanpham/5/23818/Mat-dung-cho-6-thiet-bi.aspx")
  // const prodWithDetail = []

  // await Utils.asyncForEach(prods, async (prod, i) => {
  //   prodWithDetail.push({
  //     ...prod,
  //     ...await inspectProductDetail(prod.url)
  //   })
  // })
  // console.log("============ FETCH DONE", prodWithDetail)
  
  // await testPromise()
  


}


exec()