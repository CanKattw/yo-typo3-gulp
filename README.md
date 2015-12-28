# generator-typo3-gulp
*yo generator for gulp based typo3 theme development*

This setup will boost your workflow to ultimate. Its perfect for simple sites that can be build in a week. The focus is not on heavy php extension developing but creating themes. if you need custom content elements, go with DCE to get fastest and best results.

Allows you to develop themes locally with git/less/gulp. No need for a server with nodejs or root. Develop local while this setup pushes your changes to the server in the background. They will be ready before you've switched to the browser window.



## Features
* LiveReload
* Inject CSS changes without reload
* Less
* Sourcemaps
* bower
* gulp
* minify/ulify
* develop typoscript with git
* **really fast** build through caching
* auto deploy to server via ftp
* auto include bower files
* iconfont
* autoprefix your css
* support for dce
* ....


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
now we have to tell typo3 where our TypoScript files will be located (fileadmin/template/ts). My TypoScript files end with "*.ts.txt" so they dont interfere with TypeScript Files.
1. Create new typoscript template or replace an existing one with following line

    Setup:
    <INCLUDE_TYPOSCRIPT: source="DIR:fileadmin/template/ts/setup" extensions="txt">

    Constants:
    <INCLUDE_TYPOSCRIPT: source="DIR:fileadmin/template/ts/constants" extensions="txt">

    PageTs:
    <INCLUDE_TYPOSCRIPT: source="DIR:fileadmin/template/ts/pageTs" extensions="txt">


### 5. fire it up
    $ gulp


### 6. deploy
in order to finally deploy your website use the deploy task. (no sourcemaps)

    $ gulp deploy



to access your typo3, go to: <http://localhost:3000>

## What you should Know..

### TypoScript
Is stored in **src/ts/**. You have to include 1 line in your page typoscript setup to include everything. See #4.

### less
this setup is based on less. To overwrite less variables of your bower modules use **./variables.json**, example for font-awesome-font path is included.

### javascript
no linting jet but sourcemaps are working.

### iconfont
to generate the iconfont from the svg's in ./iconfont/ just run:

    gulp iconfont

make sure the css is included to your setup.


### Delete files on Server

**be aware**: by default gulp will only upload files to the server. If you delete a file locally it is still on the server. Run the cleanRemote task from time to time to get rid of old files.

    gulp cleanRemote


### install bower dependencies
bower dependencies will be automatically included into your template. just install them via

    $ bower install --save angular-material

and restart gulp.

## Problems
changes arent displayed on the site? Check if Typo3 is Caching anything and disabled it. if the problem persists create an ticket please, this project is at its verry beginning.
no changes ? make sure you are logged in to avoid caching of typoscript and html files


You cant login in through browsersync proxy? just dont. use localhost url for frontend only. You dont want pagereload in your backend.



## Features that will follow:
criticalCSS, jslint, and many more!
