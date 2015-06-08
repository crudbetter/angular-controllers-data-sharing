angular.module('dataSharing.controllers')
  .controller('ListCtrl', function($scope, ArticleList) {

    // for now just point scope props to service props
    $scope.articles = ArticleList.articles;
    $scope.selectedArticle = ArticleList.selectedArticle;

    $scope.selectArticle = function(article) {
      // let us know when an article is selected
      console.log('article with id ' + article.id + ' selected');
      ArticleList.selectedArticle = article;
    };
  });

angular.module('dataSharing.controllers')
  .controller('DetailCtrl', function($scope, ArticleList) {

    // again for now, point scope prop to service prop
    $scope.article = ArticleList.selectedArticle;

    $scope.$watch('article', function(article) {
      // let us know when an article has been selected
      console.log('watched article: ' + article);
    });
  });  