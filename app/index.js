'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var rimraf = require('rimraf');
var fs = require('fs');
var chalk = require('chalk');

/**
 * OdinGenerator class.
 * Extends the Yeoman Generators Base class.
 *
 * @param  {String|Array} args
 * @param  {Object} options
 */
var OdinGenerator = module.exports = function OdinGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    this.installDependencies({
      bower: false,
      skipInstall: true
    });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(OdinGenerator, yeoman.generators.Base);

/**
 * Generator prompt settings.
 */
OdinGenerator.prototype.settings = function settings() {
  var done = this.async();

  // Show odin message.
  console.log('\n              ' + chalk.bold.gray('`:XXXXXX/-`') + '\n' +
              '            ' + chalk.bold.gray('.XXXX/`') + '\n' +
              '           ' + chalk.bold.gray('/XXX./XX.') + '\n' +
              '          ' + chalk.bold.gray('/XXX. XXXX-') + '            ' + chalk.bold.blue('`XXXXX`         /XX- `XX+            \n') +
              '          ' + chalk.bold.gray('XXXXXX.XXXX`') + '         ' + chalk.bold.blue('.XXXXXXXXX`       XXXX .XXX  XX  XXX   \n') +
              chalk.bold.gray('`        :XXXXXX.`XXX-X+.') + '     ' + chalk.bold.blue('.XXXX-.-XXXX  :XXXXXXXX -XXX  XXXXXXXX- \n') +
              chalk.bold.gray('+`     .XXXXXX/- .XXX.XXXX`') + '   ' + chalk.bold.blue('/XXX    /XXX .XXX+/XXXX :XXX  XXXX:XXXX \n') +
              chalk.bold.gray('.X-   .XXXX/.:X+. -++ .XXXX`') + '  ' + chalk.bold.blue('-XXX-   XXXX /XXX  XXXX :XXX  XXX- -XXX \n') +
              ' ' + chalk.bold.gray('.XX:.XXX+` -XXXXXX:---.:XXX') + '   ' + chalk.bold.blue('XXXXXXXXXX: `XXXXXXXXX :XXX  XXX. -XXX \n') +
              '  ' + chalk.bold.gray('`+XXXXX+XXXXXXXXXXXXXX./XX`') + '   ' + chalk.bold.blue('./XXXXX:`   .+XX/-XX: .XX+  XXX` .XXX \n') +
              '    ' + chalk.bold.gray('`./XXXXXXXX:.-/XXXX+-.XX') + ' \n' +
              '          ' + chalk.bold.gray('``             /X/') + ' \n' +
              '                        ' + chalk.bold.gray('-X:') + ' \n' +
              '                       ' + chalk.bold.gray(':/`') + ' \n');

  // set the options.
  var prompts = [{
    name: 'themeName',
    message: 'Theme Name:',
    default: 'Odin'
  }, {
    name: 'themeURI',
    message: 'Theme URI:',
    default: 'https://github.com/wpbrasil/odin'
  }, {
    name: 'themeDescription',
    message: 'Theme description:',
    default: 'Base theme for development with WordPress.'
  }, {
    name: 'authorName',
    message: 'Author:',
    default: 'Grupo WordPress Brasil'
  }, {
    name: 'authorURI',
    message: 'Author URI:',
    default: 'http://www.facebook.com/groups/wordpress.brasil/'
  }, {
    name: 'themeVersion',
    message: 'Version:',
    default: '1.0.0'
  }, {
    name: 'textDomain',
    message: 'Text domain:',
    default: 'odin'
  }];

  // set the class variables.
  this.prompt(prompts, function (props) {
    this.themeName = props.themeName;
    this.themeURI = props.themeURI;
    this.themeDescription = props.themeDescription;
    this.authorName = props.authorName;
    this.authorURI = props.authorURI;
    this.themeVersion = props.themeVersion;
    this.textDomain = props.textDomain;

    done();
  }.bind(this));
};

/**
 * Checkout the Odin in GitHub and copy to project directory.
 */
OdinGenerator.prototype.copyFiles = function copyFiles() {
  var done = this.async();

  this.remote('wpbrasil', 'odin', '2.1.1', function (err, remote) {
    remote.directory('.', '.');
    done();
  });
};

/**
 * Fill style.css header data.
 */
