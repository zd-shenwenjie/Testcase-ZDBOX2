const path = require('path');
const fs = require('fs-extra');
const assert = require('assert');
const axios = require('axios');
const chai = require('chai');

chai.should();

const SERVER_SOMEIP_URL = 'http://192.168.1.125:5001';
const CLIENT_SOMEIP_URL = 'http://192.168.1.125:5001';
const server_config = fs.readJSONSync(path.join(__dirname, 'server.json'));
const client_config = fs.readJSONSync(path.join(__dirname, 'client.json'));
const service_spec = fs.readJSONSync(path.join(__dirname, '0xFF00_TestabilityService_V2.0.0F_CBox.json'))


const application_endpoint = "30500";

const serviceId = '65280';
var client_ins_id = ''
var server_ins_id = ''

let current_hook_id = '';
var converterKey = await toolkit.createConverter("SOMEIP", '', './someip/fibex/0xFF00_TestabilityService_V2.0.0F_CBox.json');
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
    const res = await axios.get(`${CLIENT_SOMEIP_URL}/instance`);
    client_ins_id = 'someip-client_1.0.0_2';
    const res = await axios.post(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/start`);
      console.log(res.data);
  });

  it('get server instance & start someip simulation server instance', async () => {
    const res = await axios.get(`${SERVER_SOMEIP_URL}/instance`);
    server_ins_id = 'someip-server_1.0.0_1';
    const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/start`);
  })

  it('setup tracing service', async () => {
    console.log(await toolkit.addSomeipConverterSpec(converterKey
        //, './someip/fibex/0x190_VoiceManagerService_V1.8.10F.json'
        ))
    console.log(await toolkit.addSomeipPorts('tcp', [Number(application_endpoint)]))
    console.log(await toolkit.getConverter());
    session = await toolkit.startSession();
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
    it('stop tracing by using trace toolkit', async() => {
        toolkit.stopSession(session)
        toolkit.deleteConverter(converterKey)
    })
})
//----------------------------------------------------------CLIENT----------------------------------------------------------

