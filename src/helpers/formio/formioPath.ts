const path = require('path')
var fs = require('fs')

function formioPath(model, customModel) {
  const customPath = path.join('../models/formio', model, customModel)
  if (fs.existsSync(customPath)) {
    return require(path.join('../models/formio', model, customModel))
  }
  return {}
}

module.exports = formioPath
