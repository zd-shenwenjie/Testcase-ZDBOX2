const axios = require('axios')

const httpErrorHandlerGenerator = (funcName, toolkitName, logger) => (err) => {
  if (err.response) {
    const url = `${err.request.method} ${err.request.path}`
    const { status } = err.response
    if (status === 400 || status === 500) {
      const {code, extra} = err.response.data
      const message = err.response.data.message || err.response.data.msg
      logger.error(`[${toolkitName}.${funcName}] ${url} failed. status ${status}, code: ${code}, msg: ${message}${extra ? ', extra: ' + extra : ''}`)
    } else {
      let extra = ''
      if (err.response.data) {
        const {code, message, status} = err.response.data
        extra = `${code ? 'code: ' + code : ''}${message ? ', msg: ' + message : ''}${status ? ', status: ' + status : ''}`
      }
      logger.error(`[${toolkitName}.${funcName}] ${url} failed. status ${status}. ${err.toString()}. ${extra}`)
    }
  } else {
    logger.error(`[${toolkitName}.${funcName}] unknown error occur. ${err.toString()}`)
  }
  return null;
}

function errorHandlerGenerator(funcname, toolkitName, logger) {
  const httpErrorHandler = httpErrorHandlerGenerator(funcname, toolkitName, logger)
  return (err) => {
    if (axios.isAxiosError(err)) {
      httpErrorHandler(err)
    } else {
      logger.error(`[${toolkitName}.${funcname}] error occur. ${err.toString()}`)
    }
    return null;
  }
}

const trycatchWrapper = (funcname, func, toolkitName, logger, thisPtr) => {
  const errorHandler = errorHandlerGenerator(funcname, toolkitName, logger)
  return (...args) => {
    try {
      const ret = func.apply(thisPtr, args)
      if (ret instanceof Promise) {
        return ret.catch(errorHandler)
      } else {
        return ret;
      }
    } catch (err) {
      errorHandler(err)
    }
  }
}

module.exports = (funcs, toolkitName='toolkit', logger=console, thisPtr={}) => {
  const exModules = {}
  Object.keys(funcs).forEach(funcname => {
    const func = funcs[funcname]
    exModules[funcname] = trycatchWrapper(funcname, func, toolkitName, logger, thisPtr)
  })
  return exModules
}