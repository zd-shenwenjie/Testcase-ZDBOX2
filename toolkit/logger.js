const log4js = require('log4js')

log4js.configure({
  appenders: {
    consoleLog: {
      type: 'console'
    }
  },
  categories: {
    default: { appenders: ['consoleLog'], level: 'all' },
  }
})

module.exports = (category) => {
  return log4js.getLogger(category || 'consoleLog')
}
