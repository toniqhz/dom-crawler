const axios = require('axios')
const fetch = require('node-fetch');
const fs = require('fs')

class fetcher {
  constructor(){}

  async getPageSource(url){
    try {
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      console.log(error)
    }
  }

  async asyncFetchImg (url, savedPath) {
    const res = await fetch(url)
    const dest = fs.createWriteStream(savedPath);
    res.body.pipe(dest)
  }

}


module.exports = fetcher