const axios = require('axios')
const WebSocket = require('ws');
const EventEmitter = require('events');
const trycatch = require('../trycatchWrapper');
const logger = require('../logger')();
const swagServiceConfig = {default: {ipAddress: '192.168.1.99'}};

const BASE_URL = `http://${swagServiceConfig.default.ipAddress}/api/trace-service` // :6001
const WS_URL = `ws://${swagServiceConfig.default.ipAddress}:6001`

function SessionErrorHandler(functionName) {
  return (err) => {
    logger.error(`[traceToolkit.session.${functionName}] ${err.toString()}`)
    return null;  
  }
}

class Session {
  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(0);
  }

  __init() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(WS_URL);
      this.requestId = 1;

      this.ws.on('open', () => {
        logger.debug('[traceToolkit.session] start session');
        this.heartbeatInterval = setInterval(() => {
          this.ws.send(JSON.stringify({
            opcode: 'heartbeat',
            requestId: 0
          }));
        }, 5000)
        resolve();
      });
      this.ws.on('message', (data) => {
        const parsed = JSON.parse(data);
        const {opcode, requestId} = parsed;
        const resData = parsed.data;
        this.emitter.emit(`${opcode}_${requestId}`, resData);
      });
      this.ws.on('close', (code, reason) => {
        logger.debug(`[traceToolkit.session] session end. code: ${code}, reason: ${reason}`)
        this.__clearHeartbeat();
        reject();
      });
      this.ws.on('error', (error) => {
        logger.warn(`[traceToolkit.session] session error. reason: ${error.toString()}`)
        this.__clearHeartbeat();
        reject();
      });
    })
  }

  __clearHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  __sendReqByWS(opcode, data) {
    return new Promise((resolve, reject) => {
      const requestId = this.requestId++;
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('websocket not open'));
        return;
      }
      const timeout = setTimeout(() => {
        this.emitter.removeAllListeners(`${opcode}_${requestId}`);
        reject(new Error(`${opcode} ${requestId} timeout`));
      }, 20000);
      this.emitter.once(`${opcode}_${requestId}`, (resData) => {
        if (timeout) {
          clearTimeout(timeout);
        }
        resolve(resData);
      })
      this.ws.send(JSON.stringify({
        opcode,
        requestId,
        data
      }));
    })
  }

  __destroy() {
    this.__clearHeartbeat();
    this.ws.close();
    this.emitter.removeAllListeners(this.emitter.eventNames());
    return true;
  }

  async __addTracingChannel(channelData, converterNames) {
    const res = await this.__sendReqByWS('addChannel', {channel: channelData, codec: converterNames}).catch(SessionErrorHandler('addTracingChannel'));
    if (!res) {
      return null;
    }
    const channel = res.channel;
    logger.debug(`[traceToolkit.session.addTracingChannel] channel '${channel}' added`)
    return channel;
  }

  async __removeTracingChannel(channelData) {
    const res = await this.__sendReqByWS('removeChannel', {channel: channelData}).catch(SessionErrorHandler('removeTracingChannel'));
    if (!res) {
      return null;
    }
    const channel = res.channel;
    logger.debug(`[traceToolkit.session.removeTracingChannel] channel '${channel}' removed`)
    return channel;
  }

  async getTracingChannel() {
    const res = await this.__sendReqByWS('getChannel').catch(SessionErrorHandler('getTracingChannel'));
    if (!res) {
      return null;
    }
    return res;
  }

  addTracingChannel(channelOrIns, converterNames) {
    if (typeof channelOrIns.getCorrespondingTxTraceChannel === 'function') {
      channelOrIns.converterName = converterNames
      const channelTx = channelOrIns.getCorrespondingTxTraceChannel();
      const channelRx = channelOrIns.getCorrespondingRxTraceChannel();
      return this.__addTracingChannel(channelRx, converterNames).then(() => {
        return this.__addTracingChannel(channelTx, converterNames)
      });
    } else {
      const channel = channelOrIns
      if (typeof channel === 'object' && !channel.bus) {
        channel.bus = 'ipdu'
      }
      return this.__addTracingChannel(channel, converterNames);
    }
  }
  
  removeTracingChannel(channelOrIns) {
    if (typeof channelOrIns.getCorrespondingTxTraceChannel === 'function') {
      const channelTx = channelOrIns.getCorrespondingTxTraceChannel();
      const channelRx = channelOrIns.getCorrespondingRxTraceChannel();
      return this.__removeTracingChannel(channelRx).then(() => {
        return this.__removeTracingChannel(channelTx)
      });
    } else {
      const channel = channelOrIns
      return this.__removeTracingChannel(channel);
    }
  }

  async subscribePDU(subFunc, callback) {
    this.emitter.on('subscribe_0', (ipduMsgs) => {
      callback(ipduMsgs)
    })
    const res = await this.__sendReqByWS('setRule', {rule: subFunc.toString()}).catch(SessionErrorHandler('getTracingChannel'))
    if (!res) {
      return null;
    }
    return true;
  }

  subscribeSomeipService(someipServiceIns, idorNames, callback) {
    let ids = idorNames.reduce((ret, idorName) => {
      if (typeof idorName === 'string') {
        const id = someipServiceIns.getIdByName(idorName);
        if (!id) {
          logger.warn(`[traceToolkit.subscribeSomeipService] cant find name ${idorName}. ${idorName} ignored`)
        } else {
          ret.push(id);
        }
      } else if (typeof idorName === 'number') {
        ret.push(idorName)
      } else {
        logger.warn(`[traceToolkit.subscribeSomeipService] invalid param type ${idorName}. ${idorName} ignored`)
      }
      return ret
    }, [])
    console.log(idorNames, ids)
    const subFunc = `(pdu) => {
      if (!pdu) {
        return false;
      }
      if ([${ids}].length === 0) {
        return true;
      }
      const ids = [${ids}]
      return ids.some(ele => {
        if (!(pdu.parsed && pdu.parsed.header && pdu.parsed.header.messageId)) {
          return false
        }
        const eventId = pdu.parsed.header.messageId.eventId.toString()
        const methodId = pdu.parsed.header.messageId.methodId.toString()
        return ele.toString() === eventId || ele.toString() === methodId
      })
    }`
    return this.subscribePDU(subFunc, callback).then((key) => {
      return key
    })
  }
}

