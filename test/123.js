// const path = require('path');
// const fs = require('fs-extra');
// const assert = require('assert');
// const axios = require('axios');

// const BASE_URL = 'http://192.168.1.125:5001';
// let current_hook_id = '';

// describe('simulation.test.js', () => {
//   it('test create someip simulation instance', async () => {
//     const body = fs.readJSONSync(path.join(__dirname, 'server.json'));
//     const res = await axios.post(`${BASE_URL}/instance`, body);
//     console.log(res.data);
//   });
// //   it('test get all someip simulation instances', async () => {
// //     const res = await axios.get(`${BASE_URL}/instance`);
// //     console.log(JSON.stringify(res.data));
// //   });
//   it('test start all someip simulation instance', async () => {
//     const server_ins_id = 'someip-server_1.0.0_1';
//     const res = await axios.post(`${BASE_URL}/instance/${server_ins_id}/start`);
//     console.log(res.data);
//   });
// //   it('test start someip service discovery', async () => {
// //     const server_ins_id = 'someip-server_1.0.0_1';
// //     const res = await axios.post(`${BASE_URL}/instance/${server_ins_id}/discovery/start`);
// //     console.log(res.data);
// //   });
// //   it('test set someip service payload', async () => {
// //     const server_ins_id = 'someip-server_1.0.0_1';
// //     const appPort = '65280';
// //     const serviceId = '30500';
// //     const methodId = 1;
// //     const direction = 'return'; // 'input' | 'return'
// //     const res = await axios.post(`${BASE_URL}/instance/${server_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload`, { version: '2.5.0' });
// //     console.log(res.data);
// //   });
//   it('test get someip service payload', async () => {
//     const server_ins_id = 'someip-server_1.0.0_1';
//     const appPort = '65280';
//     const serviceId = '30500';
//     const methodId = 1;
//     const direction = 'return'; // 'input' | 'return'
//     const res = await axios.get(`${BASE_URL}/instance/${server_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload`);
//     console.log(res.data);
//   });
//   it('test add someip service rule', async () => {
//     const server_ins_id = 'someip-server_1.0.0_1';
//     const appPort = '29180';
//     const type = 'afterDecode'; // 'beforeDecode' | 'afterDecode' | 'beforeEncode' | 'afterEncode'
//     const condition = (sourceChannel, message, service) => {
//       const { header } = message;
//       const methodId = header.messageId.methodId;
//       console.log('hello condition func => methodId:', header.messageId);
//       return methodId % 2 === 0;
//     };
//     const todo = (sourceChannel, message, service) => {
//       console.log('hello rule function !!!');
//     };
//     const res = await axios.post(`${BASE_URL}/instance/${server_ins_id}/${appPort}/rule`, {
//       type,
//       condition: condition.toString(),
//       todo: todo.toString()
//     });
//     console.log(res.data);
//     if (res.data.code === 200) {
//       current_hook_id = res.data.data;
//       console.log('current_hook_id=', current_hook_id);
//     }
//   });
//   it('test get someip service rule', async () => {
//     const server_ins_id = 'someip-server_1.0.0_1';
//     const appPort = '29180';
//     const res = await axios.get(`${BASE_URL}/instance/${server_ins_id}/${appPort}/rule`);
//     console.log(res.data);
//   });
//   it('test delete someip service rule', async () => {
//     const server_ins_id = 'someip-server_1.0.0_1';
//     const appPort = '29180';
//     const type = 'afterDecode'; // 'beforeDecode' | 'afterDecode' | 'beforeEncode' | 'afterEncode'
//     const funcId = current_hook_id;
//     const res = await axios.delete(`${BASE_URL}/instance/${server_ins_id}/${appPort}/rule`, { data: { type, funcId } });
//     console.log(res.data);
//   });
//   it('test encode someip header by header object', async () => {
//     const res = await axios.post(`${BASE_URL}/instance/header/encode`, {
//       messageId: {
//         serviceId: 300,
//         methodId: 1
//       },
//       length: 8 + 1,
//       requestId: {
//         clientId: 1,
//         sessionId: 1
//       },
//       protocolVersion: 1,
//       interfaceVersion: 1,
//       messageType: 0, // REQUEST=0  REQUEST_NO_RETURN=1 NOTIFICATION=2
//       returnCode: 0 // OK = 0x00
//     });
//     console.log(res.data);
//   });
//   it('test encode someip header by parameter', async () => {
//     const server_ins_id = 'someip-server_1.0.0_1';
//     const appPort = '29180';
//     const res = await axios.post(`${BASE_URL}/instance/${server_ins_id}/${appPort}/header/encode`, {
//       messageId: {
//         serviceId: 300,
//         methodId: 1
//       },
//       length: 8 + 1,
//       messageType: 0, // REQUEST=0  REQUEST_NO_RETURN=1 NOTIFICATION=2
//     });
//     console.log(res.data);
//   });
//   it('test encode someip payload', async () => {
//     const server_ins_id = 'someip-server_1.0.0_1';
//     const appPort = '29180';
//     const serviceId = '300';
//     const methodId = 1;
//     const direction = 'return';
//     const res = await axios.post(`${BASE_URL}/instance/${server_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload/encode`, {
//       version: '5.2.0'
//     });
//     console.log(res.data);
//   });
//   it('test decode someip payload', async () => {
//     const server_ins_id = 'someip-server_1.0.0_1';
//     const appPort = '29180';
//     const serviceId = '300';
//     const methodId = 1;
//     const direction = 'return';
//     const res = await axios.post(`${BASE_URL}/instance/${server_ins_id}/${appPort}/${serviceId}/${methodId}/${direction}/payload/decode`, {
//       type: 'Buffer',
//       data: [0, 5, 53, 46, 50, 46, 48]
//     });
//     console.log(res.data);
//   });
//   it('test encode someip pdu', async () => {
//     const server_ins_id = 'someip-server_1.0.0_1';
//     const appPort = '29180';
//     const direction = 'return';
//     const res = await axios.post(`${BASE_URL}/instance/${server_ins_id}/${appPort}/${direction}/pdu/encode`, {
//       header: {
//         messageId: {
//           serviceId: 300,
//           methodId: 1
//         },
//         length: 8 + 1,
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
//   it('test decode someip pdu', async () => {
//     const server_ins_id = 'someip-server_1.0.0_1';
//     const appPort = '29180';
//     const direction = 'return';
//     const res = await axios.post(`${BASE_URL}/instance/${server_ins_id}/${appPort}/${direction}/pdu/decode`, {
//       type: 'Buffer',
//       data: [1, 44, 0, 1, 0, 0, 0, 9, 0, 1, 0, 1, 1, 1, 0, 0, 0, 5, 53, 46, 50, 46, 48]
//     });
//     console.log(res.data);
//   });
//   it('test send someip pdu buffer', async () => {
//     const server_ins_id = 'someip-server_1.0.0_1';
//     const appPort = '29180';
//     const res = await axios.post(`${BASE_URL}/instance/${server_ins_id}/${appPort}/pdu/send`, {
//       type: 'Buffer',
//       data: [1, 44, 0, 1, 0, 0, 0, 9, 0, 1, 0, 1, 1, 1, 0, 0, 0, 5, 53, 46, 50, 46, 48]
//     });
//     console.log(res.data);
//   });
//   it('test send someip pdu buffer by pdu obj', async () => {
//     const server_ins_id = 'someip-server_1.0.0_1';
//     const appPort = '29180';
//     const direction = 'return';
//     const res = await axios.post(`${BASE_URL}/instance/${server_ins_id}/${appPort}/${direction}/pdu/send`, {
//       header: {
//         messageId: {
//           serviceId: 300,
//           methodId: 1
//         },
//         length: 8 + 1,
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
//   it('test stop someip service discovery', async () => {
//     const server_ins_id = 'someip-server_1.0.0_1';
//     const res = await axios.post(`${BASE_URL}/instance/${server_ins_id}/discovery/stop`);
//     console.log(res.data);
//   });
//   it('test stop all someip simulation instance', async () => {
//     const server_ins_id = 'someip-server_1.0.0_1';
//     const res = await axios.post(`${BASE_URL}/instance/${server_ins_id}/stop`);
//     console.log(res.data);
//   });
//   it('test delete all someip simulation instances', async () => {
//     const res = await axios.delete(`${BASE_URL}/instance`);
//     console.log(res.data);
//   });
// })