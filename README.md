grunt-wordpress
===============

[中文版说明](http://undefinedblog.com/2014/01/grunt-wordpress/)

This is not a specific Grunt task, but a set of grunt configuration for better Wordpress theme development.

**Reading following content requires a basic understanding of [Grunt](http://gruntjs.com).**

##Final Goal
A regular Wordpress theme structure should looks like below, where you link your css files in `header.php` and js files in `footer.php`.
```
|
+- your_theme_name
|   +- header.php
|   +- footer.php
|   +- style.css
|   +- js
|      +- all your js files
|   +- css
|      +- all your css files
```
By using Grunt, we can concat, minified, add md5 token to all css and js files, then replace their reference in aformentioned `.php` files.
```
|
+- your_theme_name
|   +- header.php
|   +- footer.php
|   +- style.min.a2312abe.css
|   +- js-dist
|      +- all your js files that are minified and revved
|   +- css-dist
|      +- all your css files that are minified and revved
```
##Why this repo

Since Grunt is so powerful, why can't we just use existing plugins and tasks to build our Wordpress theme?

###Diffrent way to link static assets

Most Grunt plugins are built for modern webapp which based on Angular, Backbone, Ember, etc. In these apps, static assets are normally linked in relative path:
```html
<link rel="stylesheet" type="text/css" href="css/main.css" />
```
However, in Wordpress, we link them in absolute path:
```html
<?php define("URL", get_template_directory_uri()); ?>
...
...
<link rel="stylesheet" type="text/css" href="<?php echo URL;?>/css/main.css" />
```
The difference will make some Grunt plugin like `usemin` work incorrectly.

###Speical style.css

As we all know, Wordpress recognize a theme via `style.css` with a formatted comment block. In the mean time, unlike other css files, `style.css` must exist in root path. 

This will make some of our Grunt task harder to configure.

##Make the change

Considering the difference, we should make some change in our Wordpress theme source file in order to make full use of Grunt.

 - link static assets in relative path(remove the `<?php echo URL;?>` part)
 - rename `header.php` to `header-src.php`, similarly rename all your `.php` file which links static assets
 - rename `style.css` to `style-src.css`

To avoid minified, concated assets mix with original ones, we'd better place them in new folder like `js-dist` and `css-dist` other than same old one.

##Configure Grunt

After making the modification in our Wordpress theme, now we're starting configure Grunt. The following is a sample of `Gruntfile.js` which I myself used in my theme.

```javascript
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
```

The [grunt-wp-replace](https://github.com/jasonslyvia/grunt-wp-replace) task is a Grunt plugin I wrote for replace static assets filenames for Wordpress theme, it's kind of like a mini version of [grunt-usemin](https://github.com/yeoman/grunt-usemin).

##Conclusion

I pick some of Grunt tasks to fit my app deployment, you can add yours of course. I wish you can come up with better solution for using Grunt to build Wordpress theme.