describe('test get payload Server & Client', () => {
//  --------------get (each) payload client side---------
  it('client: get someip service payload obj', async () => {
    const appPort = application_endpoint;
    const serviceId = 65280;
    const methodId = 1;
    const direction = 'input'; // 'input' | 'return'
    service_spec.services[0]['methods'].forEach(async method => {
      methodId = method['num_id']
      const res = await axios.get(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload`);
      console.log(res.data);
    });
  })
  it('Server: get someip service payload obj', async () => {
    // const service_spec = fs.readJSONSync(path.join(__dirname, '0xFF00_TestabilityService_V2.0.0F_CBox.json'))
    const appPort = application_endpoint;
    const serviceId = 65280;
    let methodId = 1;
    const direction = 'input'; // 'input' | 'return'
    service_spec.services[0]['methods'].forEach(async method => {
      methodId = method['num_id']
      const res = await axios.get(`${CLIENT_SOMEIP_URL}/instance/${server_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload`);
      console.log(res.data);
    });
  })
})

// ---------------set payload and Validation-------
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
  it('client side Decoder & Encoder', async () => {
    service_spec.services[0]['methods'].forEach(async method => {
      methodId = method['num_id']
      const direction = 'input'; 
      const res_get = await axios.get(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload`);
      console.log(res_get.data);
      // testObj {
      //   outUINT16: 5, outUINT32: 6
      // }
      let testObj = res_get.data;
      let first_level_keys = Object.keys(testObj);
      first_level_keys.forEach( paramKey => {
        testObj[paramKey] = Math.random() * 10000;
      })
      const res_set = await axios.post(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload`, testObj);
      console.log(res_set.data)
      const res_get2 = await axios.get(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload`);
      console.log(res_get2.data)
      // assertion 5

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
    });
  })

  // it('Method 1: checkByteOrder', async () => {
  //   // create a object by get 

  // })
  // it('Method 2: echoUint8', async () => {
    
  // })
  // it('Method 3: ...', async () => {
    
  // })
  // ....
  it('test set someip service payload', async () => {
    const service_spec = fs.readJSONSync(path.join(__dirname, '0xFF00_TestabilityService_V2.0.0F_CBox.json'))
    const client_ins_id = 'someip-client_1.0.0_2';
    const appPort = application_endpoint;
    const methodId = 1;
    const serviceId = 65280;
    const direction = 'return'; // 'input' | 'return'
      const res = await axios.post(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload`, { outUINT16: 5, outUINT32: 6  });
      console.log(res.data);
    });
  it('test get someip service payload', async () => {
    // const service_spec = fs.readJSONSync(path.join(__dirname, '0xFF00_TestabilityService_V2.0.0F_CBox.json'))
    const client_ins_id = 'someip-client_1.0.0_2';
    const appPort = application_endpoint;
    const serviceId = 65280;
    const methodId = 1;
    const direction = 'return'; // 'input' | 'return'
    // let methodeIdList = service_spec.services[0]['methods']
    // methodeIdList.forEach(async method => {
    //   methodId = method['num_id']
      const res = await axios.get(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload`);
      console.log(res.data);
      //todo  add assert
    // });
    })
})

describe('client send & server tracing', () => {

})

describe('server callback & client send & server echo message back', () => {
  // two method should be tested
})




// ---------------modul of encode------------------
    // encode someip payload
describe('simulation.test.js', () => {
    it('test encode someip payload', async () => {
    // const service_spec = fs.readJSONSync(path.join(__dirname, '0xFF00_TestabilityService_V2.0.0F_CBox.json'))
    const client_ins_id = 'someip-client_1.0.0_2';
    const appPort = application_endpoint;
    const methodId = 1;
    const direction = 'return';
    // let methodeIdList = service_spec.services[0]['methods']
    // methodeIdList.forEach(async method => {
    //   methodId = method['num_id']
      const res = await axios.post(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload/encode`, {
        outUINT16: 5, outUINT32: 6
      });
      console.log(res.data);
    });

    // encode someip header
    it('test encode someip header by parameter', async () => {
      const client_ins_id = 'someip-client_1.0.0_2';
      const appPort = application_endpoint;
      const res = await axios.post(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/${appPort}/header/encode`, {
        messageId: {
          serviceId: 65280,
          methodId: 1
        },
        length: 8+6,//(8+buffer's length)
        messageType: 0, // REQUEST=0  REQUEST_NO_RETURN=1 NOTIFICATION=2
      });
      // console.log(res.data);
    });
    it('test encode someip header by header object', async () => {
      const res = await axios.post(`${CLIENT_SOMEIP_URL}/instance/header/encode`, {
        messageId: {
          serviceId: 65280,
          methodId: 1
        },
        length: 8+6,//(8+buffer's length)
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
    // encode someip pdu
    it('test encode someip pdu', async () => {
      const client_ins_id = 'someip-client_1.0.0_2';
      const appPort = application_endpoint;
      const direction = 'return';
      const res = await axios.post(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/${appPort}/${direction}/pdu/encode`, {
        header: {
          messageId: {
            serviceId: 65280,
            methodId: 1
          },
          length: 8+6,//(8+buffer's length)
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
          outUINT16: 5, outUINT32: 6}
        })
        console.log(res.data);
    });
      
})

//-----------------modul of decode-----------------
describe('simulation.test.js', () => {
//decode someip payload
it('test decode someip payload', async () => {
  const client_ins_id = 'someip-client_1.0.0_2';
  const appPort = application_endpoint;
  const serviceId = '65280';
  const methodId = 1;
  const direction = 'return';
  const res = await axios.post(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload/decode`, {
    type: 'Buffer',
    data: [0, 5, 0, 0, 0, 6 ]
  });
  console.log(res.data);
});

//decode someip pdu
it('test decode someip pdu', async () => {
  const client_ins_id = 'someip-client_1.0.0_2';
  const appPort = application_endpoint;
  const direction = 'return';
  const res = await axios.post(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/${appPort}/${direction}/pdu/decode`, {
    type: 'Buffer',
    data: [      255, 0, 0, 1, 0, 0, 0,
      14, 0, 1, 0, 1, 1, 1,
       0, 0, 0, 5, 0, 0, 0,
       6]
  });
  console.log(res.data);
});
})
//-----------------modul of send-------------------
  //send pdu buffer
describe('simulation.test.js', () => {
    it('test send someip pdu buffer', async () => {
    const client_ins_id = 'someip-client_1.0.0_2';
    const appPort = application_endpoint;
    const res = await axios.post(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/${appPort}/pdu/send`, {
      type: 'Buffer',
      data: [      255, 0, 0, 1, 0, 0, 0,
        14, 0, 1, 0, 1, 1, 1,
         0, 0, 0, 5, 0, 0, 0,
         6]
    });
    console.log(res.data);
    });
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
        length: 8+6,
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
        outUINT16: 5, outUINT32: 6
      }
    });
    console.log(res.data);
    });
})




