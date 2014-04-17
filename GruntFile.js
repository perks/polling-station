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

        sass: {
            dev: {
                options: {
                    style: 'expanded',
                    banner: '<%= tag.banner %>',
                    compass: true
                },
                files: {
                    './assets/css/yes-no.css': './assets/scss/yes-no.scss'
                }
            },
            dist: {
                options: {
                    style: 'compressed',
                    compass: true
                },
                files: {
                    './assets/css/yes-no.css': './assets/scss/yes-no.scss'
                }
            }
        },

        watch: {
            sass: {
                files: './assets/scss/{,*/}*.{scss, sass}',
                tasks: ['sass:dev']
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
      'sass:dev',
      'watch']);

    grunt.registerTask('build', [
      'uglify']);
};
