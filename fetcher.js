const axios = require('axios')

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

}


module.exports = fetcher