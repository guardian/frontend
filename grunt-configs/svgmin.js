module.exports = function () {
    return {
        inlineSVGs: {
            files: [{
                expand: true,
                cwd: 'common/conf/assets/inline-svgs',
                src: ['**/*.svg'],
                dest: 'common/conf/assets/inline-svgs'
            }]
        }
    };
};
