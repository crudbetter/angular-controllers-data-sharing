// controller for the left hand column
angular.module('dataSharing.controllers')
  .controller('ListCtrl', function($scope, $rootScope) {

    // simulates a bootstrapped array of models
    $scope.articles = [
      { id: 1, title: 'A title', author: 'M Godfrey' },
      { id: 2, title: 'Another title', author: 'Someone else' }
    ];

    // one of which can be selected
    $scope.selectArticle = function(article) {
      // and the whole world is notified
      $rootScope.$broadcast('articleSelected', article);
    };
  });

// controller for the right hand column
angular.module('dataSharing.controllers')
  .controller('DetailCtrl', function($scope, $rootScope) {

    // which is interested in the selected article
    $rootScope.$on('articleSelected', function(event, article) {
      // updating it's scope accordingly
      $scope.article = article;
    });
  });