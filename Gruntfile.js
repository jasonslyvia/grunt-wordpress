module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    //concat js file
    concat: {
      dist: {
        src: ['js/common.js', 'js/grid.js'],
        dest: 'js/main.js'
      }
    },

    //minify js file
    uglify: {
      dist: {
        files: [{
          expand: true,
          cwd: 'js',
          src: ['*.js'],
          dest: '.tmp/js',
          ext: '.min.js'
        }]
      }
    },

    //minify css file
    cssmin: {
      //deal with normal css
      dist: {
        files: [{
          expand: true,
          cwd: 'css',
          src: ['*.css'],
          dest: '.tmp/css',
          ext: '.min.css'
        }]
      },

      //deal with style.css, actually it should be style-src.css
      specialStyle: {
        options: {
          banner: '/*\n'+
                      'Theme Name: Twenty Forteen\n'+
                      'Theme URI: http://wordpress.com/\n'+
                      'Description: Another Wordpress Theme\n'+
                      'Author: YangSen\n'+
                      'Author URI: http://undefinedblog.com/\n'+
                      'Version: 1.0\n'+
                      'Private theme, not open-sourced, all rights reserved.\n'+
                  '*/\n'
        },
        files: {
          ".tmp/css/style.min.css": "style-src.css"
        }
      }
    },

    //add md5 token to static assets
    filerev: {
        js: {
          src: '.tmp/js/*.js',
          dest: 'js-dist'
        },
        css: {
          src: ['.tmp/css/*.css'],
          dest: 'css-dist'
        }
    },

    //copy files from one folder to another
    copy: {
      dist: {
        files: [
        {
          expand: true,
          src: ["css/*.css"],
          dest: ".tmp"
        },
        {
          expand: true,
          src: ["js/*.js", "!js/common.js", "!js/grid.js"],
          dest: ".tmp"
        }]
      }
    },

    //key point!!! replace static reference in .php files with new filename
    wpreplace: {
      dist: {
        src: ['header-src.php', 'footer-src.php'],
        options: {
          templatePath: '/wp-content/themes/canon/',
          jsPath: 'js-dist',
          cssPath: 'css-dist',
          concat: [{
            src: ['common.js', 'grid.js'],
            dest: ['main.js']
          }]
        }
      }
    },

    //clean temp files
    clean: {
      beforeBuild: ['js-dist',
                    'css-dist'],
      afterBuild: ['.tmp']
    }

  });

  //load dependencies
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-filerev');
  grunt.loadNpmTasks('grunt-wp-replace');

  //define our task for distribution
  grunt.registerTask('dist', ['clean:beforeBuild',
                                 'concat',
                                 'uglify',
                                 'cssmin',
                                 'filerev',
                                 'clean:afterBuild',
                                 'wpreplace'
                                 ]);

  //define our task for build
  grunt.registerTask('build', ['clean',
                                'copy',
                                'filerev',
                                'wpreplace']);

};
