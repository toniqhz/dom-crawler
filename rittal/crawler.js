const Fetcher = require('../fetcher')
const Dissector = require('./dissector')
const Utils = require('../utils')
const fetcher = new Fetcher()
const host = 'https://www.vatgia.com/'
const shopName = 'codiendika'

const allAccessTypeUrl = 'https://www.rittal.com/com-en/content/eng/produkte/zubeh_r/Zubeh_r.jsp'

const samepleTypePage = {
  name: 'IT monitoring',
  url: 'https://www.rittal.com/com-en//product/list.action?categoryPath=/PG0001/PG0900ZUBEHOER1/PG1538ZUBEHOER1',
  image: 'https://www.rittal.com/imf/y250/2_47668/'
}

const sampleSubCat = {
  name: 'CMC III – Monitoring system',
  url: 'https://www.rittal.com/com-en/product/list.action;jsessionid=9DC3A26C92FA764156EF39149DAE03C3?categoryPath=/PG0001/PG0900ZUBEHOER1/PG1538ZUBEHOER1/PGR9560ZUBEHOER1',
  image: 'https://www.rittal.com/imf/400/2_43326//'
}

const sampleProd = {
  name: 'CMC III sensors',
  url: 'https://www.rittal.com/imf/400/2_37398//',
  detail: 'https://www.rittal.com/com-en/product/list.action;jsessionid=CC984B08655FD33F48CAFABA14CE41BD?categoryPath=/PG0001/PG0900ZUBEHOER1/PG1538ZUBEHOER1/PGR9560ZUBEHOER1/PGR9562ZUBEHOER1'
}

const sampleGroup = {
  name: 'CMC III sensors',
  url: 'https://www.rittal.com/com-en/product/list.action;jsessionid=CC984B08655FD33F48CAFABA14CE41BD?categoryPath=/PG0001/PG0900ZUBEHOER1/PG1538ZUBEHOER1/PGR9560ZUBEHOER1/PGR9562ZUBEHOER1',
  image: ''
}

const sampleProd = {
  name: 'CMC III sensors',
  url: 'https://www.rittal.com/com-en/product/list/variations.action;jsessionid=99F0C60DDC905904DF97501622A64710?categoryPath=/PG0001/PG0900ZUBEHOER1/PG1538ZUBEHOER1/PGR9560ZUBEHOER1/PGR9562ZUBEHOER1/PRO23678ZUBEHOER&productID=PRO23678',
  detail: ''
}

const getAllAccessType = async () => {
  const dissectorVG = new Dissector() 

  const allAccessPage = await fetcher.getPageSource(allAccessTypeUrl)

  const accessories = await dissectorVG.getAccessories(allAccessPage)
}

const getListSubcat = async (typeObj) => {
  const listSubcatUrl = typeObj.url

  const listSubcatPage = await fetcher.getPageSource(listSubcatUrl)
  const dissectorVG = new Dissector() 
  const subCats = await dissectorVG.getSubcats(listSubcatPage)
}

const getListProductsGroup = async (listGroupObj) => {
  const listGroupUrl = listGroupObj.url

  const listGroupPage = await fetcher.getPageSource(listGroupUrl)
  const dissectorVG = new Dissector() 
  const groups = await dissectorVG.getListProductsGroup(listGroupPage)
}

const getListProds = async (listObj) => {
  const listProdUrl = listObj.url

  const listProdPage = await fetcher.getPageSource(listProdUrl)
  const dissectorVG = new Dissector() 
  const list = await dissectorVG.getListProductsGroup(listProdPage)
}

const getProdDetail = async (prodObj) => {
  const prodUrl = prodObj.url

  const prodPage = await fetcher.getPageSource(prodUrl)
  const dissectorVG = new Dissector() 
  const prod = await dissectorVG.getProdDetail(prodPage)
}
const exec = async () => {
  // const categorySourve = await fetcher.getPageSource("https://bachkhoa.org/danh-muc/he-thong-tu-dong-hoa/")
  // const dissectorVG = new Dissector() 
  // const cats = await dissectorVG.getListCategories(pageSource)


  // await getAllAccessType()
  // await getListSubcat(samepleTypePage)
  // await getListProductsGroup(sampleSubCat)
  // await getListProds(sampleGroup)

  await getProdDetail(sampleProd)



  console.log("============ ALL DONE")


}


exec()