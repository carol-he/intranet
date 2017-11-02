'use strict';

angular
.module('app.controllers')
.controller('JobsListCtrl', function($scope, $sce, $rootScope, $stateParams, $state, Restangular, apiDescriptor, dataTransformer) {
	var resourceName = $stateParams.resourceName;
	var resourceId = $stateParams.id;
	$scope.resourceName = resourceName;
	apiDescriptor.then(function(apiDescription) {
		$scope.rdesc = apiDescription.resource(resourceName);
	});

	$scope.displayDate = function(date) {
		if (date === undefined) { return; };
		var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		var year = parseInt(date.substring(0,4));
		var month = parseInt(date.substring(5, 7));
		return monthNames[month - 1] + " " + year;
	}

	$scope.expiredOrNot = function(date){
		const today = new Date().toISOString;
		console.log(today);
		const d1 = new Date(today)
    const d2 = new Date(date);
		if(d1 <= d2){
			console.log(d1 < d2);
			return "Active";
		}
		console.log(d1 < d2);
		return "Expired";
	}

	$scope.prettifyDate = function(date) {
		if (date === undefined) { return; };
		var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		var year = parseInt(date.substring(0, 4));
		var month = parseInt(date.substring(5, 7));
		var day = parseInt(date.substring(8, 10));
		return monthNames[month - 1] + " " + day + ", "+ year;
	}

	var selectionMode = $stateParams.selectionMode;
	if (!selectionMode || (selectionMode !== 'single ' && selectionMode !== 'multiple')) {
		selectionMode = 'multiple';
	}

	$scope.jobIDtoAttr = {};

	$scope.selectionMode = selectionMode;
	Restangular.all(resourceName)
	.getList()
	.then(function(data) {
		$scope.data = data;
		if (resourceId) {
			var index = _.findIndex($scope.data, {id: resourceId});
			$scope.model = $scope.data[index];
		}

		_.each($scope.data, job => {
			//store all attributes for each job
			const attributes = {};
			//storing employer
			Restangular.one("organizations/" + job.relationships.employer.data.id)
			.get()
			.then(function(employer) {
				attributes['employer'] = employer.attributes.name;
				attributes['display'] = job.attributes.positionTitle + ' @ ' + employer.attributes.name;
			}).then( ()=> {
				//storing url
				if (job.attributes.applicationUrl !== undefined) {
					const url = job.attributes.applicationUrl;
					attributes['url'] = '<a href=' + url + '>' + url + '</a>';
				} else {
					attributes['url'] = '';
				}
				//add expire date
				const expireDate = job.attributes.exiresAt;
				attributes['expireDate'] = expireDate;
				//storing categories
				const categories = job.attributes.categories;
				attributes['categories'] = categories.join(', ');
				//storing desired skills
				if (job.relationships.desiredSkills.data.length > 0) {
					let skills = [];
					job.relationships.desiredSkills.data.forEach(data => {
						Restangular.one("skills/" + data.id)
						.get()
						.then(skill => {
								skills.push(skill.attributes.name);
								attributes['skills'] = skills.join(', ');
							});
						});
					}
					$scope.jobIDtoAttr[job.id] = attributes;
			}
			);
		});
	});


	$scope.updateSelection = function(newModelId) {
		var index =	_.findIndex($scope.data, {'id': newModelId});
		$scope.model = $scope.data[index];
		$state.transitionTo('list',
			{id: newModelId, resourceName: resourceName},
			{notify: false}
		);
	};

	$scope.deleteResource = function(id) {
		dataTransformer.deleteResource($scope.resourceName, id).then(function() {
			alert('Successfully deleted this entry');
			$scope.data = Restangular.all($scope.resourceName).getList().$object;
			$scope.model = {};
			$state.transitionTo('list',
				{resourceName: $scope.resourceName},
				{
					inherit: false,
					notify: false,
					reload: true
				}
			);
		});
	};
});
