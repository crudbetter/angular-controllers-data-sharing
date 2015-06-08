angular.module('dataSharing.services')
  .factory('ArticleList', function() {

    var service = {};

    service.articles = [
      { id: 1, title: 'A title', author: 'M Godfrey' },
      { id: 2, title: 'Another title', author: 'J Bloggs' }
    ];

    service.selectedArticle = null;

    service.getSelectedArticle = function() {
      return service.selectedArticle;
    };

    return service;
  });