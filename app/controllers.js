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

    // this time point scope prop to entire service object
    $scope.articles = ArticleList;

    // so that our watch expression contains a "dot"
    $scope.$watch('articles.selectedArticle', function(article) {
      // let us know when an article has been selected
      console.log('watched article: ' + article);
    });
  }); 