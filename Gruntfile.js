'use strict';

var LIVERELOAD_PORT = 35729;
// var mountFolder = function (connect, dir) {
//   return connect.static(require('path').resolve(dir));
// };

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  // grunt.loadNpmTasks('grunt-nodev');

  // configurable paths
  var yeomanConfig = {
    app: 'src',
    dist: 'dist'
  };

  var nodemonIgnoredFiles = [
    'README.md',
    'Gruntfile.js',
    'node-inspector.js',
    'karma.conf.js',
    '/.git/',
    '/node_modules/',
    '/src/',
    '/dist/',
    '/test/',
    '/.tmp',
    '/.sass-cache',
    '*.txt'
  ];

  try {
    yeomanConfig.app = require('./bower.json').appPath || yeomanConfig.app;
  } catch (e) {}

  grunt.initConfig({
    yeoman: yeomanConfig,
    watch: {
      // options: {
      //   livereload: true
      // },
      coffee: {
        files: ['<%= yeoman.app %>/scripts/**/*.coffee'],
        tasks: ['coffee:dist']
      },
      coffeeTest: {
        files: ['<%= yeoman.app %>/scripts/**/*.spec.coffee'],
        tasks: ['coffee:test']
      },
      compass: {
        files: ['<%= yeoman.app %>/**/*.{scss,sass}' ],
        tasks: ['compass']
      },
      html: {
        files: ['<%= yeoman.app %>/**/*.html'],
        tasks: ['htmlmin:templates', 'html2js']
      },
      // put all karma targets into the `tasks` array
      karma: {
        files: ['<%= yeoman.app %>/scripts/**/*.js'],
        tasks: ['karma:unit:run'],
        options: {
          livereload: false
        }
      },
      // coverageBackend: {
      //     files: [
      //       '!Gruntfile.js',
      //       '!node-inspector.js',
      //       '!karma.conf.js',
      //       '*.js',
      //       'lib/**/*.js',
      //       'test/backend/**/*.js',
      //     ],
      //     tasks: ['coverageBackend'],
      //     options: {
      //         livereload: false,
      //     },
      // },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: [
          '<%= yeoman.app %>/*.html',
          '{.tmp,<%= yeoman.app %>}/**/*.css',
          '{.tmp,<%= yeoman.app %>}/scripts/**/*.js',
          '<%= yeoman.app %>/**/*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },
    // connect: {
    //   options: {
    //     port: 9000,
    //     // Change this to '0.0.0.0' to access the server from outside.
    //     hostname: 'localhost'
    //   },
    //   test: {
    //     options: {
    //       port: 9000,
    //       middleware: function (connect) {
    //         return [
    //           // mountFolder(connect, '.tmp'),
    //           mountFolder(connect, yeomanConfig.app)
    //         ];
    //       }
    //     }
    //   }
    // },
    // open: {
    //   // server: {
    //   //   url: 'http://localhost:<%= connect.options.port %>'
    //   // },
    //   testE2e: {
    //     url: 'http://localhost:<%= connect.options.port %>/runner.html'
    //   }
    // },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/**/*.js'
      ]
    },
    coffee: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/scripts',
          src: '{,*/}*.coffee',
          dest: '.tmp/scripts',
          ext: '.js'
        }]
      },
      test: {
        files: [{
          expand: true,
          cwd: 'test/spec',
          src: '{,*/}*.coffee',
          dest: '.tmp/spec',
          ext: '.js'
        }]
      }
    },
    compass: {
      options: {
        sassDir: '<%= yeoman.app %>/styles',
        cssDir: '.tmp/styles',
        generatedImagesDir: '.tmp/images/generated',
        imagesDir: '<%= yeoman.app %>/images',
        javascriptsDir: '<%= yeoman.app %>/scripts',
        fontsDir: '<%= yeoman.app %>/styles/fonts',
        importPath: '<%= yeoman.app %>/bower_components',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/styles/fonts',
        relativeAssets: false
      },
      dist: {
      },
      server: {
        options: {
          debugInfo: true
        }
      }
    },
    rev: {
      images: {
        files: {
          src: [
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/styles/fonts/*'
          ]
        }
      },
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/styles/{,*/}*.css'
          ]
        }
      }
    },
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>'
      }
    },
    usemin: {
      templates: {
        options: {
          type: 'html',
          dirs: ['<%= yeoman.dist %>'],
          baseDir: '<%= yeoman.dist %>'
        },
        files: [{
          src: ['.tmp/**/*.html']
        }]
      },
      distHtml: {
        options: {
          type: 'html',
          dirs: ['<%= yeoman.dist %>']
        },
        files: [{
          src: ['<%= yeoman.dist %>/{,*/}*.html']
        }]
      },
      distCss: {
        options: {
          type: 'css',
          dirs: ['<%= yeoman.dist %>']
        },
        files: [{
          src: ['<%= yeoman.dist %>/styles/{,*/}*.css']
        }]
      }
    },
    // usemin: {
    //   html: ['<%= yeoman.dist %>/{,*/}*.html'],
    //   css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
    //   options: {
    //     dirs: ['<%= yeoman.dist %>']
    //   }
    // },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '**/*.{png,jpg,jpeg}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: '**/*.svg',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    cssmin: {
      // dist: {
      //   files: {
      //     '<%= yeoman.dist %>/assets/styles/main.css': [
      //       '.tmp/styles/{,*/}*.css',
      //       '<%= yeoman.app %>/assets/styles/{,*/}*.css',
      //       '<%= yeoman.app %>/scripts/{,*/}assets/styles/{,*/}*.css'
      //     ]
      //   }
      // }
    },
    htmlmin: {
      dist: {
        options: {
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: ['*.html', '{,*/}*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      },
      deploy: {
        options: {
          removeComments: true,
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          // useShortDoctype: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: '{,*/}*.html',
          dest: '<%= yeoman.dist %>'
        }]
      },
      templates: {
        options: {
          removeComments: true,
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          // useShortDoctype: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: '**/*.tpl.html',
          dest: '.tmp'
        }]
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            // 'bower_components/**/*', // these shouldn't be needed
            'images/{,*/}*.{gif,webp}',
            'styles/fonts/*',
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/images',
          src: [
            'generated/*'
          ]
        }]
      }
    },
    html2js: {
      options: {
        base: '.tmp'
      },
      main: {
        src: ['.tmp/**/*.tpl.html' ],
        dest: '<%= yeoman.app %>/scripts/templates.js'
        // module: 'templates.app'
      }
    },
    http: {
      dropTest: {
        url: 'http://localhost:7475/db/data/cypher',
        method: 'post',
        json: {
          query:'START n=node(*) MATCH n-[r?]-() WHERE ID(n) <> 0 DELETE n,r'
        }
      }
    },
    karma: {
      options: {
        background: true
      },
      unit: {
        configFile: 'karma.conf.js'
      },
      unitOnce: {
        configFile: 'karma.conf.js',
        background: false,
        singleRun: true
      },
      e2e: {
        configFile: 'karma-e2e.conf.js',
        singleRun: true
      }
    },
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>/scripts',
          src: '*.js',
          dest: '<%= yeoman.dist %>/scripts'
        }]
      }
    },
    uglify: {
      dist: {
        files: {
          '<%= yeoman.dist %>/scripts/scripts.js': [
            '<%= yeoman.dist %>/scripts/scripts.js'
          ]
        }
      }
    },
    nodemon: {
      dev: {
        options: {
          file: 'server/index.js',
          args: ['development'],
          watchedExtensions: ['js', 'coffee'],
          // nodemon watches the current directory recursively by default
          // watchedFolders: ['.'],
          debug: true,
          delayTime: 1,
          ignoredFiles: nodemonIgnoredFiles
        }
      },
      nodeInspector: {
        options: {
          file: 'node-inspector.js',
          watchedExtensions: ['js', 'coffee'],
          exec: 'node-inspector',
          ignoredFiles: nodemonIgnoredFiles
        }
      }
    },
    concurrent: {
      nodemon: {
        options: {
          logConcurrentOutput: true
        },
        tasks: [
          'nodemon:nodeInspector',
          'nodemon:dev',
          'watch'
        ]
      },
      server: [
        'coffee:dist',
        'compass:server',
        'imagemin'
      ],
      test: [
        'coffee',
        'compass'
      ],
      dist: [
        // coffee script conversion
        'coffee',
        // css copy and minification
        'compass:dist',
        // image minification
        'imagemin',
        // svg minification
        'svgmin',
        // html copy to dist folder
        'htmlmin:dist'
      ]
    },
    mochaTest: {
      test: {
        // Test files
        src: [ 'server/test/{,*/}*.js' ],
        options: {
          // Select a Mocha reporter - http://visionmedia.github.com/mocha/#reporters
          reporter: 'spec',
          // require: 'should',
          ui: 'bdd',
          ignoreLeaks: false,
          require: 'server/test/coverage/blanket'
        }
      },
      coverage: {
        options: {
          reporter: 'html-cov',
          // use the quiet flag to suppress the mocha console output
          quiet: true
        },
        src: ['server/test/**/*.js'],
        // specify a destination file to capture the mocha
        // output (the quiet option does not suppress this)
        dest: 'server/coverage.html'
      }
    },
    env : {
      options : {
      //Shared Options Hash
      },
      test : {
        NODE_ENV : 'test'
      }
    }
  });

  // grunt.renameTask('regarde', 'watch');

  grunt.registerTask('server', [
    'clean:server',
    'htmlmin:templates',
    'html2js',
    'concurrent:server',
    'karma:unit',
    'concurrent:nodemon'
  ]);

  grunt.registerTask('test', [
    'env:test',
    'clean:server',
    'concurrent:test',
    'htmlmin:templates',
    'html2js',
    // refactor tests to not drop database every test (very slow)
    'mochaTest',
    'karma:unitOnce'
    // e2e tests when protractor is ready
  ]);

  // Wait for protractor
  // grunt.registerTask('test:e2e', [
  //   'env:test',
  //   'http:dropTest',
  //   'connect:test',
  //   'karma:e2e'
  // ]);

  grunt.registerTask('build', [
    'clean:dist',
    // copy images and other non script/html/css files
    'copy',
    // minify all of the .tpl.html files
    'htmlmin:templates',
    // run coffee, css and image minification
    'concurrent:dist',
    // revision the copied images
    'rev:images',
    // update the templates with minified images
    'usemin:templates',
    // convert all of the templates into a js file
    'html2js',
    // prepare list of js and css files for concat
    'useminPrepare',
    // unit test the front end application
    'karma:unitOnce',
    // merge all js and css files
    'concat',
    // swap angular for cdn version (need to investigate for bootstrap)
    'cdnify',
    // prepare angular js files for minimisation
    'ngmin',
    // minimise js
    'uglify',
    // revision all js and css files (for caching)
    'rev:dist',
    // update html files with references to revisioned files
    // 'usemin',
    'usemin:distHtml',
    'usemin:distCss',
    // minimise main html files (only templates minimised above)
    'htmlmin:deploy'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'test',
    'build'
  ]);
};
