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


describe('create multi times of a service ', () => {
  // TODO: using database management to upload service spec
  it('database should be uploaded via database management')

  //create client instance
  it('create someip simulation client instance', async () => {
    const res = await axios.post(`${CLIENT_SOMEIP_URL}/instance`, client_config);
    console.log(res.data);
  });

  //create client instance 2rd time
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
  it('start 2rd time client', async () => {
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

  it('start 2rd time server', async () => {
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
  it('setup 2rd traceing service', async () => {
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