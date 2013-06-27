var requirejs = require('requirejs');

requirejs([
  'spider',
  'underscore',
  'cheerio',
  'path',
  'fs'
], function(spider, _, cheerio, path, fs) {

  var domain = 'wiki.garrysmod.com';
  var scrapeData = [];
  var spidey = spider({
    userAgent: "samuel.maddock@gmail.com"
  });

  // file where we'll dump the json
  var filename = path.dirname(__filename) + '/../app/data/glua.json';
  console.log('[Dumping to ' + filename + '.]');
  var file = fs.openSync(filename, 'w');

  var rootUrls = [
    'http://wiki.garrysmod.com/page/Category:Hooks',
    'http://wiki.garrysmod.com/page/Category:Functions',
    //'http://wiki.garrysmod.com/page/Enums'
  ];

  var scrapeCount = 0;

  spidey.route(domain, '/page/Category:Hooks', function ($, url) {
    console.log('---------');
    console.log('scraping:', url);

    var links = $('table ul li a');

    _.each(links, function(elt) {
      // only scrape a few pages for testing
      // if ( scrapeCount > 10 ) return;
      // scrapeCount++;
      spidey.get('http://' + domain + $(elt).attr('href'));
    });
  });

  spidey.route(domain, '/page/*/*', function ($, url) {
    console.log('glua scraping:', url);

    /*var sectionNames = [],
      sectionHTMLs = [];

    // function usage
    sectionNames.push('Usage');
    sectionHTMLs.push($('.function_line').text());

    // Get section names
    $('#bodyContent .mw-headline').each(function(i,elem){
      sectionNames.push($(elem).html());
    });

    // Get section contents
    $('#bodyContent .mw-content-ltr h1 + *').each(function(i,elem){
      sectionHTMLs.push($(elem).html());
    });*/

    var scope = '';
    var catlinks = $('#mw-normal-catlinks').html();

    if ( catlinks.indexOf('Server') > 0 ) {
      scope = 'server';
    } else if ( catlinks.indexOf('Client') > 0 ) {
      scope = 'client';
    } else if ( catlinks.indexOf('Shared') > 0 ) {
      scope = 'shared';
    } else if ( catlinks.indexOf('Menu') > 0 ) {
      scope = 'menu';
    }

    scrapeData.push({
      url   : url,
      title : $('#firstHeading').text().replace('/','.'),
      html  : $('#bodyContent .mw-content-ltr').html(),
      scope : scope
    });
  });

  // Start 'er up
  _.each(rootUrls, function(url) {
    spidey.get(url).log('info');
  });

  process.on('exit', function () {
    fs.writeSync(file, JSON.stringify(scrapeData, null, '\t'));
    console.log('DONE');
  });

  return;
});

