// Get command line args
var args = process.argv.splice(2);
args.forEach(function(val, index, array) {
	console.log(index + ': ' + val);
});

var requirejs = require('requirejs');

requirejs([
	'spider',
	'underscore',
	'cheerio',
	'path',
	'fs'
], function(spider, _, cheerio, path, fs) {

	var domain = 'wiki.garrysmod.com';
	var luaStates = ['server','shared','client','menu'];
	var rootUrls = [
		'http://wiki.garrysmod.com/page/Category:Hooks',
		'http://wiki.garrysmod.com/page/Category:Functions',
		//'http://wiki.garrysmod.com/page/Enums'
	];

	var scrapeData = [];
	var spidey = spider({
		userAgent: "GLuaDocs Bot"
	});

	// file where we'll dump the json
	var filename = path.dirname(__filename) + '/../src/data/glua.json';
	console.log('[Dumping to ' + filename + '.]');
	var file = fs.openSync(filename, 'w');

	spidey.route(domain, '/page/Category:Hooks', function ($, url) {
		console.log('scraping:', url);

		var links = $('table ul li a');

		_.each(links, function(elt) {
			spidey.get('http://' + domain + $(elt).attr('href'));
		});
	});

	spidey.route(domain, '/page/*/*', function ($, url) {
		console.log('wiki scraping:', url);

		var catlinks = $('#mw-normal-catlinks').html().toLowerCase();

		// Determine Lua state/realm
		var scope = '';
		for(var i = 0; i < luaStates.length; i++) {
			if ( catlinks.indexOf(luaStates[i]) > 0 ) {
				scope = luaStates[i];
				break;
			}
		}

		var title = $('head').html().match(/&quot;wgPageName&quot;: &quot;(\S+)&quot;/)[1]
			.replace('/','.');

		// Set links to absolute urls
		function setAbsoluteUrl(idx, elem) {
			elem.attribs.href = "http://" + domain + elem.attribs.href;
			elem.attribs.target = "_blank";
		}
		$("#bodyContent .mw-content-ltr a[href^='/page/']").each(setAbsoluteUrl);
		$("#bodyContent .mw-content-ltr a[href^='/index.php']").each(setAbsoluteUrl);

		// Wiki code processing
		$("#bodyContent pre").each(function(i, e) {
			var html = $(e).html();
			html = html.replace(/if /g, 'if (');
			html = html.replace(/if \(\(/g, 'if (');
			html = html.replace(/ then/g, ') then');
			html = html.replace(/\)\) then/g, ') then');
			html = html.replace(/}\n/g, '}\n\n');
			html = html.replace(/\)/g, ' )');
			html = html.replace(/  \)/g, ' )');
			html = html.replace(/\(/g, '( ');
			html = html.replace(/\(  /g, '( ');
			html = html.replace(/\( \)/g, '()');
			html = html.replace(/\= \{\n/g, '=\n{\n');
			$(e).html(html);
		}).attr("data-language", "lua");

		// Insert args into function usage
		var args = [];
		var chunks = $(".arg_chunk").each(function(i,elem){
			args.push($(elem).html());
		});
		$('.function_args').html( args.join(', ') );

		scrapeData.push({
			url   : url,
			title : title,
			html  : $('#bodyContent .mw-content-ltr').html(),
			scope : scope
		});
	});

	// Start 'er up
	_.each(rootUrls, function(url) {
		spidey.get(url).log('info');
	});

	process.on('exit', function () {
		fs.writeSync(file, JSON.stringify(scrapeData));
		console.log('DONE');
	});

	return;
});

