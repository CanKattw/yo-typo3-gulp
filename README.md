# generator-typo3-gulp
*yo generator for gulp based typo3 theme development*

Allows you to develop themes locally with git/less/gulp. No need for a server with nodejs or root.
simply deploy all your files either to a locally available typo3 instance(**vagrant**/**lamp**/.. or to your **remote server via FTP**.
Right now it supports only ftp upload

## Features
* LiveReload
* Less
* CSS sourcemaps
* bower
* gulp
* minify/ulify
* develop typoscript with git
* **really fast** build through caching (10ms to compile less!)
* auto deploy to server via ftp
* auto include bower files


## setup
to run this setup you need nodejs locally available (not on typo3 server!)

#### 1. install yeoman
Clone this Repository as a boilerplate for new projects with

    $ sudo npm install -g yo

#### 2. install typo3-gulp generator
this setup reqires nodejs and npm.

    $ sudo npm i -g generator-typo3-gulp


### 3. run yo-generator

    $ yo typo3-gulp
enter your project data now.

### 4. configure typo3
now we have to tell typo3 where our TypoScript files will be located (fileadmin/template/ts)
1. Create new typoscript template or replace an existing one with following line

    Setup:
    <INCLUDE_TYPOSCRIPT: source="DIR:fileadmin/template/ts/setup" extensions="txt">

    Constants:
    <INCLUDE_TYPOSCRIPT: source="DIR:fileadmin/template/ts/constants" extensions="txt">

    PageTs:
    <INCLUDE_TYPOSCRIPT: source="DIR:fileadmin/template/ts/pageTs" extensions="txt">


### 5. fire it up
    $ gulp

to access your typo3, go to: <http://localhost:3000>

## What you should Know..

### TypoScript
Is stored in **src/typoscript/includes**
every file will be automatically be included.
do not write typoscript in typo3

### less
this setup is based on less. if you open your browser.
to overwrite less variables of your bower modules use **./variables.json**, example for font-awesome-font path is included.
### javascript
no linting jet but sourcemaps are working.

### iconfont

to generate the iconfont from the svg's in ./iconfont/ just run:

    gulp iconfont

make sure the css is included to your setup.


### install bower dependencies
bower dependencies will be automatically included into your template. just install them via

    $ bower install --save angular-material

and restart gulp.

## Problems
changes arent displayed on the site? Check if Typo3 is Caching anything and disabled it. if the problem persists create an ticket please, this project is at its verry beginning.
no changes ? make sure you are logged in to avoid caching of typoscript and html files


You cant login in through browsersync proxy? go to InstallTool > All Config -> doNotCheckReferer to "true"



## Features that will follow:
criticalCSS, jslint, and many more!
