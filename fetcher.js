const axios = require('axios')
const fetch = require('node-fetch');
const fs = require('fs')

class fetcher {
  constructor(){}

  async getPageSource(url){
    var timedOutRequest = new Promise(function(resolve, reject) {
        setTimeout(resolve, 15000, null);
    });
    return new Promise((resolve, reject) => {

      Promise.race([axios.get(url, {timeout: 5000}), timedOutRequest])
      .then(response => {
        if(!response) throw "retry"
        resolve(response.data)
      }).catch(error => {

        console.log("~~~~~~~~~~~~ retry request 1 times")
        Promise.race([axios.get(url, {timeout: 5000}), timedOutRequest])
        .then(response2 => {
          if(!response2) throw "retry"
          resolve(response2.data)
        }).catch(error => {

          console.log("~~~~~~~~~~~~ retry request 2 times")
          Promise.race([axios.get(url, {timeout: 5000}), timedOutRequest])
          .then(response3 => {
            if(!response3) throw "no data"
            resolve(response3.data)
          }).catch(error => {
            console.log("~~~~~~~~~~~~ retry request 3 times still fail")
            // console.log(error)
            reject(error)
          })
          
        })
      })
    })

    // try {
    //   console.log("~~~~~~~~~~~~1 run to axios", url)
    //   const response = await axios.get(url, {timeout: 5000})
    //   console.log("~~~~~~~~~~~~2 axios done", url)
    //   return response.data
    // } catch (error) {
    //   console.log("~~~~~~~~~~~~ retry request 1 times")

    //   try {
    //     const response2 = await axios.get(url, {timeout: 5000})
    //     return response2.data
    //   } catch (error) {
    //     console.log("~~~~~~~~~~~~ retry request 2 times")

    //     try {
    //       const response3 = await axios.get(url, {timeout: 5000})
    //       return response3.data
    //     } catch (error) {
    //       console.log("~~~~~~~~~~~~ retry request 3 times still fail")
    //       console.log(error)
    //       return null
    //     }
    //   }
    // }
  }

  async asyncFetchImg (url, savedPath) {
    const res = await fetch(url)
    const dest = fs.createWriteStream(savedPath);
    res.body.pipe(dest)
  }

}


module.exports = fetcher