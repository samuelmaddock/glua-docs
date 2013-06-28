'use strict';

angular.module('docsApp', ['docsApp.controllers'])
	.directive('docRainbow', function() {
		return function(scope, element, attrs) {
			if ( scope.$last && window.Rainbow ) {
				setTimeout(function(){
					Rainbow.color();
				}, 100);
			}
		};
	});