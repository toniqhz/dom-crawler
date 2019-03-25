const Fetcher = require('../fetcher')
const Dissector = require('./dissector')
const Utils = require('../utils')
const fetcher = new Fetcher()
const host = 'https://www.vatgia.com/'
const shopName = 'codiendika'

this.vatTBKTColumns = [
  { header: 'Code', key: 'code', width: 10 },
  { header: 'Category', key: 'category', width: 10 },
  { header: 'Id', key: 'id', width: 10 },
  { header: 'Product Name', key: 'name', width: 32 },
  { header: 'Category Id', key: 'catId', width: 10 },
  { header: 'Category Name', key: 'catName', width: 32 },
  { header: 'Picture Url', key: 'pictureUrl', width: 30},
  { header: 'Picture', key: 'picture', width: 30},
  { header: 'Short Detail', key: 'shortDetail', width: 120},
  { header: 'Detail', key: 'detail', width: 200},
  { header: 'Price', key: 'price', width: 10},
];

const allCatUrl = "https://thietbikythuat.com.vn/thiet-bi/"

const getMainCategory = async () => {
  const allCatsPage = await fetcher.getPageSource(allCatUrl)
  const dissectorVG = new Dissector() 
  const cats = await dissectorVG.getMainCatWithChild(allCatsPage)

  // console.log("=============", Utils.logDeep(cats), typeof cats)

  for (const cat of cats) {
    
    for (const subCat of cat.childs) {
      // console.log("__________ sub", subCat)
      await getAllProductLinkFromCat(subCat)
    }
    // await Utils.asyncForEach(cat.childs, async subCatObj => {
    //   getAllProductLinkFromCat(subCatObj)
    // })
  }

}

const getAllProductLinkFromCat = async (catObj) => {
  console.log("----------- crawl cat: ",  catObj)

  const catUrl = catObj.s_url
  let page = 1
  const dissectorVG = new Dissector() 
  // const firstUrl = host + catObj.url
  const firstPage = await fetcher.getPageSource(catUrl)
  const maxPage = await dissectorVG.getMaxPageNumber(firstPage)


  // console.log("----------- maxPage", maxPage)


  
  while(page <= maxPage){
    const url = page > 1 ? catUrl + 'page/' + page + "/" : catUrl
    console.log("============= fetch category ", url)
    const categoryPage = await fetcher.getPageSource(url)
    const rows = await dissectorVG.getListProduct('thiet_bi_ky_thuat', categoryPage, catObj)
    await Utils.saveExcel('Thiet bi ky thuat', 'thiet_bi_ky_thuat', this.vatTBKTColumns, rows)
    page = page + 1
  }

  
  // await Utils.asyncForEach(catObj.list, async itemUrl => {
  //   console.log("___________ fetch url", itemUrl)
  //   const itemPage = await fetcher.getPageSource(itemUrl)
  //   const rows = await dissectorVG.getProductDetail('back_khoa', itemPage, catObj)
  //   await Utils.saveExcel('BackKhoa.org', 'back_khoa', this.vatGiaSheetColumns, rows)
  // })

}



const exec = async () => {
  // const categorySourve = await fetcher.getPageSource("https://bachkhoa.org/danh-muc/he-thong-tu-dong-hoa/")
  // const dissectorVG = new Dissector() 
  // const cats = await dissectorVG.getListCategories(pageSource)

  await getMainCategory()
  console.log("============ ALL DONE")


}


exec()
