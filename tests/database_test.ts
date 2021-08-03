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
        axios.delete(`${standard_base_url}:${port}/general/arxml/eth`, {params: {file: 'test_eth.json'}})
            .then(res => {
                console.log(res.status);
            })
    });
    describe('DATABASE_GENERAL_ARXML_ETH_PATH', () => {
        it('should Confirm that the file does not exist', (done) => {
            axios.get(`${standard_base_url}:${port}/general/arxml/eth`)
                .then(res => {
                    expect(res.data.files).to.be.an('array').that.not.includes('test_eth.json');
                    done()
                }).catch(done);
        });
        it('should Upload test.json', (done) => {
            const fileStream = fs.createReadStream('./resources/test_eth.json');
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
});

