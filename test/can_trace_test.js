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

let session = null;

before('create can-standard-simulation and can-websocket', () => {
    it('should create can-simulation-instance', (done) => {
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
            console.log(response.data);
        })
        const getPromise = axios.get(`http://${publisher_base_url}:${standard_simulation_port}`)
            .then(res => {
                console.log('----------------')
                // console.log(res.data);
            });

        Promise.allSettled([deletePromise, postPromise, getPromise])
            .then((results) => {
                // console.log(results);
                done();
            })
    });

    it('should start instance', function () {
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
                console.log('*************************')
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

    it('should create can-websocket', async () => {
        const resGetConverter = await toolkit.getConverter();

        // console.log(resGetConverter)

        session = await toolkit.startSession();
        // console.log(session)

        const tracingChannel = await session.getTracingChannel();
        // console.log(tracingChannel)
        const addChannel = await session.addTracingChannel({
            bus: 'ipdu',
            portType: 'can',
        }, ['default-can']);
        //
        // await session.subscribePDU(() => {
        //     return true
        // }, (pdus) => {
        //     pdus.forEach(ele => {
        //         if (ele.parsed) {
        //             // console.dir(ele, {depth: null});
        //         }
        //     })
        // });
        // await new Promise((res) => {
        //     setTimeout(res, 2000)
        // });

        //
        // toolkit.stopSession(session);
        // done();
        // await toolkit.deleteConverter(converterKey);
    })
})

after('close all item',(done) => {
    toolkit.stopSession(session);
    axios.post(`http://${publisher_base_url}:${standard_simulation_port}/modules/${instance}/stop`)
        .then(res => {
            console.log(res.data);
            done();
        });
})


describe('CAN-Trace test', () => {

    describe('verify can-trace', () => {
        it('should verify id', async () => {
            await session.subscribePDU(() => {
                return true
            }, (pdus) => {
                pdus.forEach(ele => {
                    if (ele.parsed) {
                        // console.dir(ele, {depth: null});
                        console.log(ele.id);
                        expect(ele.id).to.be.equal(960);
                    }
                });
            });
            await new Promise((res) => {
                setTimeout(res, 5000)
            });
        });

        it('should test2', async () => {
            await session.subscribePDU(() => {
                return true
            }, (pdus) => {
                pdus.forEach(ele => {
                    if (ele.parsed) {
                        // console.dir(ele, {depth: null});
                        console.log(ele.id);

                        expect(ele.id).to.be.equal(960);
                    }
                });
            });
            await new Promise((res) => {
                setTimeout(res, 5000)
            });
        });

        it('should test3', function () {
            console.log('test3')
        });

        it('should test4', function () {
            console.log('test4')
        });
    })
})





