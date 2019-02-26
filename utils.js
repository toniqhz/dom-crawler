const fs = require('fs')



module.exports = {
  writeFilePromise: (path, data, fileEncoding) => {
    return new Promise(function(resolve, reject) {
      fs.writeFile(path, data, fileEncoding, function(err) {
          if (err) reject(err);
          else resolve(data);
      });
    });
  },

  extractURlQuery: (query) => {
    return query
      ? (/^[?#]/.test(query) ? query.slice(1) : query)
      .split('&')
      .reduce((params, param) => {
      const [key, value] = param.split('=');
      params[key] = value ? decodeURIComponent(value.replace(/\\+/g, ' ')) : '';
      return params;
      }, {})
      : {};
  },

  paramQuery: (data) =>  {
    const formEncodeURIComponent = uri => encodeURIComponent(uri).replace(/%20/g, '+');
    return Object.keys(data).sort().map(k => `${formEncodeURIComponent(k)}=${formEncodeURIComponent(data[k])}`).join('&');
  }
}