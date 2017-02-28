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
    'janua',
    'JonNorman',
    'regiskuckaertz',
    'rich-nguyen',
    'katebee',
    'Calum-Campbell',
    'ScottPainterGNM',
];
const commercialModules = files.filter(_ => _.includes('commercial'));
const commercialFilesPerHuman = filesPerHuman(commercialModules, commercial);

const platform = [
    'sndrs',
    'gtrufitt',
    'SiAdcock',
    'NataliaLKB',
    'GHaberis',
    'stephanfowler',
];
const platformModules = files.filter(_ => _.includes('projects/common/utils'));
const platformFilesPerHuman = filesPerHuman(platformModules, platform);

const misc = [
    'desbo',
    'akash1810',
    'dominickendrick',
    'davidfurey',
    'jranks123',
    'ShaunYearStrong',
    'jfsoul',
    'gustavpursche',
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
