const Fetcher = require('./fetcher')
const Dissector = require('./dissector')

const fetcher = new Fetcher()
const host = 'https://www.vatgia.com/'
const shopName = 'codiendika'

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
    await dissectorVG.getListProduct(categoryPage)

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
