import chai, {expect} from 'chai';
import axios from "axios";
import dotenv from 'dotenv';
import {before} from "mocha";
import fs from "fs";
import path from "path";
import FormData from "form-data";
// var FormData = require('form-data');

chai.should();
dotenv.config();

const standard_base_url: string = process.env.TEST_HOST || '192.168.1.27';
const port: string = process.env.TEST_DATABASE_PORT || '9001';

describe('Database test', () => {
    before(() => {
        axios.delete(`${standard_base_url}:${port}/general/arxml/eth`, {params: {file: 'test_eth.arxml'}})
            .then(res => {
                console.log(res.status);
            })
    });
    describe('DATABASE_GENERAL_ARXML_ETH_PATH', () => {
        it('should Confirm that the file does not exist', (done) => {
            axios.get(`${standard_base_url}:${port}/general/arxml/eth`)
                .then(res => {
                    expect(res.data.files).to.be.an('array').that.not.includes('test_eth.arxml');
                    done()
                }).catch(done);
        });
        it('should Upload test_eth.arxml', (done) => {
            const fileStream = fs.createReadStream('./resources/test_eth.arxml');
            let formData = new FormData();
            formData.append('file', fileStream)
            // console.log(__dirname + '\\..\\public\\test_eth.json')
            // console.log(form_data)
            // var buffer = fs.readFileSync();
            // form_data.append("file", );
            const headers = formData.getHeaders();
            axios.post(`${standard_base_url}:${port}/general/arxml/eth`, formData, {headers})
                .then(res => {
                    // console.log(res);
                    done()
                }).catch(done)
        });
    });

    //someip_autosar
    before(() => {
        axios.delete(`${standard_base_url}:${port}/someip/service/autosar`, {params: {file: 'test_someip_autosar.arxml'}})
            .then(res => {
                console.log(res.status);
            })
        });
    describe('DATABASE_SOMEIP_SERVICE_AUTOSAR', () => {
        it('should Confirm that the file does not exist', (done) => {
            axios.get(`${standard_base_url}:${port}/someip/service/autosar`)
                .then(res => {
                    expect(res.data.files).to.be.an('array').that.not.includes('test_someip_autosar.arxml');
                    done()
                }).catch(done);
        })
        it('should Upload test_someip_autosar.arxml', (done) => {
            const fileStream = fs.createReadStream('./resources/test_someip_autosar.arxml');
            let formData = new FormData();
            formData.append('file', fileStream)
            const headers = formData.getHeaders();
            axios.post(`${standard_base_url}:${port}/someip/service/autosar`, formData, {headers})
                .then(res => {
                    // console.log(res);
                    done()
                }).catch(done)
        })
     });

    // someip fibex
    before(() => {
        axios.delete(`${standard_base_url}:${port}/someip/service/fibex`, {params: {file: 'test_someip_fibex.arxml'}})
            .then(res => {
                console.log(res.status);
            })
        });
    describe('DATABASE_SOMEIP_SERVICE_Fibex', () => {
        it('should Confirm that the file does not exist', (done) => {
             axios.get(`${standard_base_url}:${port}/someip/service/fibex`)
                .then(res => {
                    expect(res.data.files).to.be.an('array').that.not.includes('test_someip_fibex.arxml');
                    done()
                }).catch(done);
        })
        it('should Upload test_someip_fibex.arxml', (done) => {
            const fileStream = fs.createReadStream('./resources/test_someip_fibex.arxml');
            let formData = new FormData();
            formData.append('file', fileStream)
            const headers = formData.getHeaders();
            axios.post(`${standard_base_url}:${port}/someip/service/autosar`, formData, {headers})
                .then(res => {
                    // console.log(res);
                    done()
                }).catch(done)
        })
    });    
})
