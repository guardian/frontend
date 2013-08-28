var AWS = require('aws-sdk'),
    fs = require('fs'),
    moment = require('moment')(),
    s3 = new AWS.S3(),
    bucket = 'aws-frontend-store',
    // timestamp the key
    key = 'DEV/screenshots/' + moment.format('YYYY/MM/DD/HH:mm:ss/');

// read in screenshots
fs.readdir('./screenshots', function(err, files) {
    files.forEach(function(file) {
        fs.readFile('./screenshots/' + file, function(err, data) {
            var params = {Bucket: 'aws-frontend-store', Key: key + file, Body: data};
            s3.putObject(params, function(err, data) {
                if (err) {
                    console.log(err)                    
                } else {
                    console.log('Successfully uploaded: ' + file);
                }
            });
        });
    });
});