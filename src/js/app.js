(function app() {
  'use strict';

  var angularApp = angular.module('myApp', []); // eslint-disable-line no-undef
  angularApp .controller(
    'myCtrl',
    function ctrl($scope, $http, $location) {
      $scope.activeControl = null;
      $scope.filters = [
        {name:'anger', selected: false},
        {name: 'joy', selected: false},
        {name:'sad', selected: false}]
      $scope.cards = 'loading'; // eslint-disable-line no-param-reassign
      $http.get($location.absUrl() + '/api/getWatsonData')
        .then(function gotResponse(response) {
          $scope.cards = response.data.results; // eslint-disable-line no-param-reassign
        })
        .catch(function errorOnGet(error) {
          $scope.cards = error; // eslint-disable-line no-param-reassign
      });
      $scope.handleCardClick = function() {
        this.card.selected = true
        $scope.cards.forEach(function(card) {
          if (card != this.card) {
            card.selected = false;
          }
        }.bind(this))
      }
      $scope.handleControlClick = function(e) {
        console.log(this.filter);
        this.filter.selected = true;
        $scope.filters.forEach(function(filter) {
          if (filter != this.filter) {
            filter.selected = false;
          }
        }.bind(this))

      }
    }
  );
}());
