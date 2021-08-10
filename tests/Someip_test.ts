const path = require('path');
const fs = require('fs-extra');
const assert = require('assert');
const axios = require('axios');

const SERVER_SOMEIP_URL = 'http://192.168.1.125:5001';
const CLIENT_SOMEIP_URL = 'http://192.168.1.135:5001';
let current_hook_id = '';

describe('simulation.test.js', () => {
    //delete all instances
    it('test delete all someip simulation instances', async () => {
      const res = await axios.delete(`${SERVER_SOMEIP_URL}/instance`);
      console.log(res.data);
    });
    //create server instance
    it('test create someip simulation server instance', async () => {
      const body = fs.readJSONSync(path.join(__dirname, 'server.json'));
      const res = await axios.post(`${SERVER_SOMEIP_URL}/instance`, body);
      
      console.log(res.data);
    });
    //start server instance
    it('test start someip simulation server instance', async () => {
      const server_ins_id = 'someip-server_1.0.0_1';
      const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/start`);
      console.log(res.data);
    });
    //start someip service diescoverry
    // it('test start someip service discovery', async () => {
    //   const server_ins_id = 'someip-server_1.0.0_1';
    //   const res = await axios.post(`${SERVER_SOMEIP_URL}/instance/${server_ins_id}/discovery/start`);
    //   console.log(res.data);
    // });
    //delete all instances-------------------
    it('test delete all someip simulation instances', async () => {
      const res = await axios.delete(`${CLIENT_SOMEIP_URL}/instance`);
      console.log(res.data);
    });
    //create client instance
    it('test create someip simulation client instance', async () => {
      const body = fs.readJSONSync(path.join(__dirname, 'client.json'));
      const res = await axios.post(`${CLIENT_SOMEIP_URL}/instance`, body);
      console.log(res.data);
    });
     //start client instance
   it('test start someip simulation client instance', async () => {
    const client_ins_id = 'someip-client_1.0.0_1';
    const res = await axios.post(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/start`);
    console.log(res.data);
    });
    //start someip client diescoverry
    // it('test start someip CLIENT discovery', async () => {
    //   const server_ins_id = 'someip-client_1.0.0_1';
    //   const res = await axios.post(`${CLIENT_SOMEIP_URL}/instance/${client_ins_id}/discovery/start`);
    //   console.log(res.data);
    // });
});