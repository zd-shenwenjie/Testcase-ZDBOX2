const path = require('path');
const fs = require('fs-extra');
const assert = require('assert');
const axios = require('axios');
const chai = require('chai');

chai.should();

const traceToolkit = require('../toolkit/traceToolkit-v2');

const SERVER_SOMEIP_URL = 'http://192.168.1.125:5001';
const CLIENT_SOMEIP_URL = 'http://192.168.1.125:5001';
const MITM_URL = '192.168.1.99'
const server_config = fs.readJSONSync(path.join(__dirname, 'server.json'));
const client_config = fs.readJSONSync(path.join(__dirname, 'client.json'));
const service_spec = fs.readJSONSync(path.join(__dirname, '0xFF00_TestabilityService_V2.0.0F_CBox.json'))


const application_endpoint = "30500";

const serviceId = '65280';
var client_ins_id = ''
var server_ins_id = ''

let current_hook_id = '';
var converterKey;
var session;


before('create client and server instance', () => {
  //create client instance
  it('create someip simulation client instance', async () => {
    const res = await axios.post(`${CLIENT_SOMEIP_URL}/instance`, client_config);
    console.log(res.data);
  });

  // create server instance
  it('create someip simulation server instance', async () => {
    const res = await axios.post(`${SERVER_SOMEIP_URL}/instance`, server_config);
    //console.log(res.data);
  });

  //start client instance
  it('get client instance & start someip simulation client instance', async () => {
    let res = await axios.get(`${CLIENT_SOMEIP_URL}/instance`);
    client_ins_id = 'someip-client_1.0.0_2';
    res = await axios.post(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/start`);
    console.log(res.data);
  });

  it('get server instance & start someip simulation server instance', async () => {
    let res = await axios.get(`${SERVER_SOMEIP_URL}/instance`);
    server_ins_id = 'someip-server_1.0.0_1';
    res = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/start`);
  })

  it('setup tracing service', async () => {
    converterKey = await traceToolkit.createConverter("SOMEIP", '', './someip/fibex/0xFF00_TestabilityService_V2.0.0F_CBox.json');
    console.log(await traceToolkit.addSomeipConverterSpec(converterKey
      //, './someip/fibex/0x190_VoiceManagerService_V1.8.10F.json'
    ))
    console.log(await traceToolkit.addSomeipPorts('tcp', [Number(application_endpoint)]))
    console.log(await traceToolkit.getConverter());
    session = await traceToolkit.startSession();
    console.log(await session.getTracingChannel());
    console.log(await session.addTracingChannel({
      bus: 'ipdu',
      srcPort: application_endpoint,
      srcIP: 'fd:53:7c:b8:03:83:00:04:00:00:00:00:00:00:00:1',
      dstIP: 'fd:53:7c:b8:03:83:00:03:00:00:00:00:00:00:00:67'
    }, [converterKey, 'default-arxml']));
    const channels = await session.getTracingChannel();
    console.log(channels)
  })
})

// ----------------------------------------------------------end-----------------------------------------------------------
after('clear all env', () => {
  //stop serve instance
  it('test stop all someip simulation instance', async () => {
    const server_ins_id = 'someip-server_1.0.0_1';
    const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/stop`);
    console.log(res.data);
  });

  //delete all server instances
  it('test delete all someip simulation instances', async () => {
    const res = await axios.delete(`${SERVER_SOMEIP_URL}/instance`);
    console.log(res.data);
  });

  it('test stop all someip simulation instance', async () => {
    let client_ins_id = 'someip-client_1.0.0_2';
    const res = await axios.post(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/stop`);
    console.log(res.data);
  });

  // delete all client instances
  it('test delete all someip simulation instances', async () => {
    const res = await axios.delete(`${CLIENT_SOMEIP_URL}/instance`);
    console.log(res.data);
  })

  //stop tracing
  it('stop tracing by using trace toolkit', async () => {
    toolkit.stopSession(session)
    toolkit.deleteConverter(converterKey)
  })
})

