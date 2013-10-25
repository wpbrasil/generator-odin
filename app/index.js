'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var rimraf = require('rimraf');
var fs = require('fs');


var OdinGenerator = module.exports = function OdinGenerator(args, options, config) {
    yeoman.generators.Base.apply(this, arguments);

    this.on('end', function () {
        this.installDependencies({
            npm: false,
            skipInstall: options['skip-install']
        });
    });

    this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(OdinGenerator, yeoman.generators.Base);

OdinGenerator.prototype.askFor = function askFor() {
    var done = this.async();

    // have Yeoman greet the user.
    console.log(this.yeoman);

    var prompts = [{
        name: 'themeName',
        message: 'What is the theme name?',
        default: 'Odin'
    }, {
        name: 'themeURI',
        message: 'What is the theme URI?',
        default: 'https://github.com/wpbrasil/odin'
    }, {
        name: 'themeDescription',
        message: 'What is the theme URI?',
        default: 'Base theme for development with WordPress.'
    }, {
        name: 'authorName',
        message: 'What is the author name?',
        default: 'Grupo WordPress Brasil'
    }, {
        name: 'authorURI',
        message: 'What is the author URI?',
        default: 'http://www.facebook.com/groups/wordpress.brasil/'
    }, {
        name: 'themeVersion',
        message: 'What is the theme version?',
        default: '1.0.0'
    }, {
        name: 'textDomain',
        message: 'What is the theme text domain?',
        default: 'odin'
    }];

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

OdinGenerator.prototype.copyFiles = function copyFiles() {
    var done = this.async();

    this.remote('wpbrasil', 'odin', function (err, remote) {
        remote.directory('.', '.');
        done();
    });
};

OdinGenerator.prototype.replaceStyle = function replaceStyle() {
    var done = this.async(),
        styleFile = this.readFileAsString(path.join('.', 'style.css'));

    console.log('Updating the style.css...');

    styleFile = styleFile.replace(new RegExp(/Theme Name: .+\n/ig), 'Theme Name: ' + this.themeName + '\n');
    styleFile = styleFile.replace(new RegExp(/Theme URI: .+\n/ig), 'Theme URI: ' + this.themeURI + '\n');
    styleFile = styleFile.replace(new RegExp(/Description: .+\n/ig), 'Description: ' + this.themeDescription + '\n');
    styleFile = styleFile.replace(new RegExp(/Author: .+\n/ig), 'Author: ' + this.authorName + '\n');
    styleFile = styleFile.replace(new RegExp(/Author URI: .+\n/ig), 'Author URI: ' + this.authorURI + '\n');
    styleFile = styleFile.replace(new RegExp(/Version: .+\n/ig), 'Version: ' + this.themeVersion + '\n');
    styleFile = styleFile.replace(new RegExp(/Text Domain: .+\n/ig), 'Text Domain: ' + this.textDomain + '\n');

    rimraf('style.css', function () {
        done();
    });

    this.write('style.css', styleFile);
};

OdinGenerator.prototype.replaceTextDomain = function replaceTextDomain() {
    var self = this;

    if ('odin' !== self.textDomain) {
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