async function startSession() {
  const session = new Session();
  await session.__init();
  return session;
}

function stopSession(session) {
  session.__destroy();
  session = null;
}

function getConverter() {
  return axios.get(`${BASE_URL}/codec`).then(res => {
    return res.data
  })
}

function deleteConverter(name) {
  return axios.delete(`${BASE_URL}/codec`, {data: {name}}).then(res => {
    const delname = res.data.name
    logger.debug(`[traceToolkit.deleteConverter] converter ${delname} deleted`)
    return delname
  })
}

function createConverter(protocol, mod, path, tag) {
  return axios.post(`${BASE_URL}/codec`, {
    tag, protocol, mod, path
  }).then(res => {
    logger.debug(`[traceToolkit.createConverter] converter created`)
    return res.data.name
  })
}

function addSomeipConverterSpec(converterName, specPath) {
  return axios.post(`${BASE_URL}/codec/${converterName}/someip/spec`, {
    path: specPath
  }).then(res => {
    return res.data
  })
}

function addSomeipPorts(protocol, ports) {
  return axios.post(`${BASE_URL}/someip/config/ports?protocol=${protocol}`, {
    ports
  }).then(res => {
    return res.data
  })
}

const TCP_SOAD_URL = `http://${swagServiceConfig.default.ipAddress}/api/tcp-soad`
function addProtocolTag(protocol, tags) {
  return axios.post(`${TCP_SOAD_URL}/netif/config/tag/${protocol}`, tags).then(res => {
    return res.data
  })
}

function getProtocolTag(protocol) {
  return axios.get(`${TCP_SOAD_URL}/netif/config/tag/${protocol}`).then(res => {
    return res.data
  })
}

function deleteProtocolTag(protocol, tags) {
  return axios.delete(`${TCP_SOAD_URL}/netif/config/tag/${protocol}`, {data: tags}).then(res => {
    return res.data
  })
}

module.exports = trycatch({
  startSession,
  stopSession,
  getConverter,
  deleteConverter,
  createConverter,
  addSomeipConverterSpec,
  addSomeipPorts,
  addProtocolTag,
  getProtocolTag,
  deleteProtocolTag,
}, 'traceToolkit', logger)