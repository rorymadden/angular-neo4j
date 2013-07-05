'use strict';
// var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
// var mountFolder = function (connect, dir) {
//   return connect.static(require('path').resolve(dir));
// };

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  // grunt.loadNpmTasks('grunt-nodev');

  // configurable paths
  var yeomanConfig = {
    app: 'app',
    dist: 'dist'
  };

  // var nodevIgnoredFiles = [
  //   'README.md',
  //   'Gruntfile.js',
  //   '/.git/',
  //   '/node_modules/',
  //   '/app/',
  //   '/dist/',
  //   '/test/',
  //   '/.tmp',
  //   '/.sass-cache',
  //   '*.txt',
  // ];

  try {
    yeomanConfig.app = require('./bower.json').appPath || yeomanConfig.app;
  } catch (e) {}

  grunt.initConfig({
    yeoman: yeomanConfig,
    watch: {
      options: {
        livereload: true
      },
      coffee: {
        files: ['<%= yeoman.app %>/scripts/{,*/}*.coffee'],
        tasks: ['coffee:dist']
      },
      coffeeTest: {
        files: ['<%= yeoman.app %>/scripts/{,*/}*.spec.coffee'],
        tasks: ['coffee:test']
      },
      compass: {
        files: ['<%= yeoman.app %>/assets/styles/{,*/}*.{scss,sass}', '<%= yeoman.app %>/scripts/{,*/}assets/styles/{,*/}*.{scss,sass}' ],
        tasks: ['compass'],
      },
      scripts: {
        files: [
          '<%= yeoman.app %>/**/*.html',
          '{.tmp,<%= yeoman.app %>}/scripts/**/*.js',
        ],
      },
      css: {
        files: [
          '{.tmp,<%= yeoman.app %>}/assets/styles/{,*/}*.css',
          '{.tmp,<%= yeoman.app %>}/scripts/{,*/}assets/styles/{,*/}*.css',
        ],
      },
      images: {
        files: [
          '<%= yeoman.app %>/assets/img/**/*.{png,jpg,jpeg,webp}',
          '<%= yeoman.app %>/scripts/{,*/}assets/img/{,*/}*.{png,jpg,jpeg,gif,webp}'
        ],
      },
      // livereload: {
      //   files: [
      //     '{.tmp,<%= yeoman.app %>}/assets/styles/{,*/}*.css',
      //     '{.tmp,<%= yeoman.app %>}/scripts/{,*/}assets/styles/{,*/}*.css',
      //     '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
      //     '<%= yeoman.app %>/assets/img/{,*/}*.{png,jpg,jpeg,gif,webp}',
      //     '<%= yeoman.app %>/scripts/{,*/}assets/img/{,*/}*.{png,jpg,jpeg,gif,webp}'
      //   ],
      //   tasks: ['livereload']
      // }
    },
    connect: {
      options: {
        port: 4000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost'
      }
    },
    open: {
      server: {
        url: 'http://localhost:<%= connect.options.port %>'
      },
      testE2e: {
        url: 'http://localhost:<%= connect.options.port %>/test/runner.html'
      }
    },
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
        '<%= yeoman.app %>/scripts/{,*/}*.js'
        // '<%= yeoman.app %>/scripts/{,*/}*.js'
        // exclude tests?
      ]
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      },
      e2e: {
        configFile: 'karma-e2e.conf.js',
        singleRun: true
      }
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
        src: ['server/test/{,*/}*.js'],
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
    },
    html2js: {
      options: {
        base: 'app'
      },
      main: {
        src: ['<%= yeoman.app %>/**/*.tpl.html' ],
        dest: '<%= yeoman.dist %>/templates/app.js'
        // module: 'templates.app'
      }
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
        // sassDir: [ '<%= yeoman.app %>/assets/styles', '<%= yeoman.app %>/scripts/{,*/}assets/styles' ],
        sassDir: '<%= yeoman.app %>/assets/styles',
        // cssDir: '.tmp/styles',
        // imagesDir: [ '<%= yeoman.app %>/assets/img', '<%= yeoman.app %>/scripts/{,*/}assets/img' ],
        imagesDir: '<%= yeoman.app %>/assets/img',
        javascriptsDir: '<%= yeoman.app %>/scripts',
        // fontsDir: [ '<%= yeoman.app %>/assets/styles/fonts', '<%= yeoman.app %>/scripts/{,*/}assets/styles/fonts' ],
        fontsDir: '<%= yeoman.app %>/assets/styles/fonts',
        importPath: '<%= yeoman.app %>/components',
        relativeAssets: true
      },
      dist: {
        options: {

        }
      },
      server: {
        options: {
          debugInfo: true
        }
      }
    },
    concat: {
      dist: {
        files: {
          '<%= yeoman.dist %>/scripts/scripts.js': [
            '.tmp/scripts/{,*/}*.js',
            '<%= yeoman.app %>/scripts/{,*/}*.js'
            //exclude tests?
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
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        dirs: ['<%= yeoman.dist %>']
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          // cwd: [ '<%= yeoman.app %>/assets/img', '<%= yeoman.app %>/scripts/{,*/}assets/img' ],
          cwd: '<%= yeoman.app %>/assets/img',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    cssmin: {
      dist: {
        files: {
          '<%= yeoman.dist %>/assets/styles/main.css': [
            '.tmp/styles/{,*/}*.css',
            '<%= yeoman.app %>/assets/styles/{,*/}*.css',
            '<%= yeoman.app %>/scripts/{,*/}assets/styles/{,*/}*.css'
          ]
        }
      }
    },
    htmlmin: {
      dist: {
        options: {
          /*removeCommentsFromCDATA: true,
          // https://github.com/yeoman/grunt-usemin/issues/44
          //collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true*/
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: ['*.html', '{,*/}*.html'],
          dest: '<%= yeoman.dist %>'
        }]
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
          ],
        }
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
            '*.{ico,txt}',
            '.htaccess',
            'components/{,*/}*',
            'assets/img/{,*/}*.{gif,webp}',
            'assets/styles/fonts/*'
          ]
        }]
      }
    },
    nodev: {
      dev: {
        options: {
          file: 'server/index.js',
          args: ['development'],
          // watchedExtensions: ['js', 'coffee'],
          // nodev watches the current directory recursively by default
          // watchedFolders: ['.'],
          debug: true,
          delayTime: 1,
          // ignoredFiles: nodevIgnoredFiles,
        }
      },
    },
    concurrent: {
      nodev: {
        options: {
          logConcurrentOutput: true,
        },
        tasks: [
          // 'nodev:nodeInspector',
          'nodev:dev',
          // 'connect',
          'open:server',
          'watch',
        ],
      },
      nodevTest: {
        options: {
          logConcurrentOutput: true,
        },
        tasks: [
          // 'nodev:nodeInspector',
          'nodev:dev',
          'connect',
          'open:testE2e',
          'watch',
        ],
      },
      server: [
        'clean:server',
        'coffee:dist',
        'compass:server',
      ],
      test: [
        'env:test',
        'clean:server',
        // 'coffee',
        // 'compass',
        // 'html2js',
        'mochaTest',
        // 'karma'
      ],
      dist: [
        'clean:dist',
        'jshint',
        'coffee',
        'compass:dist',
        // 'imagemin',
        // 'svgmin',
        'htmlmin'
      ]
    },
  });

  // grunt.renameTask('regarde', 'watch');

  grunt.registerTask('server', [
    // 'clean:server',
    // 'coffee:dist',
    // 'compass:server',
    // 'livereload-start',
    // 'connect:livereload',
    // 'open',
    // 'watch'
    'concurrent:server',
    'concurrent:nodev'
  ]);

  grunt.registerTask('test', [
    'env:test',
    'clean:server',
    'coffee',
    'compass',
    'html2js',
    // 'connect:test',
    'mochaTest',
    'karma:unit'
  ]);

  grunt.registerTask('test:e2e', [
    'env:test',
    'http:dropTest',
    'concurrent:server',
    'nodev:dev'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'jshint',
    'concurrent:dist',
    'test',
    'useminPrepare',
    'cssmin',
    'concat',
    'copy',
    'cdnify',
    'usemin',
    'ngmin',
    'uglify'
  ]);

  grunt.registerTask('default', ['build']);
};
