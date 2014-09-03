module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-gh-pages');

	grunt.initConfig({
		sass: {
			demo: {
				options: {
					style: 'expanded'
				},
				files: {
					'demo/demo.css': 'demo/demo.scss'
				}
			}
		},
		'gh-pages': {
			demo: {
				options: {
					base: 'demo',
					message: 'Auto-updating demo'
				},
				src: ['*.{html,css}']
			}
		}
	});

	grunt.registerTask('docs', ['sass:demo', 'gh-pages:demo']);
};