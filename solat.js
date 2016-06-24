#!/usr/bin/env node
'use strict';

const chalk = require('chalk')
    , program = require('commander')
    , exec = require('child_process').exec
    , pkg = require('./package.json')
    , zones = require('./zones.json');


let solat = (zone = 'SGR04')  => {

    var location = zones[zone], yellow = chalk.yellow;

    if (typeof location === 'undefined') {
        for(var key in zones){
            if (zones[key].zone.toLowerCase().indexOf(zone.toLowerCase()) > -1) {
                location = zones[key];
            }
        }
    }

    if (typeof location === 'undefined') {
       console.error(chalk.yellow.bgRed.bold('\n  Err: zone or location not found!\n'));
       process.exit(1);
    }

    let cmd = 'curl www2.e-solat.gov.my/xml/today/?zon=' + location.code;

    console.log([
        '',
        chalk.yellow('  Negeri: ') + location.state,
        chalk.yellow('  Kod: ') + location.code,
        chalk.yellow('  Zon: ') + location.zone,
        '',
    ].join('\n'));

    let output = (error, stdout, stderr) => {

        if (stdout) {
            var xml2js = require('xml2js');
            var parser = new xml2js.Parser();

            parser.parseString(stdout, function (err, result) {
                var jakim = result.rss.channel[0].item;

                var head = [], content = [];

                jakim.forEach(function(waktu) {
                    head.push(waktu.title[0]);
                    content.push(waktu.description[0]);
                });

                var Table = require('cli-table2');
                var table = new Table({ head: head });
                table.push(content);

                console.log(table.toString());

            });
        }
    };
    exec(cmd, output);
};

program
    .version(pkg.version)
    .usage('[zone]')
    .description('Waktu solat di terminal anda.')
    .action(solat)
    .parse(process.argv);

if (program.args.length === 0) solat();