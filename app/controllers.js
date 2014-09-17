angular.module('dataSharing.controllers')
  .controller('ListCtrl', function($scope, ArticleList) {

    // continue to point scope prop to service prop
    $scope.articles = ArticleList.articles;

    $scope.selectArticle = function(article) {
      // let us know when an article is selected
      console.log('article with id ' + article.id + ' selected');
      ArticleList.selectedArticle = article;
    };
  });
  
angular.module('dataSharing.controllers')
  .controller('DetailCtrl', function($scope, ArticleList) {

    $scope.article = null;

    // our watch expression is now a function
    // which is executed per digest cycle and the return value dirty checked
    // when dirty the listener is called with this scope - clever stuff!
    $scope.$watch(ArticleList.getSelectedArticle, function(newArticle, oldArticle, scope) {
      // let us know when an article has been selected
      console.log('watched article: ' + newArticle);

      scope.article = newArticle;
      // equivalent
      //$scope.article = newArticle;
    });
  });  