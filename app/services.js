// naming should indicate purpose, so no need to append 'Service'
angular.module('dataSharing.services')
  .factory('ArticleList', function() {

    var service = {};

    // simulate a bootstrapped model
    service.articles = [
      { id: 1, title: 'A title', author: 'M Godfrey' },
      { id: 2, title: 'Another title', author: 'J Bloggs' }
    ];

    // no article is selected initially,
    // but can it watched?
    service.selectedArticle = null;

    service.someCompletelyUnrelatedFunctionality = function() {
      alert('unrelated functionality!');
    };

    return service;
  });