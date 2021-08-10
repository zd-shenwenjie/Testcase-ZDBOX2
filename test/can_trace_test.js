const chai = require('chai');
const axios = require('axios')
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const expect = chai.expect;
const toolkit = require('../toolkit/traceToolkit-v2')

////    "test": "mocha --require ts-node/register 'tests/**/*.ts'",

chai.should();
dotenv.config();

const subscriber_base_url = '192.168.1.135';
const publisher_base_url = '192.168.1.125';
const standard_simulation_port = '8010';
const instance = 'abc12';
const msgId = '960';

describe('Trace test', () => {
    before((done) => {
        // upload dbc via dababase management
        const deletePromise = axios.delete(`http://${publisher_base_url}:${standard_simulation_port}`, {data: {uuid: instance}})
            .then((res) => {
                // console.log(res)
            });
        const postPromise = axios.post(`http://${publisher_base_url}:${standard_simulation_port}`, {
            uuid: instance,
            type: "CAN-SIM",
            dst_phy_id: "can2",
            file_path: "/root/simulations/testproj/cansim.simod"
        }).then((response) => {
            // console.log(response.data);
        })
        const getPromise = axios.get(`http://${publisher_base_url}:${standard_simulation_port}`)
            .then(res => {
                // console.log('----------------')
                // console.log(res.data);
            });

        Promise.allSettled([deletePromise, postPromise, getPromise])
            .then((results) => {
                console.log(results);
                done();
            })
    });

    describe('trace start and input', () => {
        it('should start instance', (done) => {
            const getInstancePromise = axios.get(`http://${publisher_base_url}:${standard_simulation_port}/modules/${instance}/status`)
                .then(res => {
                    // console.log(res.data)
                });

            const postInstancePromise = axios.post(`http://${publisher_base_url}:${standard_simulation_port}/modules/${instance}/start`)
                .then(res => {
                    // console.log(res.data);
                });

            Promise.allSettled([getInstancePromise, postInstancePromise])
                .then((results) => {
                    console.log(results);
                    done()
                })
        });

        it('should activate msgId', (done) => {
            const getActivatePromise = axios.get(`http://${publisher_base_url}:${standard_simulation_port}/modules/${instance}/activate/${msgId}`)
                .then(res => {
                    console.log(res.data);
                });

            const postActivatePromise = axios.post(`http://${publisher_base_url}:${standard_simulation_port}/modules/${instance}/activate/${msgId}`)
                .then(res => {
                    console.log(res.data);
                });

            Promise.allSettled([getActivatePromise, postActivatePromise])
                .then((results) => {
                    console.log(results);
                    done();
                })
        });
    });

    describe('start can-ws and listen', () => {
        it('should ', async () => {
            const converterKey = await toolkit.createConverter('CAN', 'DBC-CAN', './dbc_templates.json');
            const resGetConverter = await toolkit.getConverter();
            const session = await toolkit.startSession();

            const tracingChannel = await session.getTracingChannel();

            const addChannel = await session.addTracingChannel({
                // todo
            }, [converterKey, 'default-can']);

            await session.subscribePDU(() => {
                return true
            }, (pdus) => {
                pdus.forEach(ele => {
                    if (ele.parsed) {
                        console.dir(ele, {depth: null});
                    }
                })
            });
            await new Promise((res) => {setTimeout(res, 20000)});

            toolkit.stopSession(session);
            await toolkit.deleteConverter(converterKey);
        });
    })

    // close can-ws adn delete instance
    after((done) => {
        const deletePromise = axios.delete(`http://${publisher_base_url}:${standard_simulation_port}`, {data: {uuid: instance}})
            .then((res) => {
                // console.log(res)
            });
    })
})


