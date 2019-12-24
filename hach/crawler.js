const Fetcher = require('../fetcher')
// const Dissector = require('./dissector')
const fetch = require('node-fetch');
const Utils = require('../utils')
const fetcher = new Fetcher()
const cheerio = require('cheerio')
const md5 = require('md5');
const path = require('path');
const fs = require('fs')


const host = "https://www.hach.com"

const selectedCats = [
  "ONLINE ANALYZERS",
  "ONLINE SENSORS AND CONTROLLERS",
  "SAMPLERS",
  "MULTIPARAMETER ONLINE PANELS"
]

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

const getListCategoryUrl = async () => {
  const pageSource = await fetcher.getPageSource(host)
  const listCategory = await inspectListCats(pageSource)

  return 
}

const inspectListCats = async(pageSource) => {
  const $ = cheerio.load(pageSource, {
    decodeEntities: false
  })
  
  // mother_cat -> child_cat -> cats
  const allCats = []
  await Utils.asyncForEach($('.navLinks .root.first .hasSecondLevel', '#mainNav'), async (el, i) => {
    const motherCatName = $('a', el).first().text().replace(/\r?\n|\r/g, '')
    // const motherCatUrl = $('a', el).first().attr('href')
    
    const listTopFamily = []

    await Utils.asyncForEach($('.secondLevelContent .column', el), async (secondLevelColum, i) => {
      const topFamilyLinks =  $('.topFamily', secondLevelColum)
      const topFamilyList = $('.familyList', secondLevelColum)
      
      await Utils.asyncForEach(topFamilyLinks, async (topFamLink, topFamI) => {
        const topFamilyName = $(topFamLink).text().replace(/\r?\n|\r/g, '')
        const topFamilyUrl = $(topFamLink).attr('href')

        
        const familyList = []
        
        await Utils.asyncForEach($('a', topFamilyList[topFamI]), async (fam, famI) => {
          const famName = $(fam).text().replace(/\r?\n|\r/g, '')
          const famUrl = $(fam).attr('href')

          const urlExtracted = Utils.extractURlQuery(famUrl.split('?')[1])
          const famId = urlExtracted.productCategoryId
          
          familyList.push({
            familyName: famName,
            familyUrl: famUrl,
            famId
          })

          // todo get prod array and detail
        })
        listTopFamily.push({
          topFamilyName,
          topFamilyUrl,
          familyList
        })

        console.log("***************", familyList)
      })     
    })
    allCats.push({
      motherCatName,
      listTopFamily
    })

  })
  return allCats
}

const getFamilyProds = async (famPath) => {
  const fullUrl = host + famPath + "&pageSize=50"
  const pageSource = await fetcher.getPageSource(fullUrl)

  const $ = cheerio.load(pageSource, {
    decodeEntities: false
  })

  const overView = $('.productFamilyDesc').text()
  const prodsTable = $('#productsTable')

  const proProps = $('thead tr .filterableHeader', prodsTable)
  const arrayProps = []
  await Utils.asyncForEach(proProps, async (prop, propIndex) => {
    const propName = $("span", prop).last().text().replace(/\r?\n|\r/g, '')
    arrayProps.push(propName)
  })

  console.log("====arrayProps=========", arrayProps)

  const listProds = $('tbody tr', prodsTable)
  const arrayProdWithProps = []

  await Utils.asyncForEach(listProds, async (prod, prodIndex) => {

    const arrayPropsOfProd = []
    let prodUrl = ""
    let prodId
    await Utils.asyncForEach($('td', prod), async (prop, propIndex) => {

      if(propIndex == 0){
        const val = $('a', prop).first().text().replace(/\r?\n|\r/g, '').trim()
        const propLabel = arrayProps[propIndex]
        prodUrl = $('a', prop).attr('href')

        const urlExtracted = Utils.extractURlQuery(prodUrl.split('?')[1])
        prodId = urlExtracted.id

        arrayPropsOfProd.push({
          val: val,
          label: propLabel
        })
      } else {
        const val = $(prop).text().replace(/\r?\n|\r/g, '').trim()
        const propLabel = arrayProps[propIndex]

        arrayPropsOfProd.push({
          val: val,
          label: propLabel
        })
      }
      
    })

    // todo get prod detail
    console.log("___________________", arrayPropsOfProd)
    arrayProdWithProps.push({
      ... await getProdDetail(prodUrl),
      url: prodUrl,
      id: prodId,
      props: arrayPropsOfProd
    })
  })


  return arrayProdWithProps
}

const getProdDetail = async (prodPath) => {
  const fullUrl = host + prodPath
  const pageSource = await fetcher.getPageSource(fullUrl)

  const $ = cheerio.load(pageSource, {
    decodeEntities: false
  })

  const prodDetail = $('.productDescription p').first().text()
  const images = []
  await Utils.asyncForEach($('#productImageThumbs a img'), async (img, imgIndex) => {
    const imgUrl = $(img).attr('src')
    const splitUrl = imgUrl.split('?')
    const urlExtracted = Utils.extractURlQuery(splitUrl[1])
    urlExtracted.size = 'L'
    const finalImgUrl = splitUrl[0] + '?' + Utils.paramQuery(urlExtracted)
    images.push(finalImgUrl)
  })

  return {
    detail: prodDetail,
    images: images
  }
}


const exec = async () => {


  // const allCats = await getListCategoryUrl()
  // console.log("************* get list prod done", allCats)


  const arrayProds = await getFamilyProds("/process-product-training/tu5300sc-tu5400sc/family?productCategoryId=54077551705")

  console.log("************* get list prod done", arrayProds)

  // const prodDetail = await getProdDetail("/tu5300sc-tu5400sc-process-laser-turbidimeter-online-course/family-product?id=7640601998&callback=pf")

  // console.log("^^^^^^^^^^^^^^^^^^^^ ", prodDetail)

}


exec()
