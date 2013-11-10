# Generator Odin [![Build Status](https://secure.travis-ci.org/wpbrasil/generator-odin.png?branch=master)](https://travis-ci.org/wpbrasil/generator-odin)

[Odin](http://wpod.in/) generator for [Yeoman](http://yeoman.io).

## Getting Started ##

Make sure you have [yo](https://github.com/yeoman/yo) installed: 

```bash
npm install -g yo
```

Install the `generator-odin`:

```bash
npm install -g generator-odin
```

And now generate your theme based on Odin Framework:

```bash
cd /path/to/wordpress/wp-content/themes/theme-name
yo odin
```

![](http://i.imgur.com/9iqVrMX.png)

## Contribute ##

Test for development:

```bash
git clone git@github.com:wpbrasil/generator-odin.git
cd generator-odin
[sudo] npm link
cd /path/to/your/project/
yo odin
```

And send a Pull Request o/

## Changelog ##

##### 1.0.3 - 31/10/13 #####

* Updated the Odin version to 2.1.3.

##### 1.0.2 - 31/10/13 #####

* Updated the Odin version to 2.1.2.

##### 1.0.1 - 26/10/13 #####

* Removed Yeoman welcome message and added a custom message.
* Updated the generator settings.
* Added inline documentation.
* Fixed indentation size.
* Added validation for URIs in settings method.

##### 1.0.0 - 25/10/13 #####

* Initial release.

## License ##

Copyright 2013 - WordPress Brasil Group.  
The PHP code is licensed with [GPLv2](http://www.gnu.org/licenses/gpl-2.0.txt).
