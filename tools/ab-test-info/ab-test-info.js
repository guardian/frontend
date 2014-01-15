// ab-test-info is a node app that parses javascript ab-tests and
// extracts test object data to a JSON output file.

// Modules
var esprima = require("esprima"),
    glob = require("glob"),
    fs = require("fs");
    mkdirp = require("mkdirp");
    path = require("path");

var srcPath = process.argv[2],
    outputFile = process.argv[3],
    abtest = {};

// This traverse() is based on the esprima example 'detectnestedternary'.
function traverse(object, visitor) {

    visitor.call(null, object);

    Object.keys(object).forEach(function(key) {
        var child = object[key];
        if (typeof child === 'object' && child !== null) {
            traverse(child, visitor)
        }
    });
}

// Look for AssignmentExpressions where the left is a this,
// and the right property is one of the predefined abTest properties.
function examineExpressions(node) {

    if (node.type === 'AssignmentExpression' &&
        node.left.type === 'MemberExpression' &&
        node.left.object.type === 'ThisExpression') {

        var property = node.left.property.name,
            value = node.right.value;

        switch( property ) {
            case 'audience':
            case 'audienceOffset':
            case 'expiry':
            case 'id':
                abtest[property] = value;
                break;
        }

        if (property === 'variants') {
            var variants = [];
            node.right.elements.forEach(function(element){
                element.properties.some(function(property) {
                    if (property.key.name === 'id') {
                        variants.push(property.value.value);
                    } else {
                        return false;
                    }
                })
            })
            abtest['variants'] = variants;
        }
    }
}

if (!srcPath || !outputFile) {
    console.error("Invalid paths specified for js static analysis.");
    return;
} else {
    console.log("Searching for ab-test objects...");
}

var sourceFiles = glob.sync(srcPath + "/*.js");
var testObjects = [];

sourceFiles.forEach(function(file) {

    try {
        var tree = esprima.parse(fs.readFileSync(file));
        abtest = {};
        traverse(tree, examineExpressions);
        testObjects.push(abtest);
    } catch (error) {
        console.error( "Error parsing file: " + file);
        console.error( "Exception: " + error);
    }
});

var outputDir = path.dirname(outputFile);

mkdirp(outputDir, function (error) {
    if (error) {
        console.error( "Error creating directories: " + outputDir);
        console.error( "Error: " + error);
    }
});

fs.writeFile(outputFile, JSON.stringify(testObjects), function (error) {
    if (error) {
        console.error( "Error writing output file: " + outputFile);
        console.error( "Error: " + error);
    }
});
