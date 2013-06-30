'use strict';

angular.module('docsApp.directives', [])
	.directive('docRainbow', function() {
		return function(scope, element, attrs) {
			if ( scope.$last && window.Rainbow ) {
				setTimeout(function(){
					Rainbow.color();
				}, 100);
			}
		};
	});