'use strict';

console.log('Running...');

const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline')

const portName = '/dev/ttyACM0';
const port = new SerialPort(portName, (err) => {
    if (err) {
        return console.log('Error: ', err.message);
    }
});

const deviceModule = require('aws-iot-device-sdk').device;

const parser = port.pipe(new Readline({ delimiter: '\r\n' }));
const rePattern = new RegExp(/C: (.+)F:(.+)/);

parser.on('data', (data) => {
    const arrMatches = data.match(rePattern);

    if (arrMatches && arrMatches.length >= 1) {
        const readingInC = arrMatches[1].trim();
        console.log(readingInC);

        sendDataToTheNube(readingInC);
    }
});

const defaults = {
    protocol: 'mqtts',
    privateKey: './iot/f5b0580f5c-private.pem.key',
    clientCert: './iot/f5b0580f5c-certificate.pem.crt',
    caCert: './iot/root-CA.crt',
    testMode: 1,
    /* milliseconds */
    baseReconnectTimeMs: 4000,
    /* seconds */
    keepAlive: 300,
    /* milliseconds */
    delay: 4000,
    thingName: 'cuttlefish-hub-01',
    clientId: 'nouser' + (Math.floor((Math.random() * 100000) + 1)),
    Debug: false,
    Host: 'a7773lj8lvoid9a.iot.ap-southeast-2.amazonaws.com',
    region: 'ap-southeast-2'
};

function sendDataToTheNube(readingInC) {
    const device = deviceModule({
        keyPath: defaults.privateKey,
        certPath: defaults.clientCert,
        caPath: defaults.caCert,
        clientId: defaults.clientId,
        region: defaults.region,
        baseReconnectTimeMs: defaults.baseReconnectTimeMs,
        keepalive: defaults.keepAlive,
        protocol: defaults.Protocol,
        port: defaults.Port,
        host: defaults.Host,
        debug: defaults.Debug
    });

    device.publish(`temperature/${defaults.thingName}`, JSON.stringify({
        temperature: readingInC
    }));
}