(function app() {
  'use strict';

  var angularApp = angular.module('myApp', []); // eslint-disable-line no-undef
  angularApp .controller(
    'myCtrl',
    function ctrl($scope, $http, $location) {
      console.log($location.absUrl());
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
      $scope.handleControlClick = function() {
        console.log('handling control click');
      }
    }
  );
}());
