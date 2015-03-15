var fs = require('fs');
var path = require('path');

var async = require('async');
var cheerio = require('cheerio');
var request = require('request').defaults({
	headers: {
		'User-Agent': 'GLuaDocs Bot'
	}
});

var DOMAIN_NAME = 'wiki.garrysmod.com';
var ROOT_PAGES = [
	'http://wiki.garrysmod.com/page/Category:Hooks',
	'http://wiki.garrysmod.com/page/Category:Functions'
];
var LUA_STATES = ['server', 'shared', 'client', 'menu'];
var REQUEST_LIMIT = 30;

function fetchWikiEntries () {
	var tasks = [];

	function createTask (url) {
		return function (callback) {
			request(url, function (err, resp, html) {
				if (err) {
					callback('Couldn\'t fetch entry list at ' + url);
					return;
				}

				var $ = cheerio.load(html);
				processEntryList($, url, callback);
			});
		};
	}

	for (var i = 0; i < ROOT_PAGES.length; i++) {
		var rootUrl = ROOT_PAGES[i];
		tasks.push(createTask(rootUrl));
	}

	async.series(tasks, function (err, results) {
		if (err) {
			console.error('An error occured while scraping the wiki: ', err);
		}

		var data = results[0];

		for (var i = 1; i < results.length; i++) {
			data.concat(results[i]);
		}

		outputScrapeData(data);
	});
}

function processEntryList ($, url, callback) {
	console.log('Processing \'' + url + '\'..');

	var entries = [];

	$('table ul li a').each(function (i, elem) {
		var href = $(elem).attr('href');
		var url = 'http://' + DOMAIN_NAME + href;
		entries.push(url);
	});

	async.mapLimit(entries, REQUEST_LIMIT, fetchWikiEntry, function (err, results) {
		console.log('Finished processing \'' + url + '\'.');
		callback(null, results);
	});
}

function fetchWikiEntry (url, callback) {
	request(url, function (err, resp, html) {
		if (err) {
			console.error('ERROR: ', err);
			callback('Couldn\'t fetch entry at ' + url);
			return;
		}

		var $ = cheerio.load(html);
		processWikiEntry($, url, callback);
	});
}

function processWikiEntry ($, url, callback) {
	console.log('wiki scraping:', url);

	var $catlinks = $('#mw-normal-catlinks')
	var catlinks = $catlinks.html();

	if (!catlinks) {
		console.error('\tWARNING: Category links are missing on this page and it will thus be ignored.');
		console.info($catlinks);
		return;
	}

	catlinks = catlinks.toLowerCase();

	// Determine Lua state/realm
	var scope = '';
	for(var i = 0; i < LUA_STATES.length; i++) {
		if ( catlinks.indexOf(LUA_STATES[i]) > 0 ) {
			scope = LUA_STATES[i];
			break;
		}
	}

	var title = $('head').html().match(/"wgPageName": "(\S+)"/)[1]
		.replace('/','.');

	// Set links to absolute urls
	function setAbsoluteUrl(idx, elem) {
		elem.attribs.href = "http://" + DOMAIN_NAME + elem.attribs.href;
		elem.attribs.target = "_blank";
	}

	var $content = $('#bodyContent .mw-content-ltr');

	$content.find("a[href^='/page/']").each(setAbsoluteUrl);
	$content.find("a[href^='/index.php']").each(setAbsoluteUrl);

	// Wiki code processing
	$content.find("pre").each(function(i, e) {
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
	var chunks = $content.find(".arg_chunk").each(function(i,elem){
		args.push($(elem).html());
	});
	$content.find(".function_args").html( args.join(', ') );

	// Remove 'View Source' link since we already have this feature
	var $viewSourceNode = $content.find('.external.text');
	if ($viewSourceNode.length > 0) {
		$viewSourceNode.parent().remove();
	}

	var entryData = {
		url: url,
		title: title,
		html: $('#bodyContent .mw-content-ltr').html(),
		scope: scope
	};
	callback(null, entryData);
}

var OUTPUT_FILE;

function outputScrapeData (data) {
	console.info('Outputting JSON data..');

	var json = JSON.stringify(data);
	fs.writeSync(OUTPUT_FILE, json);

	console.log('DONE');
}

function start () {
	// attempt to open file where we will be outputting data
	var filename = path.dirname(__filename) + '/../app/data/glua.json';
	OUTPUT_FILE = fs.openSync(filename, 'w');

	fetchWikiEntries();
}

start();
