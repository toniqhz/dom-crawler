const Fetcher = require('./fetcher')
const Dissector = require('./dissector')
const Utils = require('./utils')
const fetcher = new Fetcher()
const host = 'https://www.vatgia.com/'
const shopName = 'codiendika'

this.vatGiaSheetColumns = [
  { header: 'Category', key: 'category', width: 10 },
  { header: 'Id', key: 'id', width: 10 },
  { header: 'Product Name', key: 'name', width: 32 },
  { header: 'Picture Url', key: 'pictureUrl', width: 30},
  { header: 'Picture', key: 'picture', width: 30},
  { header: 'Detail', key: 'detail', width: 60},
  { header: 'Price', key: 'price', width: 10},
];


const getAllProductFromCat = async (path) => {
  let page = 0
  const dissectorVG = new Dissector() 
  const firstUrl = host + path
  const firstPage = await fetcher.getPageSource(firstUrl)
  const maxPage = await dissectorVG.getMaxPageNumber(firstPage)
  console.log("----------- maxPage", maxPage)


  
  while(page <= maxPage){
    const url = host + path + "&page=" + page
    console.log("============= fetch category ", url)
    const categoryPage = await fetcher.getPageSource(url)
    const rows = await dissectorVG.getListProduct('vat_gia', categoryPage)
    await Utils.saveExcel('Vat Gia', 'vat_gia', this.vatGiaSheetColumns, rows)
    page = page + 1
  }

  console.log("^^^^^^^^^^^^^^^ done load category with page = ", page)
  

}



const exec = async () => {
  const pageSource = await fetcher.getPageSource(host + shopName)
  const dissectorVG = new Dissector() 
  const cats = await dissectorVG.getListCategories(pageSource)


  getAllProductFromCat("codiendika&module=product&view=listudv&record_id=14881")



}


exec()
