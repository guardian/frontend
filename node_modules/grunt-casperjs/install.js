'use strict'

var cp = require('child_process')
var fs = require('fs')
var http = require('http')
var https = require('https')
var path = require('path')
var url = require('url')
var rimraf = require('rimraf').sync
var AdmZip = require('adm-zip')

fs.existsSync = fs.existsSync || path.existsSync

var libPath = path.join(__dirname, 'lib', 'casperjs')
var tmpPath = path.join(__dirname, 'tmp')
var version = 'master'
var downloadUrl = 'https://github.com/n1k0/casperjs/archive/' + version + '.zip'



function isCasperInstalled(notInstalledCallback) {
    // Note that "which" doesn't work on windows.
    cp.exec("casperjs --version", function(error, stdout, stderr) {
        if ( error ) {
            console.log("Casperjs not installed.  Installing.");
            notInstalledCallback();
        } else {
            var casperVersion = stdout.replace(/^\s+|\s+$/g,'');
            cp.exec("casperjs '" + path.join(__dirname, "tasks", "lib", "casperjs-path.js") + "'", function(error, stdout, stderr) {
                var casperPath = stdout.replace(/^\s+|\s+$/g,'');
                console.log("Casperjs version " + casperVersion + " installed at " + casperPath);
                var casperExecutable = path.join(casperPath, "bin", "casperjs");
                fs.symlinkSync(casperExecutable, './casperjs');
            });
        }
    });
}

function tidyUp() {
    rimraf(tmpPath);
}

function unzipTheZippedFile() {
    var zip = new AdmZip(path.join(tmpPath, 'archive.zip'));
    zip.extractAllTo(libPath, true);

    if (process.platform != 'win32') {
        var pathToCommand = path.join(libPath, 'casperjs-' + version, 'bin', 'casperjs');
        fs.symlinkSync(pathToCommand, './casperjs');
        var stat = fs.statSync(pathToCommand);
        if (!(stat.mode & 64)) {
            fs.chmodSync(pathToCommand, '755')
        }
    }
    tidyUp();
}

function downloadZipFromGithub() {
    var file = fs.createWriteStream(path.join(tmpPath, "archive.zip"));
    var lengthSoFar = 0;
    var request = https.get(downloadUrl, function(response) {
        if (response.statusCode === 301 || response.statusCode === 302) {
            downloadUrl = response.headers.location;
            downloadZipFromGithub();
        } else {
            response.pipe(file);
            response.on('data', function(chunk) {
                console.log('Receiving ' + Math.floor((lengthSoFar += chunk.length) / 1024) + 'K...' );
            }).
                on('end', unzipTheZippedFile).
                on('error', function(e) {
                    console.log('An error occured whilst trying to download Casper.JS ' + e.message);
                    tidyUp();
                });
        }
    });
    request.on('error', function(e) {
        console.log('An error occured whilst trying to download Casper.JS ' + e.message);
        tidyUp();
    });
}

isCasperInstalled(function() {
    if (!fs.existsSync(tmpPath)) {
        fs.mkdirSync(tmpPath);
    }
    rimraf(libPath);

    downloadZipFromGithub();
});
