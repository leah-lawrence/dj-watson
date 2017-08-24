(function app() {
  'use strict';

  /* eslint-disable no-param-reassign */

  var angularApp = angular.module('myApp', []); // eslint-disable-line no-undef

  angularApp .controller(
    'myCtrl',
    [
      '$scope', '$http', '$location',
      function ctrller($scope, $http, $location) {
        $scope.filters = [
          {
            name: 'anger',
            selected: false,
          },
          {
            name: 'joy',
            selected: false,
          },
          {
            name: 'sadness',
            selected: false,
          },
        ];

        $scope.cards = 'loading';
        $http.get($location.absUrl() + 'api/getWatsonData')
          .then(function gotResponse(response) {
            $scope.cards = response.data.results;
          })
          .catch(function errorOnGet(error) {
            $scope.cards = error;
          });

        $scope.handleCardClick = function handleCardClick() {
          if (this.card.selected) {
            this.card.selected = false;
          }
          else {
            this.card.selected = true;

            $scope.cards.forEach(function loopEach(card) {
              if (card !== this.card) {
                card.selected = false;
              }
            }.bind(this));
          }
        };

        $scope.clickBlank = function clickBlank($event) {
          if ($event.target.id === 'cards-background' || $event.target.id === 'cards-list' || $event.target.id === 'cards-nav') {
            $scope.cards.forEach(function loopEach(card) {
              card.selected = false;
            });
          }
        };

        $scope.handleControlClick = function handleControlClick(order) {
          $scope.selectedFilter = order+'enriched_lyrics.emotion.document.emotion.'+this.filter.name; // eslint-disable-line space-infix-ops
        };

        $scope.characterFilter = function characterFilter(filterString) {
          if (filterString) {
            return filterString.replace('&amp;', ' ').replace('lrm;&ndash;', ' ').replace('auml;th', ' ').replace('fuck', 'f***').replace('Fuck', 'F***');
          }

          return undefined;
        };

        $scope.sortByDate = function sortByDate(order) {
          $scope.dateSortOrder = order + 'year';
        };

        $scope.getImageName = function getImageName(name) {
          return 'images/' + name + '.svg';
        };
      },
    ]
  );
}());
