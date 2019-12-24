var fs = require('fs');

const imgDir = "../files/products/thegioidien/renamed"


fs.readdir(imgDir, (err, files) => {
  if(err) {
    console.log(err)
    return
  }

  files.forEach(file => {
    const fileNamePart = file.split(".")
    if (fileNamePart[fileNamePart.length - 1] == "png"){
      fileNamePart.pop()
      console.log(fileNamePart)
      fs.rename(imgDir + '/' + file, imgDir + '/' + fileNamePart.join('.') + '-2.png')
    }
    
  })
})
