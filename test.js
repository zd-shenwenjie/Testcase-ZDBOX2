const chai = require('chai');
const axios = require('axios')
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const expect = chai.expect;
const toolkit = require('./toolkit/traceToolkit-v2')

const subscriber_base_url = '192.168.1.135';
const publisher_base_url = '192.168.1.125';
const standard_simulation_port = '8010';
const instance = 'abc12';
const msgId = '960';

const datas = [{
    "name": "RSt_Fahrerhinweise",
    "txt": "Init"
}]


axios.put(`http://${publisher_base_url}:${standard_simulation_port}/modules/${instance}/data/${msgId}/signal`, datas).then(res => {
    console.log(res.data)
}).catch(err => {
    console.log(err);
});