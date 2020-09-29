const https = require('https');
const os = require('os');
const fs = require('fs');

const defaultOptions = {
    hostname: 'cdn.ampproject.org',
    path: '/v0/validator.js',
};
const devOptions = {
    headers: {
        Cookie: 'AMP_CANARY=1;',
    },
};
const tempFilenames = {
    release: '/release.js',
    preRelease: '/pre-release.js',
};

const fetchValidator = devChannel => {
    const validatorRequest = (resolve, reject) => {
        const options = {
            
            ...defaultOptions,
            ...(devChannel ? devOptions : {})
        };
        const errorMessage = `Unable to retrieve ${
            options.path
        } with dev channel ${devChannel ? 'enabled' : 'disabled'}.`;

        const req = https.get(options, res => {
            if (res.statusCode !== 200) {
                res.resume(); // must consume data, see https://nodejs.org/api/http.html#http_class_http_clientrequest
                reject(
                    new Error(
                        `${errorMessage} Status code was ${res.statusCode}`
                    )
                );
            } else {
                resolve(res);
            }
        });
        req.on('error', error => {
            reject(new Error(`${errorMessage} ${error.message}`));
        });
        req.end();
    };

    const saveToFile = res => {
        const filename =
            os.tmpdir() +
            (devChannel ? tempFilenames.preRelease : tempFilenames.release);
        const writeStream = fs.createWriteStream(filename);

        return new Promise((resolve, reject) => {
            res.pipe(writeStream)
                .on('finish', () => resolve(writeStream.path))
                .on('error', error => {
                    reject(new Error(`Error saving to file: ${error.message}`));
                    writeStream.close();
                });
        });
    };
    return new Promise(validatorRequest).then(saveToFile);
};

const cleanUp = () => {
    // Just try and remove both files as the cost is low anyway
    // TODO: re-add tempFilenames.prerelease when/if google provide us with one
    [tempFilenames.release].forEach(filename => {
        fs.unlinkSync(os.tmpdir() + filename);
    });
};

exports.fetchRelease = fetchValidator.bind(this, false);
exports.fetchPreRelease = fetchValidator.bind(this, true);
exports.cleanUp = cleanUp;
