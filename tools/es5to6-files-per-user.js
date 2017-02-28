const path = require('path');
const glob = require('glob');
const { writeFileSync } = require('fs');

const es5Dir = path.resolve(
    __dirname,
    '..',
    'static',
    'src',
    'javascripts-legacy'
);

const files = glob.sync('**/*.js', {
    cwd: es5Dir,
});

const filesPerHuman = (filesToCheck, humans) =>
    Math.max(filesToCheck.length / humans.length);

const commercial = [
    'francis.carr@guardian.co.uk',
    'jon.norman@guardian.co.uk',
    'regis.kuckaertz@guardian.co.uk',
    'rich.nguyen@guardian.co.uk',
    'kate.whalen@guardian.co.uk',
    'calum.campbell@guardian.co.uk',
    'scott.painter@guardian.co.uk',
];
const commercialModules = files.filter(_ => _.includes('commercial'));
const commercialFilesPerHuman = filesPerHuman(commercialModules, commercial);

const platform = [
    'alex.sanders@guardian.co.uk',
    'gareth.trufitt@guardian.co.uk',
    'simon.adcock@guardian.co.uk',
    'natalia.baltazar@guardian.co.uk',
    'george.haberis@guardian.co.uk',
    'stephan.fowler@guardian.co.uk',
];
const platformModules = files.filter(_ => _.includes('projects/common/utils'));
const platformFilesPerHuman = filesPerHuman(platformModules, platform);

const misc = [
    'sam.desborough@guardian.co.uk',
    'akash.askoolum@guardian.co.uk',
    'dominic.kendrick@guardian.co.uk',
    'david.furey@guardian.co.uk',
    'jonathan.rankin@guardian.co.uk',
    'shaun.dillon@guardian.co.uk',
    'jonathan.soul@guardian.co.uk',
    'gustav.pursche@guardian.co.uk',
];
const miscModules = files.filter(
    _ => !_.includes('commercial') && !_.includes('projects/common/utils')
);

const totalFilesEach = filesPerHuman(files, [
    ...commercial,
    ...platform,
    ...misc,
]);

const list = Object.assign(
    commercial.reduce(
        (l, human) => Object.assign(l, {
            [human]: [
                ...commercialModules.splice(0, commercialFilesPerHuman),
                ...miscModules.splice(
                    0,
                    totalFilesEach - commercialFilesPerHuman
                ),
            ],
        }),
        {}
    ),
    platform.reduce(
        (l, human) => Object.assign(l, {
            [human]: [
                ...platformModules.splice(0, platformFilesPerHuman),
                ...miscModules.splice(
                    0,
                    totalFilesEach - platformFilesPerHuman
                ),
            ],
        }),
        {}
    ),
    misc.reduce(
        (l, human) => Object.assign(l, {
            [human]: miscModules.splice(0, totalFilesEach),
        }),
        {}
    )
);
writeFileSync('./tools/es5to6.json', JSON.stringify(list, null, 2));
