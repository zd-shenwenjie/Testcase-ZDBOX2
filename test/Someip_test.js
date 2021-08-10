const path = require('path');
const fs = require('fs-extra');
const assert = require('assert');
const axios = require('axios');

const SERVER_SOMEIP_URL = 'http://192.168.1.125:5001';
const CLIENT_SOMEIP_URL = 'http://192.168.1.125:5001';
const server_config = fs.readJSONSync(path.join(__dirname, 'server.json'));
const server_port = "30500"
const serviceId = '65280';

let current_hook_id = '';

before('simulation.test.js', () => {
  //create server instance
  // it('test create someip simulation server instance', async () => {
  //   const res = await axios.post(`${SERVER_SOMEIP_URL}/instance`, server_config);
  //   //console.log(res.data);
  // });
  // //start server instance
  // it('test start someip simulation server instance', async () => {
  //   const server_ins_id = 'someip-server_1.0.0_1';
  //   const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/start`);
  //   //console.log(res.data);
  // });
  // //create client instance
  // it('test create someip simulation client instance', async () => {
  //   const server_config = fs.readJSONSync(path.join(__dirname, 'client.json'));
  //   const res = await axios.post(`${CLIENT_SOMEIP_URL}/instance`, client_spec);
  //   console.log(res.data);
  // });
  // //start client instance
  // it('test start someip simulation client instance', async () => {
  //   const server_ins_id = 'someip-client_1.0.0_2';
  //   const res = await axios.post(`${CLIENT_SOMEIP_URL}/instance/${server_ins_id}/start`);
  //     console.log(res.data);
  // });
})


// read event and get each payload sever
describe('simulation.test.js', () => {

  it('test get someip service payload', async () => {
    // const service_spec = fs.readJSONSync(path.join(__dirname, '0xFF00_TestabilityService_V2.0.0F_CBox.json'))
    const server_ins_id = 'someip-server_1.0.0_1';
    const appPort = server_port;
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
  // set payload
  it('test set someip service payload', async () => {
    const service_spec = fs.readJSONSync(path.join(__dirname, '0xFF00_TestabilityService_V2.0.0F_CBox.json'))
    const server_ins_id = 'someip-server_1.0.0_1';
    const appPort = server_port;
    const methodId = 1;
    const serviceId = 65280;
    const direction = 'return'; // 'input' | 'return'
      const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload`, { outUINT16: 5, outUINT32: 6  });
      console.log(res.data);
    });
    it('test get someip service payload', async () => {
      // const service_spec = fs.readJSONSync(path.join(__dirname, '0xFF00_TestabilityService_V2.0.0F_CBox.json'))
      const server_ins_id = 'someip-server_1.0.0_1';
      const appPort = server_port;
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

  // // encode someip payload
  // it('test encode someip payload', async () => {
  //   const service_spec = fs.readJSONSync(path.join(__dirname, '0xFF00_TestabilityService_V2.0.0F_CBox.json'))
  //   const server_ins_id = 'someip-server_1.0.0_1';
  //   const appPort = server_port;
  //   let methodId;
  //   const direction = 'return';
  //   let methodeIdList = service_spec.services[0]['methods']
  //   methodeIdList.forEach(async method => {
  //     methodId = method['num_id']
  //     const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload/encode`, {
  //       version: '5.2.0'
  //     });
  //     console.log(res.data);
  //   });
  //   // encode someip header
  //   it('test encode someip header by parameter', async () => {
  //     const server_ins_id = 'someip-server_1.0.0_1';
  //     const appPort = server_port;
  //     const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/${appPort}/header/encode`, {
  //       messageId: {
  //         serviceId: 65280,
  //         methodId: 1
  //       },
  //       length: 9,
  //       messageType: 0, // REQUEST=0  REQUEST_NO_RETURN=1 NOTIFICATION=2
  //     });
  //     // console.log(res.data);
  //   })
  //   it('test encode someip header by header object', async () => {
  //     const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/header/encode`, {
  //       messageId: {
  //         serviceId: 65280,
  //         methodId: 1
  //       },
  //       length: 9,
  //       requestId: {
  //         clientId: 1,
  //         sessionId: 1
  //       },
  //       protocolVersion: 1,
  //       interfaceVersion: 1,
  //       messageType: 0, // REQUEST=0  REQUEST_NO_RETURN=1 NOTIFICATION=2
  //       returnCode: 0 // OK = 0x00
  //     });
  //     // console.log(res.data);
  //   })

  //   // encode someip pdu
  //   it('test encode someip pdu', async () => {
  //     const server_ins_id = 'someip-server_1.0.0_1';
  //     const appPort = server_port;
  //     const direction = 'return';
  //     const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/${appPort}/${direction}/pdu/encode`, {
  //       header: {
  //         messageId: {
  //           serviceId: 65280,
  //           methodId: 1
  //         },
  //         length: 9,
  //         requestId: {
  //           clientId: 1,
  //           sessionId: 1
  //         },
  //         protocolVersion: 1,
  //         interfaceVersion: 1,
  //         messageType: 0, // REQUEST=0  REQUEST_NO_RETURN=1 NOTIFICATION=2
  //         returnCode: 0 // OK = 0x00
  //       },
  //       payload: {
  //         version: '5.2.0'
  //       }
  //     });
  //     console.log(res.data);
  //   });
  // })
  // //send pdu buffer
  // it('test send someip pdu buffer', async () => {
  //   const server_ins_id = 'someip-server_1.0.0_1';
  //   const appPort = server_port;
  //   const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/${appPort}/pdu/send`, {
  //     type: 'Buffer',
  //     data: [1, 44, 0, 1, 0, 0, 0, 9, 0, 1, 0, 1, 1, 1, 0, 0, 0, 5, 53, 46, 50, 46, 48]
  //   });
  //   console.log(res.data);
  // });
  // //send pdu buffer by pdu obj
  // it('test send someip pdu buffer by pdu obj', async () => {
  //   const server_ins_id = 'someip-server_1.0.0_1';
  //   const appPort = server_port;
  //   const direction = 'return';
  //   const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/${appPort}/${direction}/pdu/send`, {
  //     header: {
  //       messageId: {
  //         serviceId: 65280,
  //         methodId: 1
  //       },
  //       length: 9,
  //       requestId: {
  //         clientId: 1,
  //         sessionId: 1
  //       },
  //       protocolVersion: 1,
  //       interfaceVersion: 1,
  //       messageType: 0, // REQUEST=0  REQUEST_NO_RETURN=1 NOTIFICATION=2
  //       returnCode: 0 // OK = 0x00
  //     },
  //     payload: {
  //       version: '5.2.0'
  //     }
  //   });
  //   console.log(res.data);
  // });

})

// after('simulation.test.js', () => {
//     //stop serve instance
//     it('test stop all someip simulation instance', async () => {
//       const server_ins_id = 'someip-server_1.0.0_1';
//       const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/stop`);
//       console.log(res.data);
//     });

//    //delete all server instances
//     it('test delete all someip simulation instances', async () => {
//       const res = await axios.delete(`${SERVER_SOMEIP_URL}/instance`);
//       console.log(res.data);
//     });
//   it('test stop all someip simulation instance', async () => {
//     const server_ins_id = 'someip-client_1.0.0_2';
//     const res = await axios.post(`${CLIENT_SOMEIP_URL}/instance/${server_ins_id}/stop`);
//     console.log(res.data);
//   });

//   // delete all client instances
//   it('test delete all someip simulation instances', async () => {
//     const res = await axios.delete(`${CLIENT_SOMEIP_URL}/instance`);
//     console.log(res.data);
//   });
// })
