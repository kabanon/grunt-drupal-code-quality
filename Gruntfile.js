'use strict';

module.exports = function(grunt) {
  var cssFiles, jsFiles, phpFiles;
  var path = require('path');
  var env = grunt.file.readJSON('env.json');

  cssFiles = [
    env.projectDir + '/**/*.css',
    '!' + env.projectDir + '/**/*.min.css',
    '!' + env.projectDir + '/**/node_modules/**/*',
    '!' + env.projectDir + '/**/bower_components/**/*'
  ];
  jsFiles = [
    env.projectDir + '/**/*.js',
    '!' + env.projectDir + '/**/*.min.js',
    '!' + env.projectDir + '/**/node_modules/**/*',
    '!' + env.projectDir + '/**/bower_components/**/*'
  ];
  phpFiles = [
    env.projectDir + '/**/*.php',
    env.projectDir + '/**/*.inc',
    env.projectDir + '/**/*.module',
    env.projectDir + '/**/*.install'
  ];

  /* Load configuration */
  grunt.initConfig({

    // CSS related tasks.
    csslint : {
      options : {
        csslintrc: '.csslintrc',
      },
      app : {
        src : cssFiles
      }
    },

    // JS related tasks.
    eslint: {
      options: {
        config: '.eslintrc'
      },
      app: {
        src: jsFiles
      }
    },
    eslintFiles: {
      app: {
        src: jsFiles
      }
    },

    // PHP related tasks.
    phpcs: {
      options: {
        bin: './vendor/bin/phpcs',
        standard: 'Drupal',
        warningSeverity: 0
      },
      app: {
        src: phpFiles
      }
    },
    phpcsFiles: {
      app: {
        src: phpFiles
      }
    },
    phpmd: {
      options: {
        bin: './vendor/bin/phpmd',
        reportFormat: 'text',
        rulesets: 'codesize,unusedcode'
      },
      app: {
        dir: env.projectDir
      }
    },
    phpmdFiles: {
      app: {
        src: phpFiles
      }
    },

    // Git related tasks.
    gitIndexFiles: {
      app: {
        options: {
          gitDir: env.gitDir,
          workTree: env.workTree,
          configSrcPath : [
            'csslint.app.src',
            'eslint.app.src',
            'eslintFiles.app.src',
            'phpcs.app.src',
            'phpcsFiles.app.src',
            'phpmdFiles.app.src'
          ]
        }
      }
    }

  });

  // Because eslint think it's an error not to have to files to check, we don't launch the task in this case.
  // Pull request has been made to fix this error in the grunt-eslint module : https://github.com/sindresorhus/grunt-eslint/pull/115
  grunt.registerMultiTask(
    'eslintFiles',
    'Custom eslint wrapping task.',
    function() {
      if (this.filesSrc.length > 0) {
        grunt.task.run('eslint');
      }
    }
  );

  // Because phpcs think it's an error not to have to files to check, we don't launch the task in this case.
  // Pull request has been made to fix this error in the grunt-phpcs module : https://github.com/SaschaGalley/grunt-phpcs/pull/45
  grunt.registerMultiTask(
    'phpcsFiles',
    'Custom phpcs wrapping task.',
    function() {
      if (this.filesSrc.length > 0) {
        grunt.task.run('phpcs');
      }
    }
  );

  // Because phpmd plugin is not compatible with the standard grunt files notation : http://gruntjs.com/configuring-tasks#files
  // We use this wrapping task to iterate over the files and launch one phpmd process for each one.
  grunt.registerMultiTask(
    'phpmdFiles',
    'Custom phpmd wrapping task.',
    function() {
      var taskList = [];
      this.filesSrc.forEach(function(file, i){
        var target = 'virtualTask' + i;
        taskList.push('phpmd:' +target);
        grunt.config.set('phpmd.' + target, {dir: file});
      });
      grunt.task.run(taskList);
    }
  );

  /* Load all plugins */
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-git-index-files');
  grunt.loadNpmTasks('grunt-phpcs');
  grunt.loadNpmTasks('grunt-phpmd');
  grunt.loadNpmTasks('grunt-eslint');

  /* Define tasks */
  grunt.registerTask('check', ['csslint', 'eslint', 'phpcs', 'phpmd']);
  grunt.registerTask('checkCommit', ['gitIndexFiles', 'csslint', 'eslintFiles', 'phpcsFiles', 'phpmdFiles']);
  grunt.registerTask('default', 'check');

  /* Help task */
  grunt.registerTask(
    'help',
    'Help task.',
    function() {
      grunt.log.writeln('');
      grunt.log.writeln('Availables commands :');
      grunt.log.writeln('');
      grunt.log.writeln('* grunt csslint       : run csslint tasks (CSS coding standards).');
      grunt.log.writeln('* grunt eslint        : run eslint task (JavaScript coding standards).');
      grunt.log.writeln('* grunt phpcs         : run phpcs task (PHP coding standards).');
      grunt.log.writeln('* grunt phpmd         : run phpmd tasks (PHP mess detector).');
      grunt.log.writeln('* grunt check         : run all above.');
      grunt.log.writeln('* grunt gitIndexFiles : modify the files set of other task for limiting to git index files only.');
      grunt.log.writeln('* grunt checkCommit   : launch the check task just after the gitIndexFiles task.');
      grunt.log.writeln('* grunt               : same as check');
    }
  );
};

