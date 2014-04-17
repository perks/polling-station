/*!
 * polling-station GruntFile
 * https://github.com/perks/polling-station
 * @author Chris Evans
 */

'use strict';

/*
 * Grunt Module
 */
module.exports = function(grunt) {
    /*
     *Config
     */
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        project: {
            css: ['']
        },

        tag: {
            banner: '/*!\n' + ' * <%= pkg.name %>\n' + ' * <%= pkg.title %>\n' + ' * <%= pkg.url %>\n' + ' * @author <%= pkg.author %>\n' + ' * @version <%= pkg.version %>\n' + ' * Copyright <%= pkg.copyright %>. <%= pkg.license %> licensed.\n' + ' */\n'
        },

        compass: {
            dist: {
                options: {
                    sassDir: './assets/scss',
                    cssDir: './assets/css',
                    outputStyle: 'compressed',
                }
            }
        },

        watch: {
            css: {
              files: './assets/scss/*.scss',
              tasks: ['compass']
            }
        },

        uglify: {
            options: {
                banner: '<%= tag.banner %>'
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        }
    });

    /**
     * Load Grunt plugins
     */
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);


    grunt.registerTask('default', [
        'watch'
    ]);

    grunt.registerTask('build', [
        'uglify'
    ]);
};
