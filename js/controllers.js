'use strict';

angular.module('docsApp.controllers', []).
	controller('DocsCtrl', ['$scope', '$http', function($scope, $http){

		var scopeOrder = {
			server: 1,
			shared: 2,
			client: 3,
			menu: 4
		};

		var queryTimeoutId = -1;

		$scope.queryModel	= window.location.hash.substr(1) || "";
		$scope.query 		= window.location.hash.substr(1) || "";
		$scope.functions = [];

		$http({
			url: "./data/glua.json",
			method: "GET"
		}).success(function(data, status, headers, config) {
			$scope.functions = data;
		})

		$scope.scopedOrder = function(fn) {
			return (scopeOrder[fn.scope] || 99) + fn.title;
		}

		$scope.updateQuery = function() {
			window.clearTimeout(queryTimeoutId);

			queryTimeoutId = window.setTimeout(function(){
				$scope.$apply(function() {
					$scope.query = $scope.queryModel;
				});
			}, 220);

			window.location.hash = $scope.queryModel;
		}

		$scope.selectFunction = function(fn) {
			$scope.queryModel = fn.title;
			$scope.updateQuery();
		}

	}]);