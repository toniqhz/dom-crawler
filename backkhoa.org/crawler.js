const Fetcher = require('../fetcher')
const Dissector = require('./dissector')
const Utils = require('../utils')
const fetcher = new Fetcher()
const host = 'https://www.vatgia.com/'
const shopName = 'codiendika'

this.vatGiaSheetColumns = [
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

this.listCats = [
  {
    cat: "Biến tần, khởi động mềm, MCCB",
    list: [
      "https://bachkhoa.org/san-pham/bien-tan/",
      "https://bachkhoa.org/san-pham/contactor/",
      "https://bachkhoa.org/san-pham/khoi-dong-mem/",
      "https://bachkhoa.org/san-pham/mccb-thiet-bi-dong-cat/",
    ]
  },
  {
    cat: "Cảm biến thiết bị đo",
    list: [
      "https://bachkhoa.org/san-pham/cam-bien-quang/",
      "https://bachkhoa.org/san-pham/dong-ho-do/",
      "https://bachkhoa.org/san-pham/dong-ho-do-nhiet-do/",
      "https://bachkhoa.org/san-pham/thiet-bi-do-song/",
    ]
  },
  {
    cat: "Thiết bị điện công nghiệp",
    list: [
      "https://bachkhoa.org/san-pham/day-cap-dien/",
      "https://bachkhoa.org/san-pham/do-dong/",
      "https://bachkhoa.org/san-pham/ro-le-nhiet/",
      "https://bachkhoa.org/san-pham/thanh-dong-cai/",
    ]
  },  
  {
    cat: "Thiết kế hệ thống tự động hoá",
    list: [
      "https://bachkhoa.org/san-pham/plc/",
      "https://bachkhoa.org/san-pham/dong-co-ba-pha/",
      "https://bachkhoa.org/san-pham/he-thong-scada/",
      "https://bachkhoa.org/san-pham/man-hinh-hmi/"
    ]
  },
  {
    cat: "Tụ bù phản kháng",
    list: [
      "https://bachkhoa.org/san-pham/bo-dieu-khien/",
      "https://bachkhoa.org/san-pham/cuon-khang/",
      "https://bachkhoa.org/san-pham/tu-bu/",
      "https://bachkhoa.org/san-pham/tu-bu-cong-suat-phan-khang/"
    ]
  },
  {
    cat: "Tụ phân phối, điều khiển, ats",
    list: [
      "https://bachkhoa.org/san-pham/tu-ats/",
      "https://bachkhoa.org/san-pham/tu-ha-the/",
      "https://bachkhoa.org/san-pham/tu-dieu-khien/",
      "https://bachkhoa.org/san-pham/tu-chieu-sang/",
      "https://bachkhoa.org/san-pham/tu-phan-phoi/"
    ]
  }
    
]


const getAllProductFromCat = async (catObj) => {
  console.log("----------- crawl cat: ", JSON.stringify(catObj))
  let page = 0
  const dissectorVG = new Dissector() 
  // const firstUrl = host + catObj.url
  // const firstPage = await fetcher.getPageSource(firstUrl)
  // const maxPage = await dissectorVG.getMaxPageNumber(firstPage)
  // console.log("----------- maxPage", maxPage)


  
  // while(page <= maxPage){
  //   const url = host + catObj.url + "&page=" + page
  //   console.log("============= fetch category ", url)
  //   const categoryPage = await fetcher.getPageSource(url)
  //   const rows = await dissectorVG.getListProduct('vat_gia', categoryPage, catObj)
  //   await Utils.saveExcel('Vat Gia', 'vat_gia', this.vatGiaSheetColumns, rows)
  //   page = page + 1
  // }

  
  await Utils.asyncForEach(catObj.list, async itemUrl => {
    console.log("___________ fetch url", itemUrl)
    const itemPage = await fetcher.getPageSource(itemUrl)
    const rows = await dissectorVG.getProductDetail('back_khoa', itemPage, catObj)
    await Utils.saveExcel('BackKhoa.org', 'back_khoa', this.vatGiaSheetColumns, rows)
  })

}



const exec = async () => {
  // const categorySourve = await fetcher.getPageSource("https://bachkhoa.org/danh-muc/he-thong-tu-dong-hoa/")
  // const dissectorVG = new Dissector() 
  // const cats = await dissectorVG.getListCategories(pageSource)


  for (const cat of this.listCats) {
    await getAllProductFromCat(cat)
  }

  console.log("============ ALL DONE")


}


exec()