OdinGenerator.prototype.replaceStyle = function replaceStyle() {
  var done = this.async(),
      styleFile = 'style.css',
      styleContent = this.readFileAsString(path.join('.', styleFile));

  console.log('Updating the style.css...');

  styleContent = styleContent.replace(new RegExp(/Theme Name: .+\n/ig), 'Theme Name: ' + this.themeName + '\n');
  styleContent = styleContent.replace(new RegExp(/Theme URI: .+\n/ig), 'Theme URI: ' + this.themeURI + '\n');
  styleContent = styleContent.replace(new RegExp(/Description: .+\n/ig), 'Description: ' + this.themeDescription + '\n');
  styleContent = styleContent.replace(new RegExp(/Author: .+\n/ig), 'Author: ' + this.authorName + '\n');
  styleContent = styleContent.replace(new RegExp(/Author URI: .+\n/ig), 'Author URI: ' + this.authorURI + '\n');
  styleContent = styleContent.replace(new RegExp(/Version: .+\n/ig), 'Version: ' + this.themeVersion + '\n');
  styleContent = styleContent.replace(new RegExp(/Text Domain: .+\n/ig), 'Text Domain: ' + this.textDomain + '\n');

  rimraf(styleFile, function () {
    done();
  });

  this.write(styleFile, styleContent);
};

/**
 * Replace the textdomain in all .php files.
 */
OdinGenerator.prototype.replaceTextDomain = function replaceTextDomain() {
  if ('odin' !== this.textDomain) {
    var self = this;

    console.log('Updating the textdomain in all files...');

    var walk = function (dir, done) {
      var files = [];

      fs.readdir(dir, function (err, list) {
        if (err) {
          return console.log(err);
        }

        var i = 0;

        (function next() {
          var file = list[i++];
          if (!file) {
            return done(null, files);
          }

          file = dir + '/' + file;
          fs.stat(file, function (err, stat) {
            if (stat && stat.isDirectory()) {
              walk(file, function (err, res) {
                files = files.concat(res);
                next();
              });
            } else {
              files.push(file);
              next();
            }
          });
        })();
      });
    };

    walk('.', function (err, files) {
      if (err) {
        return console.log(err);
      }

      files.forEach(function (file) {
        if ('.php' === path.extname(file)) {
          fs.readFile(file, 'utf8', function (err, text) {
            if (err) {
              return console.log(err);
            }

            var newText = text.replace(new RegExp(/'odin'/ig), '\'' + self.textDomain + '\'');

            fs.writeFile(file, newText, 'utf8', function (err) {
              if (err) {
                return console.log(err);
              }
            });
          });
        }
      });
    });
  }
};

/**
 * Replace textdomain in pt_BR.po and compile to pt_BR.mo.
 */
OdinGenerator.prototype.compileLanguages = function compileLanguages() {
  if ('odin' !== this.textDomain) {
    console.log('Updating the languages files...');

    var done = this.async(),
        exec = require('child_process').exec,
        ptBRpo = 'languages/pt_BR.po',
        ptBRmo = 'languages/pt_BR.mo',
        poFile = this.readFileAsString(path.join('.', ptBRpo));

    poFile = poFile.replace(new RegExp(/\#\@ odin/ig), '#@ ' + this.textDomain);

    rimraf(ptBRpo, function () {
      done();
    });

    this.write(ptBRpo, poFile);

    console.log('Compiling the .mo file...');
    exec('msgfmt -o ' + ptBRmo + ' ' + ptBRpo);
  }
};

/**
 * Fill src/package.json data.
 */
OdinGenerator.prototype.replaceSrcPackage = function replaceSrcPackage() {
  var done = this.async(),
      packageFile = 'src/package.json',
      packageContent = this.readFileAsString(path.join('.', packageFile)),
      slug = (this.themeName + '').toLowerCase().replace(/ /g, '-');

  console.log('Updating the src/package.json...');

  packageContent = packageContent.replace(new RegExp(/\"name\"\: \"(.+)\"/ig), '"name": "' + slug + '"');
  packageContent = packageContent.replace(new RegExp(/\"description\"\: \"(.+)\"/ig), '"description": "' + this.themeDescription + '"');
  packageContent = packageContent.replace(new RegExp(/\"version\"\: \"(.+)\"/ig), '"version": "' + this.themeVersion + '"');
  packageContent = packageContent.replace(new RegExp(/\"title\"\: \"(.+)\"/ig), '"title": "' + this.themeName + '"');
  packageContent = packageContent.replace(new RegExp(/\"homepage\"\: \"(.+)\"/ig), '"homepage": "' + this.themeURI + '"');

  rimraf(packageFile, function () {
    done();
  });

  this.write(packageFile, packageContent);
};

/**
 * Remove markdown files.
 */
OdinGenerator.prototype.removeMdFiles = function removeMdFiles() {
  var done = this.async();

  console.log('Removing markdown files.');

  rimraf('./CHANGELOG.md', function () {});

  rimraf('./README.md', function () {
    done();
  });
};
