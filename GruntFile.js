/*!
 * polling-station GruntFile
 * https://github.com/perks/polling-station
 * @author Chris Evans
 */

'use strict';

var LIVERELOAD_PORT = 35279;

/*
 * Grunt Module
 */
module.exports = function(grunt) {
    /*
     *Config
     */
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

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
            options: {
                livereload: LIVERELOAD_PORT
            },
            css: {
                files: './assets/scss/*.scss',
                tasks: ['compass']
            },
            js: {
                files: 'src/*.js',
                tasks: ['uglify']
            }
        },

        connect: {
            server: {
                options: {
                    livereload: LIVERELOAD_PORT,
                    port: 8080
                }
            }
        },

        open: {
            server: {
                path: 'http://localhost:<%= connect.options.port %>'
            }
        },

        uglify: {

            files: {
                src: 'src/*.js',
                dest: 'dist/',
                expand: true,
                flatten: true,
                ext: '.min.js'
            },

            options: {
                banner: '<%= tag.banner %>'
            }
        },

        mocha: {
            all: {
                src: ['tests/testrunner.html'],
            },
            options: {
                run: true
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

    grunt.registerTask('test', [
        'mocha'
    ]);

    grunt.registerTask('server', function(target) {

        grunt.task.run([
            'uglify',
            'connect',
            'watch'
        ]);
    });
};
