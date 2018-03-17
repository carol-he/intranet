angular
.module('app.services')
.factory('preProcess', function($q, $filter, Restangular, formatTeamDisplayFilter) {
	'use strict';
    var funcs = {
        displayDate: function(filter) {
                return function(date){
                    return filter('date')(date, 'MMMM yyyy');
                }
        },
        objectIdtoName: function(name){;
            var deferred = $q.defer();
            var promise = deferred.promise;
            var objectIdToNameHash = {};
            promise.then(function(){
                return Restangular.all(name).getList()
                        .then(function(){
                        _.each(undefined, function(element) {
                            objectIdToNameHash[element.id] = element.attributes.name;
                        })
                        return  objectIdToNameHash;                    
                        });
                    });
            deferred.resolve();
            return objectIdToNameHash;
                               
        },
        positionToString: function(teamMap, element, includeLead){
            if(includeLead){
                return formatTeamDisplayFilter(teamMap[element.relationships.team.data.id], element.attributes.isLead);
            }
            else{
                return formatTeamDisplayFilter(teamMap[element.relationships.team.data.id], false);
            }
        },
				prettifyDate: function(date) {
					if (date == undefined) { return; };
					var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
					var year = parseInt(date.substring(0, 4));
					var month = parseInt(date.substring(5, 7));
					var day = parseInt(date.substring(8, 10));
					return monthNames[month - 1] + " " + day + ", "+ year;
				},
        loadCurrentEBoard: function(scope, teamIds){
            var eBoard = [];
            Restangular.all('memberships')
            .getList()
            .then(function(data) {
                _.each(data, function(member){
                    if(member.attributes.isActive){
                        Restangular.one("people/" + member.relationships.member.data.id)
                        .get()
                        .then(function (person){
                            
                            Restangular.one("positions/" + member.relationships.position.data.id)
                            .get()
                            .then(function(position) {
                                eBoard.push(person.attributes.name);
                            });
                        });
                    }
                });
            });
            return eBoard;
        }
    };
    return funcs;
});