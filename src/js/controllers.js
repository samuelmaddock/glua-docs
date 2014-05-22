angular.module('docsApp.controllers', []).
	controller('DocsCtrl', ['$scope', '$http', '$location', '$anchorScroll', '$sce', function($scope, $http, $location, $anchorScroll, $sce){

		var scopeOrder = {
			server: 1,
			shared: 2,
			client: 3,
			menu: 4
		};

		var queryTimeoutId = -1;

		$scope.queryModel	= $location.search().query  || "";
		$scope.query		= $location.search().query  || "";
		$scope.filter		= $location.search().filter || $scope.queryModel;
		$scope.functions = [];

		$http({
			url: "./data/glua.json",
			method: "GET"
		}).success(function(data, status, headers, config) {
			$scope.functions = data;
		})

		$scope.scopedOrder = function(fn) {
			return (scopeOrder[fn.scope] || 30) + fn.title;
		}

		$scope.scrollTo = function(loc) {
			$location.hash(loc);
			$anchorScroll();
		}

		$scope.select = function(fn, pastLimit) {
			if (pastLimit) {
				$location.search('filter', fn.title);
				$scope.filter = fn.title;
			} else {
				$location.search('filter', '');
				$scope.filter = $scope.query;
				$scope.scrollTo(fn.title);
			}
			
		}

		$scope.updateQuery = function() {
			window.clearTimeout(queryTimeoutId);

			$scope.scrollTo('s_top');
			$scope.scrollTo('top');

			queryTimeoutId = window.setTimeout(function(){
				$scope.$apply(function() {
					$scope.filter = $scope.queryModel;
					$scope.query = $scope.queryModel;
					$location.search('query', $scope.queryModel);
					$location.search('filter', '');
				});
			}, 220);

		}

		$scope.unsafeHtml = function(html) {
			return $sce.trustAsHtml(html);
		}

	}]);

