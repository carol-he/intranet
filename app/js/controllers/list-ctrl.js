'use strict';

angular
.module('app.controllers')
.controller('ListCtrl', function($scope, $rootScope, $stateParams, $state, Restangular, apiDescriptor) {
	var resourceName = $stateParams.resourceName;
	var resourceId = $stateParams.id;
	$scope.resourceName = resourceName;
	apiDescriptor.then(function(apiDescription) {
		$scope.rdesc = apiDescription.resource(resourceName);
	});

	var selectionMode = $stateParams.selectionMode;
	if(!selectionMode || (selectionMode !== 'single ' && selectionMode !== 'multiple')) {
		selectionMode = 'multiple';
	}
	$scope.selectionMode = selectionMode;
	Restangular.all(resourceName).getList().then(function(data) {
		$scope.data = data;
		if(resourceId) {
			$scope.model = _.find($scope.data, {id: resourceId});
		}
	});

	$scope.updateSelection = function(newModelId) {
		$state.go("list", {id: newModelId});
	}

	$scope.deleteResource = function(id) {
		Restangular.one(resourceName, id).remove()
			.then(function() {
				alert('Successfully deleted this entry');
			}).catch(function() {
				alert('Could not delete the entry');
			});

		$scope.data = Restangular.all(resourceName).getList().$object;
	};
});
