# Garry's Mod Lua Docs

Quick documentation lookup for Garry's Mod Lua, inspired by http://dochub.io/

### Features ###
* Faster documentation lookup
* Sorted by Lua state (server, shared, client, menu)
* Code syntax highlighting
* Offline availability
* Links back to wiki

## Scraper ##
Updating GLua Docs involves scraping the [Garry's Mod Wiki](http://wiki.garrysmod.com/page/Main_Page).
It's suggested not to run this too often as to respect bandwidth usage.
[Node.js](http://nodejs.org/) is required to run the scraper.

    cd scraper
    npm install         # install node.js dependencies (see package.json)
    node scraper.js     # run the scraper
    
## Building ##
[Grunt](http://gruntjs.com/) is used to run various processes on the code prior to deployment.
Reading through the [Getting Started guide](http://gruntjs.com/getting-started) should help in setting up Grunt.
Simply run `grunt` from the command line to build the necessary project files into `/app`
