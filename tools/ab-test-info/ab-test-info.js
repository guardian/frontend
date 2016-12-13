#!/usr/bin/env node

/* eslint-disable no-console */

// ab-test-info is a node app that parses javascript ab-tests and
// extracts test object data to a JSON output file.

// Modules
const esprima = require('esprima');
const glob = require('glob');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');

const srcPath = 'static/src/javascripts/projects/common/modules/experiments/tests';
const outputFile = 'static/abtests.json';
let abtest = {};

// This traverse() is based on the esprima example 'detectnestedternary'.
function traverse(object, visitor) {
    visitor.call(null, object);

    Object.keys(object).forEach((key) => {
        const child = object[key];
        if (typeof child === 'object' && child !== null) {
            traverse(child, visitor);
        }
    });
}

// Look for AssignmentExpressions where the left is a this,
// and the right property is one of the predefined abTest properties.
function examineExpressions(node) {
    if (node.type === 'AssignmentExpression' &&
        node.left.type === 'MemberExpression' &&
        node.left.object.type === 'ThisExpression') {
        const property = node.left.property.name;
        const value = node.right.value;

        /* eslint-disable default-case */
        switch (property) {
            case 'id':
            case 'start':
            case 'expiry':
            case 'author':
            case 'description':
            case 'audience':
            case 'audienceOffset':
            case 'successMeasure':
            case 'audienceCriteria':
            case 'dataLinkNames':
            case 'idealOutcome':
                abtest[property] = value;
                break;
        }

        if (property === 'variants') {
            const variants = [];
            node.right.elements.forEach((element) => {
                element.properties.some((elementProperty) => {
                    if (elementProperty.key.name === 'id') {
                        return variants.push(elementProperty.value.value);
                    }
                    return false;
                });
            });
            abtest.variants = variants;
        }
    }
}

if (!srcPath || !outputFile) {
    console.error('Invalid paths specified for js static analysis.');
    process.exit();
} else {
    console.log('Searching for ab-test objects...');
}

const sourceFiles = glob.sync(`${srcPath}/*.js`);
const testObjects = [];

sourceFiles.forEach((file) => {
    try {
        const tree = esprima.parse(fs.readFileSync(file));
        abtest = {};
        traverse(tree, examineExpressions);
        testObjects.push(abtest);
    } catch (error) {
        console.error(`Error parsing file: ${file}`);
        console.error(`Exception: ${error}`);
    }
});

const outputDir = path.dirname(outputFile);

mkdirp(outputDir, (error) => {
    if (error) {
        console.error(`Error creating directories: ${outputDir}`);
        console.error(`Error: ${error}`);
    }
});

fs.writeFile(outputFile, JSON.stringify(testObjects), (error) => {
    if (error) {
        console.error(`Error writing output file: ${outputFile}`);
        console.error(`Error: ${error}`);
    }
});
