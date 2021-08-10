import chai, {expect} from 'chai';
import axios from "axios";
import dotenv from 'dotenv';
import redis from 'redis';
import {before} from "mocha";
import fs from "fs";
import path from "path";
import FormData from "form-data";
// var FormData = require('form-data');

chai.should();
dotenv.config();

const subscriber_base_url: string = '192.168.1.125';
const publisher_base_url: string = '192.168.1.135';
const port: string = '8001';

let subscriber: redis.RedisClient;
let publisher: redis.RedisClient;

const body = {
  vlan: "4",
  srcIP: "fd53:7cb8:0383:0004:0000:0000:0001:01b5",
  dstIP: "ff14:0000:0000:0000:0000:0000:0000:0008",
  srcPort: "42556",
  dstPort: "42557",
  pdus: [
    {
      id: 7,
      len: 8,
      parsed: {
        signals: [
          {
            raw: "12500"
          },
          {
            phys: "0"
          },
          {
            txt: "Init"
          },
          {
            raw: "12500"
          },
          {
            phys: "14"
          }
        ]
      }
    }
  ]
}

const portID: String = '104';

beforeEach(() => {
  subscriber = redis.createClient({
    host: `${subscriber_base_url}`,
    port: 6379,
  });
  publisher = redis.createClient({
    host: `${publisher_base_url}`,
    port: 6379,
  });

  publisher.on('subscribe', (channel, count) => {
    console.log('publisher-client is ok');
  });
  publisher.on("message", function (channel, message) {
    console.log("我接收到信息了" + message);
  });
})

afterEach(() => {
  subscriber.quit();
  publisher.quit();
})

describe('Simulation test', () => {
  describe('Ipdu eth test', () => {
    it('should send eth_raw_trace', (done) => {


      axios.post(`http://${publisher_base_url}:${port}/ipdu/eth/${portID}`, body);
      done()
    });
    it('should receive eth_raw_trace', (done) => {
      publisher.psubscribe("ipdu.eth.*");
      subscriber.psubscribe("ipdu.eth.*");
      console.log('----------------')
      publisher.once("pmessage", (pchannel, channel, pdu) => {
        // console.log(Buffer.from(pduString));
        // pchannel.should.equal('ipdu.eth.*')
        // channel.should.include('ipdu.eth')
        console.log(Buffer.from(pdu).toString('hex'));
        // done();
      });
      subscriber.once("pmessage", (pchannel, channel, pdu) => {
        // console.log(Buffer.from(pduString));
        // pchannel.should.equal('ipdu.eth.*')
        // channel.should.include('ipdu.eth')
        console.log(Buffer.from(pdu).toString('hex'));
        done();
      });
      setTimeout(() => {
        axios.post(`http://${publisher_base_url}:${port}/ipdu/eth/${portID}`, body);
      }, 200);
    });
  })
})


describe('Simulation test', () => {
  describe('Ipdu can test', () => {
    it('should send can_raw_trace', (done) => {
      const portID: String = 'can1';
      const body = {
        id: "0x3C0",
        payload: "00 FF 01 02 03 04 05 06",
        isExtended: false,
        isCANFD: false
      }
      axios.post(`http://${publisher_base_url}:${port}/ipdu/can/${portID}`, body)
    });
    // it('should receive can_raw_trace', (done) => {
    //
    // });
  })
})



