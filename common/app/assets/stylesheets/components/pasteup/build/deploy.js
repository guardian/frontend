#!/usr/bin/env node

/* 
    Deploy pasteup files to S3.
    This script depends on s3cmd configured with appropriate Amazon S3 access credentials. */

var fs       = require('fs'),
    child_pr = require('child_process'),
    program  = require('commander'),
    wrench   = require('wrench');

var tmp_dir   = 'deployable_artefact';

var dryrun = false;

// envBuckets for dev-play account. TODO: Move these to PROD aws account.
var envBuckets = {
    'prod': 'pasteup',
    'qa': 'pasteup-qa-play',
    'code': 'pasteup-code-play'
}

// TODO: Move to serving these from real PROD buckets, on aws and aws-dev accounts.
// var envBuckets = {
//     'prod': 'pasteup-prod',
//     'qa': 'pasteup-qa',
//     'code': 'pasteup-code'
// }

function doFullDeploy(bucket, callback) {

    // Sync files with far future epxires first.
    deploy(
        's3cmd sync --recursive --acl-public --guess-mime-type ' +
        '--add-header "Cache-Control: max-age=315360000" '
        + tmp_dir + '/js/lib/ s3://' + bucket + '/js/lib/',
        function() {
            var v = getVersionNumber();
            deploy(
                's3cmd sync --recursive --acl-public --guess-mime-type ' +
                '--add-header "Cache-Control: max-age=315360000" '
                + tmp_dir + '/' + v + '/ s3://' + bucket + '/' + v + '/',
                function() {

                    // Then sync everything with no expiry (but sensible cache control)
                    // Files pushed above will not be synced so will keep far-future expiry.
                    deploy(
                        's3cmd sync --recursive --acl-public --guess-mime-type ' +
                        '--add-header "Cache-Control: max-age=3600" '
                        + tmp_dir + '/ s3://' + bucket,
                        function() {
                            callback();
                        }
                    );
                }
            );
        }
    );
}

function deploy(command, callback) {
    if (dryrun) {
        command = command.replace('s3cmd sync', 's3cmd sync --dry-run');
    }
    console.log('\n' + command + '\n' + '-----------------------------');
    child_pr.exec(
        command,
        function(error, stdout, stderr) {
            if (error !== null) {
                if (stdout) {
                    throw new Error("Error: " + error);
                }
            }
            if (stdout !== null) {
                process.stdout.write(stdout);
            }
            if (stderr !== null) {
                process.stderr.write(stderr);
                if (stderr.indexOf('s3cmd') > -1) {
                    process.stderr.write('ERROR: Have you installed and configured s3cmd?\n');
                    process.stderr.write('http://s3tools.org/s3cmd\n\n');
                }
            }
            callback();
        }
    );
}

/*
Returns the most recent version number in /version
*/
function getVersionNumber() {
    var f = fs.readFileSync(__dirname  + '/../component.json', 'utf8');
    var data = JSON.parse(f.toString());
    return data['version'];
}

module.exports = {
    'doFullDeploy': doFullDeploy
}

if (!module.parent) {

    // TODO: s3cmd has a dry run flag, wrap it so we can test deploys.

    program
        .option('--dry', 'dry run the deploy');

    program
        .command('prod')
        .description('Deploy Pasteup to production.')
        .action(function() {
            dryrun = program.dry;
            program.confirm('Confirm deploy to PROD? ', function(ok) {
                console.log('Deploying to PROD');
                doFullDeploy(envBuckets['prod'], function() {
                    process.exit();
                });
            });

        });
    program
        .command('qa')
        .description('Deploy Pasteup to QA.')
        .action(function() {
            dryrun = program.dry;
            program.confirm('Confirm deploy to QA? ', function(ok) {
                if (ok) {
                    console.log('Deploying to QA');
                    doFullDeploy(envBuckets['qa'], function() {
                        process.exit();
                    });
                } else {
                    process.exit();
                }
            });
        });
    program
        .command('code')
        .description('Deploy Pasteup to CODE.')
        .action(function() {
            dryrun = program.dry;
            program.confirm('Confirm deploy to CODE? ', function(ok) {
                if (ok) {
                    console.log('Deploying to CODE');
                    doFullDeploy(envBuckets['code'], function() {
                        process.exit();
                    });
                } else {
                    process.exit();
                }
            });
        });

    program.parse(process.argv);

}