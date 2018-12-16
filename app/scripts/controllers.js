'use strict';

angular.module('docsApp.controllers', [])
	.controller('DocsCtrl',
			['$scope', '$filter', '$http', '$location', '$anchorScroll', '$sce',
			function($scope, $filter, $http, $location, $anchorScroll, $sce) {

		/**
		 * Lua state sort order.
		 *
		 * @type {Object}
		 */
		var luaScopeOrder = {
			server:  1,
			shared:  2,
			client:  3,
			menu:    4
		};

		/**
		 * Search query model; binds to the search input.
		 *
		 * @type {String}
		 */
		$scope.queryModel = $location.search().q  || '';

		/**
		 * Search query used for filtering.
		 *
		 * @type {String}
		 */
		$scope.query = $location.search().q  || '';

		/**
		 * String used to filter the results that show up in the documentation
		 * listing.
		 *
		 * @type {String}
		 */
		$scope.docFilter = $location.search().f || $scope.queryModel;

		/**
		 * Documentation function listing limit.
		 * @type {Number}
		 */
		$scope.resultLimit = 50;

		/**
		 * Documentation functions.
		 *
		 * @type {Array}
		 */
		$scope.functions = null;

		// fetch the documentation JSON
		$http({
			url: './data/glua.json',
			method: 'GET'
		}).success(function(data) {
			$scope.functions = sortFunctions(data);
		});

		// var orderBy = $filter('orderBy');

		/**
		 * Sorts the list of functions by Lua scope order and title.
		 *
		 * Precendence order:
		 * 1. Lua scope
		 *    server > shared > client > menu > undefined
		 *
		 * 2. Context (case-insensitive)
		 *    e.g. util vs ents
		 *
		 * 3. Hook vs Object (case-sensitive)
		 *    e.g. ENTITY vs Entity
		 *
		 * 4. Property/method name (case-sensitive)
		 *    e.g. GetPos vs SetPos
		 *
		 * @param  {Array} data List of functions.
		 * @return {Array}      Sorted list.
		 */
		function sortFunctions(data) {
			/*var func;

			for (var i = 0; i < data.length; i++) {
				func = data[i];
				func.scopeOrder = luaScopeOrder[func.scope] || 5;
			}

			return orderBy(data, ['+scopeOrder', '+title']);*/

			data.sort(function (a, b) {
				var aOrder = luaScopeOrder[a.scope] || 5,
					bOrder = luaScopeOrder[b.scope] || 5;

				// lua scope order comparison
				if (aOrder < bOrder) { return -1; }
				if (aOrder > bOrder) { return 1; }

				var afunc = a.title.split('.'),
					bfunc = b.title.split('.'),
					aobj = afunc[0],
					bobj = bfunc[0],
					aprop = afunc[1],
					bprop = bfunc[1];

				// case insensitive object name comparison
				if (aobj.toLowerCase() < bobj.toLowerCase()) { return -1; }
				if (aobj.toLowerCase() > bobj.toLowerCase()) { return 1; }

				// case sensitive object name comparison
				// hooks before function names
				if (aobj < bobj) { return -1; }
				if (aobj > bobj) { return 1; }

				// case sensitive property comparison
				if (aprop < bprop) { return -1; }
				if (aprop > bprop) { return 1; }

				return 0;
			});

			return data;
		}

		/**
		 * Result each scroll container to the top.
		 */
		function resultsResetScroll() {
			var resultListing = document.getElementById('resultListing'),
				resultDocs = document.getElementById('resultDocs');

			if (resultListing) {
				resultListing.scrollTop = 0;
			}

			if (resultDocs) {
				resultDocs.scrollTop = 0;
			}
		}

		$scope.select = function(fn, index) {
			if (!$scope.queryModel.length || (index > $scope.resultLimit)) {
				$location.search('f', fn.title);
				$scope.docFilter = fn.title;
				$anchorScroll();
			} else {
				$location.search('f', null);
				$scope.docFilter = $scope.query;
				// $anchorScroll();
				var elem = document.getElementById(fn.title);
				if (elem) {
					elem.scrollIntoView(true);
				}
			}

		};

		$scope.updateQuery = (function () {
			var queryTimeoutId,
				searchTimeout = 220; // milliseconds

			return function() {
				if (queryTimeoutId) {
					window.clearTimeout(queryTimeoutId);
				}

				queryTimeoutId = window.setTimeout(function(){
					resultsResetScroll();

					$scope.$apply(function() {
						var queryModel = $scope.queryModel,
							queryParam = queryModel.length ? queryModel : null;

						$scope.docFilter = queryModel;
						$scope.query = queryModel;

						$location.search('q', queryParam);
						$location.search('f', null);
					});
				}, searchTimeout);
			};
		}());

		window.onpopstate = function( e ) {
			resultsResetScroll();
			$scope.$apply(function() {
				var filter = $location.search().f;
				if ( filter ) {
					$scope.docFilter = filter; // Update content
					$scope.query = ''; // Update the sidebar
					$scope.queryModel = ''; // Update the search text
				}

				var query = $location.search().q;
				if ( query ) {
					$scope.docFilter = query;
					$scope.query = query;
					$scope.queryModel = query;
				}
			});
		}

		$scope.unsafeHtml = function(html) {
			return $sce.trustAsHtml(html);
		};

	}]);

