var grunt = require('grunt');
var config = grunt.config.get('custom');

module.exports = {
    javascript: {
        files: ['<%= jshint.files %>'],
        tasks: ['jshint', 'fileblocks']
    },
    css: {
        files: ['<%= compass.options.sassDir %>/**/*.scss'],
        tasks: ['compass:server', 'fileblocks']
    },
    bower: {
        files: ['bower.json'],
        tasks: ['bowerInstall']
    },
    livereload: {
        options: {
            livereload: '<%= connect.options.livereload %>'
        },
        files: [
            config.srcPath + '/**/*.html',
            '<%= copy.html.src %>',
            '<%= jshint.files %>',
            '<%= compass.options.sassDir %>/**/*.scss'
        ]
    }
};