//----------------------------------------------------------SEVER-----------------------------------------------------------
//  --------------get (each) payload sever---------
describe('simulation.test.js', () => {

  it('test get someip service payload', async () => {
    // const service_spec = fs.readJSONSync(path.join(__dirname, '0xFF00_TestabilityService_V2.0.0F_CBox.json'))
    const server_ins_id = 'someip-server_1.0.0_1';
    const appPort = application_endpoint;
    const serviceId = 65280;
    const methodId = 1;
    const direction = 'return'; // 'input' | 'return'
    // let methodeIdList = service_spec.services[0]['methods']
    // methodeIdList.forEach(async method => {
    //   methodId = method['num_id']
      const res = await axios.get(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload`);
      console.log(res.data);
    // });
  })
})

// ---------------set payload and Validation-------
describe('simulation.test.js', () => {
  it('test set someip service payload', async () => {
    const service_spec = fs.readJSONSync(path.join(__dirname, '0xFF00_TestabilityService_V2.0.0F_CBox.json'))
    const server_ins_id = 'someip-server_1.0.0_1';
    const appPort = application_endpoint;
    const methodId = 1;
    const serviceId = 65280;
    const direction = 'return'; // 'input' | 'return'
      const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload`, { outUINT16: 5, outUINT32: 6  });
      console.log(res.data);
    });
  it('test get someip service payload', async () => {
    // const service_spec = fs.readJSONSync(path.join(__dirname, '0xFF00_TestabilityService_V2.0.0F_CBox.json'))
    const server_ins_id = 'someip-server_1.0.0_1';
    const appPort = application_endpoint;
    const serviceId = 65280;
    const methodId = 1;
    const direction = 'return'; // 'input' | 'return'
    // let methodeIdList = service_spec.services[0]['methods']
    // methodeIdList.forEach(async method => {
    //   methodId = method['num_id']
      const res = await axios.get(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload`);
      console.log(res.data);
      //todo  add assert
    // });
    })
})

// ---------------modul of encode------------------
    // encode someip payload
describe('simulation.test.js', () => {
    it('test encode someip payload', async () => {
    // const service_spec = fs.readJSONSync(path.join(__dirname, '0xFF00_TestabilityService_V2.0.0F_CBox.json'))
    const server_ins_id = 'someip-server_1.0.0_1';
    const appPort = application_endpoint;
    const methodId = 1;
    const direction = 'return';
    // let methodeIdList = service_spec.services[0]['methods']
    // methodeIdList.forEach(async method => {
    //   methodId = method['num_id']
      const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload/encode`, {
        outUINT16: 5, outUINT32: 6
      });
      console.log(res.data);
    });

    // encode someip header
    it('test encode someip header by parameter', async () => {
      const server_ins_id = 'someip-server_1.0.0_1';
      const appPort = application_endpoint;
      const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/${appPort}/header/encode`, {
        messageId: {
          serviceId: 65280,
          methodId: 1
        },
        length: 8+6,//(8+buffer's length)
        messageType: 0, // REQUEST=0  REQUEST_NO_RETURN=1 NOTIFICATION=2
      });
      // console.log(res.data);
    });
    it('test encode someip header by header object', async () => {
      const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/header/encode`, {
        messageId: {
          serviceId: 65280,
          methodId: 1
        },
        length: 8+6,//(8+buffer's length)
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
    // encode someip pdu
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
          length: 8+6,//(8+buffer's length)
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
          outUINT16: 5, outUINT32: 6}
        })
        console.log(res.data);
    });
      
})

//-----------------modul of decode-----------------
describe('simulation.test.js', () => {
//decode someip payload
it('test decode someip payload', async () => {
  const server_ins_id = 'someip-server_1.0.0_1';
  const appPort = application_endpoint;
  const serviceId = '65280';
  const methodId = 1;
  const direction = 'return';
  const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload/decode`, {
    type: 'Buffer',
    data: [0, 5, 0, 0, 0, 6 ]
  });
  console.log(res.data);
});

//decode someip pdu
it('test decode someip pdu', async () => {
  const server_ins_id = 'someip-server_1.0.0_1';
  const appPort = application_endpoint;
  const direction = 'return';
  const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/${appPort}/${direction}/pdu/decode`, {
    type: 'Buffer',
    data: [      255, 0, 0, 1, 0, 0, 0,
      14, 0, 1, 0, 1, 1, 1,
       0, 0, 0, 5, 0, 0, 0,
       6]
  });
  console.log(res.data);
});
})
//-----------------modul of send-------------------
  //send pdu buffer
describe('simulation.test.js', () => {
    it('test send someip pdu buffer', async () => {
    const server_ins_id = 'someip-server_1.0.0_1';
    const appPort = application_endpoint;
    const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/${appPort}/pdu/send`, {
      type: 'Buffer',
      data: [      255, 0, 0, 1, 0, 0, 0,
        14, 0, 1, 0, 1, 1, 1,
         0, 0, 0, 5, 0, 0, 0,
         6]
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
        length: 8+6,
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
        outUINT16: 5, outUINT32: 6
      }
    });
    console.log(res.data);
    });
})


