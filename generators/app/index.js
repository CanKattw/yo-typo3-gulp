'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var settings = {};
module.exports = yeoman.generators.Base.extend({
  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the hunky-dory ' + chalk.red('Typo3Gulp') + ' generator!'
    ));

    var prompts = [
      {
        type    : 'input',
        name    : 'project_name',
        message : 'Your projects name (no whitespaces)',
        default : ''
      },
      {
        type    : 'input',
        name    : 'project_version',
        message : 'Your projects version',
        default : '0.1.0'
      },
      {
        type    : 'input',
        name    : 'project_description',
        message : 'Your projects description',
        default : ''
      },



      {
        type    : 'input',
        name    : 'host',
        message : 'FTP Server: host (e.g. domain.tld)',
        default : ''
      },
      {
        type    : 'input',
        name    : 'username',
        message : 'FTP Server: username',
        default : ''
      },
      {
        type    : 'input',
        name    : 'password',
        message : 'FTP Server: password',
        default : ''
      },
      {
        type    : 'input',
        name    : 'path_to_typo3',
        message : 'full path to the template folder (must be like this: "typo3instance/fileadmin/template/" )',
        default : 'fileadmin/template/'
      },
      {
        type    : 'input',
        name    : 'http_path',
        message : 'Full url of the Typo3 instance (e.g. "http://mywebsite.com")',
        default : ''
      }
    ];






    this.prompt(prompts, function (props) {
      this.props = props;
      // To access props later use this.props.someOption;
      console.log(this.props);
      settings = this.props;
      done();
    }.bind(this));
  },

  writing: {
    app: function () {
      this.fs.copy(
        this.templatePath('_variables.json'),
        this.destinationPath('variables.json')
      );
      this.fs.copy(
        this.templatePath('gitignore'),
        this.destinationPath('.gitignore')
      );
      this.fs.copy(
        this.templatePath('_gulpfile.js'),
        this.destinationPath('gulpfile.js')
      );
      this.fs.copy(
        this.templatePath('src/**/*'),
        this.destinationPath('src/')
      );
      this.fs.copy(
        this.templatePath('assets/_demo.txt'),
        this.destinationPath('assets/demo.txt')
      );

      this.template('_config.json', 'config.json', settings);
      this.template('_bower.json', 'bower.json', settings);
      this.template('_package.json', 'package.json', settings);
    },

    projectfiles: function () {


    }
  },

  install: function () {
    this.installDependencies();
  }
});
