const urlRegex = /^https?\:\/\/[a-zA-Z0-9-\.]+\/[\w\/\-\.\_\~\!\$\&\'\(\)\*\+\,\;\=\:\@\%\?]+?$/

function urlValidator (url) {
  const validation = urlRegex.test(url)
  return validation
}

module.exports = urlValidator