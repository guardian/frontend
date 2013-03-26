// Load the require modules
var dust = require('../node_modules/dustjs-linkedin'),
    fs = require('fs');

// Load the rendered template
fs.readFile('docs/api.dust.js', function(err, data) {
    // Throw any errors
    if(err) {
        throw err;
    }

    // Load the rendered template into dust
    dust.loadSource(data);

    // Load the data
    fs.readFile('docs/data.json', function(err, rawJSON) {
        // Throw any errors
        if(err) {
            throw err;
        }

        // Parse the JSON
        var raw = JSON.parse(rawJSON);

        // Build the data array
        var data = [];

        // Loop over all JSDoc block
        for(var i = 0; i < raw.length; i += 1) {
            // Loop over any tags found in the block
            if(raw[i].tags) {
                for(var t = 0; t < raw[i].tags.length; t += 1) {
                    // If it is a doc tag then add method to the data array
                    if(raw[i].tags[t].type === 'doc') {
                        // Add the method to the data object
                        data.push(raw[i]);

                        // And remove the doc tag
                        raw[i].tags.splice(t, 1);
                    }
                }
            }
        }

        // Pipe the data into the template
        dust.render('api', data, function(err, out) {
            // Throw any errors
            if(err) {
                throw err;
            }

            // Write the data to the output
            fs.writeFile('docs/api.md', out);
        });
    });
});