describe('test get payload Server & Client', () => {
  //  --------------get (each) payload client side---------
  describe('client: get someip service payload obj', () => {
    const appPort = application_endpoint;
    const serviceId = 65280;
    const direction = 'input'; // 'input' | 'return'
    service_spec.services[0]['methods'].forEach(async method => {
      const methodId = method['num_id']
      it(`Method ${methodId}: ${method['name']} `, async (done) => {
        const res = await axios.get(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload`);
        console.log(res.data);
      })
    });
  })
  describe('Server: get someip service payload obj', async () => {
    // const service_spec = fs.readJSONSync(path.join(__dirname, '0xFF00_TestabilityService_V2.0.0F_CBox.json'))
    const appPort = application_endpoint;
    const serviceId = 65280;
    const direction = 'return'; // 'input' | 'return'
    service_spec.services[0]['methods'].forEach(async method => {
      const methodId = method['num_id']
      it(`Method ${methodId}: ${method['name']} `, async (done) => {
        const res = await axios.get(`${CLIENT_SOMEIP_URL}/instance/${server_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload`);
        console.log(res.data);
      })
    });
  })
})

// ---------------set & get payload, payload encode & decode and Validation-------
describe('payload set & get & encode & decode', () => {
  // dynamic test case for payload validation
  // 1. Get Object from Client & Server Side
  // 2. random modify value 
  // 3. set Data
  // 4. get Data
  // 5. getted Data should be equal with the random data
  // 6. using encoder to generate a byte Stream
  // 7. using decoder to parser the byte Stream 
  // 8. parsered date should be equal with the random data
  describe('client side set & get & Decoder & Encoder', async () => {
    service_spec.services[0]['methods'].forEach(async (method) => {
      it(`Method ${method['num_id']}: ${method['name']}`, async () => {
        methodId = method['num_id']
        const appPort = application_endpoint;
        const direction = 'input';
        const res_get = await axios.get(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload`);
        console.log(res_get.data);
        // testObj {
        //   outUINT16: 5, outUINT32: 6
        // }
        let testObj = res_get.data;
        let first_level_keys = Object.keys(testObj);
        first_level_keys.forEach(paramKey => {
          testObj[paramKey] = Math.random() * 10000;
        })
        const res_set = await axios.post(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload`, testObj);
        console.log(res_set.data)
        const res_get2 = await axios.get(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload`);
        console.log(res_get2.data)
        // assertion 5
        res_get2.data.should.equal(testObj);

        const res_encode = await axios.post(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload/encode`,
          testObj
        );
        console.log(res_encode.data);
        let testByteStream = res_encode.data;
        const res_decode = await axios.post(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload/decode`,
          testByteStream
        )
        // testByteStream{
        //   type: 'Buffer',
        //   data: [0, 5, 0, 0, 0, 6 ]
        // }
        console.log(res_decode.data)
        let finalObj = res_decode.data
        finalObj.should.equal(testObj)
      })
    });
  })

  describe('server side set & get & Decoder & Encoder', async () => {
    service_spec.services[0]['methods'].forEach(async (method) => {
      it(`Method ${method['num_id']}: ${method['name']}`, async () => {
        methodId = method['num_id']
        const appPort = application_endpoint;
        const direction = 'return';
        const res_get = await axios.get(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload`);
        console.log(res_get.data);
        // testObj {
        //   outUINT16: 5, outUINT32: 6
        // }
        let testObj = res_get.data;
        let first_level_keys = Object.keys(testObj);
        first_level_keys.forEach(paramKey => {
          testObj[paramKey] = Math.random() * 10000;
        })
        const res_set = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload`, testObj);
        console.log(res_set.data)
        const res_get2 = await axios.get(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload`);
        console.log(res_get2.data)
        // assertion 5
        res_get2.data.should.equal(testObj);

        const res_encode = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload/encode`,
          testObj
        );
        console.log(res_encode.data);
        let testByteStream = res_encode.data;
        const res_decode = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload/decode`,
          testByteStream
        )
        // testByteStream{
        //   type: 'Buffer',
        //   data: [0, 5, 0, 0, 0, 6 ]
        // }
        console.log(res_decode.data)
        let finalObj = res_decode.data
        finalObj.should.equal(testObj)
      })
    });
  })
})

// ---------------header ---------------------------------------------------------
// header decode & encode should be done by unit test
describe('someip header encode & decode', async () => {
  describe('client side header encode & decode', async () => {
    // encode someip header
    it('encode someip header by parameter', async () => {
      const client_ins_id = 'someip-client_1.0.0_2';
      const appPort = application_endpoint;
      const res = await axios.post(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/${appPort}/header/encode`, {
        messageId: {
          serviceId: Number(serviceId),
          methodId: 1
        },
        length: 8 + 6, //(8+buffer's length)
        messageType: 0, // REQUEST=0  REQUEST_NO_RETURN=1 NOTIFICATION=2
      });
      // console.log(res.data);
    });

    it('encode someip header by header object', async () => {
      const res = await axios.post(`${CLIENT_SOMEIP_URL}/instance/header/encode`, {
        messageId: {
          serviceId: Number(serviceId),
          methodId: 1
        },
        length: 8 + 6, //(8+buffer's length)
        requestId: {
          clientId: 1,
          sessionId: 1
        },
        protocolVersion: 1,
        interfaceVersion: 1,
        messageType: 0, // REQUEST=0  REQUEST_NO_RETURN=1 NOTIFICATION=2
        returnCode: 0 // OK = 0x00
      });
      console.log(res.data);
    });
  })

  describe('server side header encode & decode', async () => {
    // encode someip header
    it('encode someip header by parameter', async () => {
      const server_ins_id = 'someip-server_1.0.0_1';
      const appPort = application_endpoint;
      const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/${appPort}/header/encode`, {
        messageId: {
          serviceId: 65280,
          methodId: 1
        },
        length: 8 + 6, //(8+buffer's length)
        messageType: 0, // REQUEST=0  REQUEST_NO_RETURN=1 NOTIFICATION=2
      });
      // console.log(res.data);
    });
    it('encode someip header by header object', async () => {
      const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/header/encode`, {
        messageId: {
          serviceId: 65280,
          methodId: 1
        },
        length: 8 + 6, //(8+buffer's length)
        requestId: {
          clientId: 1,
          sessionId: 1
        },
        protocolVersion: 1,
        interfaceVersion: 1,
        messageType: 0, // REQUEST=0  REQUEST_NO_RETURN=1 NOTIFICATION=2
        returnCode: 0 // OK = 0x00
      });
      console.log(res.data);
    });
  })
})

// ---------------PDU-------------------------------------------------------------
describe('someip PDU encode & decode', async () => {
  describe('client side PDU encode & decode', async () => {
    it('test decode someip pdu', async () => {
      const client_ins_id = 'someip-client_1.0.0_2';
      const appPort = application_endpoint;
      const direction = 'input';
      const res = await axios.post(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/${appPort}/${direction}/pdu/decode`, {
        type: 'Buffer',
        data: [255, 0, 0, 1, 0, 0, 0,
          14, 0, 1, 0, 1, 1, 1,
          0, 0, 0, 5, 0, 0, 0,
          6
        ]
      });
      console.log(res.data);
    });
  })

  describe('server side PDU encode & decode', async () => {
    it('test encode someip pdu', async () => {
      const server_ins_id = 'someip-server_1.0.0_1';
      const appPort = application_endpoint;
      const direction = 'return';
      const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/${appPort}/${direction}/pdu/encode`, {
        header: {
          messageId: {
            serviceId: 65280,
            methodId: 1
          },
          length: 8 + 6, //(8+buffer's length)
          requestId: {
            clientId: 1,
            sessionId: 1
          },
          protocolVersion: 1,
          interfaceVersion: 1,
          messageType: 0, // REQUEST=0  REQUEST_NO_RETURN=1 NOTIFICATION=2
          returnCode: 0 // OK = 0x00
        },
        payload: {
          outUINT16: 5,
          outUINT32: 6
        }
      })
      console.log(res.data);
    });
  })
})

describe('Integration: client send & server tracing', async () => {
  // dynamic test case for payload validation
  // 1. Get Object from Client
  // 2. random modify value 
  // 3. encode payload
  // 4. send Data
  // 5. assertion on server side: parsed payload should be equal with modified data

  describe('client side get->random->set->send and receive by server monitor', async () => {
    service_spec.services[0]['methods'].forEach(async (method) => {
      it(`Method ${method['num_id']}: ${method['name']}`, async (done) => {
        this.timeout(3000);
        methodId = method['num_id']

        const direction = 'input';
        const res_get = await axios.get(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload`);
        console.log(res_get.data);
        // testObj {
        //   outUINT16: 5, outUINT32: 6
        // }
        let testObj = res_get.data;
        let first_level_keys = Object.keys(testObj);
        first_level_keys.forEach(paramKey => {
          testObj[paramKey] = Math.random() * 10000;
        })
        const res_set = await axios.post(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload`, testObj);
        console.log(res_set.data)
        const res_get2 = await axios.get(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload`);
        console.log(res_get2.data)
        // assertion 5
        res_get2.data.should.equal(testObj);
        // testByteStream{
        //   type: 'Buffer',
        //   data: [0, 5, 0, 0, 0, 6 ]
        // }
        //send
        const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/${client_ins_id}/${appPort}/${direction}/pdu/send`, {
          header: {
            messageId: {
              serviceId: 65280,
              methodId
            },
            // length: 8+6,
            // requestId: {
            //   clientId: 1,
            //   sessionId: 1
            // },
            // protocolVersion: 1,
            // interfaceVersion: 1,
            // messageType: 0, // REQUEST=0  REQUEST_NO_RETURN=1 NOTIFICATION=2
            // returnCode: 0 // OK = 0x00
          },
          testObj
        });

        await session.subscribePDU(() => {
          return true
        }, (pdus) => {
          pdus.forEach(ele => {
            if (ele.parsed) {
              console.dir(ele, {
                depth: null
              })
            }
            ele.parsed.header.should.include({
              messageId: {
                serviceId: 65280,
                methodId: 1
              }
            });
            ele.parsed.payload.should.equal(testObj)
            done()
          })
        })
      })
    });
  })
})

describe('Integration: client send PDU & server tracing', async () => {
  //send pdu buffer by pdu obj
  it('test send someip pdu buffer by pdu obj', async () => {
    const client_ins_id = 'someip-client_1.0.0_2';
    const appPort = application_endpoint;
    const direction = 'return';
    const res = await axios.post(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/${appPort}/${direction}/pdu/send`, {
      header: {
        messageId: {
          serviceId: 65280,
          methodId: 1
        },
        length: 8 + 6,
        requestId: {
          clientId: 1,
          sessionId: 1
        },
        protocolVersion: 1,
        interfaceVersion: 1,
        messageType: 0, // REQUEST=0  REQUEST_NO_RETURN=1 NOTIFICATION=2
        returnCode: 0 // OK = 0x00
      },
      payload: {
        outUINT16: 5,
        outUINT32: 6
      }
    });
    console.log(res.data);
    await session.subscribePDU(() => {
      return true
    }, (pdus) => {
      pdus.forEach(ele => {
        if (ele.parsed) {
          console.dir(ele, {
            depth: null
          })
        }
        // ele.parsed.header.should.include({
        //   messageId: {
        //     serviceId: 65280,
        //     methodId: 1
        //   }
        // });
        // ele.parsed.payload.should.equal(testObj)
        // done()
      })
    })
  });


  it('test send someip pdu buffer', async () => {
    const client_ins_id = 'someip-client_1.0.0_2';
    const appPort = application_endpoint;
    const res = await axios.post(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/${appPort}/pdu/send`, {
      type: 'Buffer',
      data: [255, 0, 0, 1, 0, 0, 0,
        14, 0, 1, 0, 1, 1, 1,
        0, 0, 0, 5, 0, 0, 0,
        6
      ]
    });
    console.log(res.data);
    await session.subscribePDU(() => {
      return true
    }, (pdus) => {
      pdus.forEach(ele => {
        // if (ele.parsed) {
        //   console.dir(ele, {
        //     depth: null
        //   })
        // }
        // ele.parsed.header.should.include({
        //   messageId: {
        //     serviceId: 65280,
        //     methodId: 1
        //   }
        // });
        // ele.parsed.payload.should.equal(testObj)
        done()
      })
    })
  });
  //two cases run 10 times
})

describe('Integration: server send PDU & client tracing', () => {
  //two cases run 10 times
  it('test send someip pdu buffer', async () => {
    const server_ins_id = 'someip-server_1.0.0_1';
    const appPort = application_endpoint;
    const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/${appPort}/pdu/send`, {
      type: 'Buffer',
      data: [255, 0, 0, 1, 0, 0, 0,
        14, 0, 1, 0, 1, 1, 1,
        0, 0, 0, 5, 0, 0, 0,
        6
      ]
    });
    console.log(res.data);
  });
  //send pdu buffer by pdu obj
  it('test send someip pdu buffer by pdu obj', async () => {
    const server_ins_id = 'someip-server_1.0.0_1';
    const appPort = application_endpoint;
    const direction = 'return';
    const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/${appPort}/${direction}/pdu/send`, {
      header: {
        messageId: {
          serviceId: 65280,
          methodId: 1
        },
        length: 8 + 6,
        requestId: {
          clientId: 1,
          sessionId: 1
        },
        protocolVersion: 1,
        interfaceVersion: 1,
        messageType: 0, // REQUEST=0  REQUEST_NO_RETURN=1 NOTIFICATION=2
        returnCode: 0 // OK = 0x00
      },
      payload: {
        outUINT16: 5,
        outUINT32: 6
      }
    });
    console.log(res.data);
  });

})

// TODO: with 3 Ye finish call back test case
describe('Integration: server callback & client send & server echo message back & assert by client', () => {
  // two method should be tested
  describe('methode 1', () => {
    it('test add someip service rule', async () => {
      const server_ins_id = 'someip-server_1.0.0_1';
      const appPort = application_endpoint;
      const type = 'afterDecode'; // 'beforeDecode' | 'afterDecode' | 'beforeEncode' | 'afterEncode'
      const condition = (sourceChannel, message, service) => {
        const {
          header
        } = message;
        const methodId = header.messageId.methodId;
        console.log('hello condition func => methodId:', header.messageId);
        return methodId % 2 === 0;
      };
      const todo = (sourceChannel, message, service) => {
        // TODO send echo back to client
      };
      const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/${appPort}/rule`, {
        type,
        condition: condition.toString(),
        todo: todo.toString()
      });
      console.log(res.data);
      if (res.data.code === 200) {
        current_hook_id = res.data.data;
        console.log('current_hook_id=', current_hook_id);
      }
    });
    it('using client to send a request')
    it('tracing on client side to get result')
  })
  describe('methode 2', () => {

  })
})