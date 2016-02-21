The best way to share data between Angular controllers
======

### Installation

- `git clone https://github.com/crudbetter/angular-controllers-data-sharing.git`
- `npm start`
- Browse to one of:
  1. http://localhost:8000/app/rootScopeBroadcast/index.html
  2. http://localhost:8000/app/sharedService/index.html
  3. http://localhost:8000/app/sharedServiceDot/index.html
  4. http://localhost:8000/app/sharedServiceGetter/index.html

======

A good orchestra requires a group of talented musicians to play differing and complex instruments in time and in rhythm.

I can imagine the many years worth of practise required to play the cello in Bach's Brandenburg concerto No. 3, for example.

But how do they do it? How do they play their instrument with immense skill and still communicate effectively?

An initial answer might lie with the conductor - the person at the front curiously waving a stick about and looking all intense.

You may ask what an orchestra has to do with sharing data between Angular controllers. The answer is, well, not a lot - it's simply a good analogy to keep in mind as we explore the available options.

## $broadcast is evil

There I said it, a strong opinion that will need some backing up!

Lets consider an example - a two column app. On the left a list of selectable blog article titles. On the right the selected blog article title, author, published date and excerpt.

```javascript
// controller for the left hand column
angular.module('shareDataSample.controllers')
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
angular.module('shareDataSample.controllers')
  .controller('DetailCtrl', function($scope, $rootScope) {

    // which is interested in the selected article
    $rootScope.$on('articleSelected', function(event, article) {
      // updating it's scope accordingly
      $scope.article = article;
    });
  });
```

In this simple example `$broadcast` is working for us, but we haven't satisfied all the requirements. The selected article from `ListCtrl` does not yet contain published date or excerpt.

```javascript
angular.module('shareDataSample.controllers')
  .controller('DetailCtrl', function($scope, $rootScope, $resource) {

    // use $resource to back onto a REST API
    var Article = $resource('article/:articleId');

    // when an article is selected
    $rootScope.$on('articleSelected', function(event, article) {
      $scope.article = article;

      // fully load by getting the resource
      Article.get({ articleId: article.id }, function(article) {
        $scope.article = article;
      });
    });
  });
```

Now imagine other parts of the application care when the selected article is fully loaded.

```javascript
// fully populate by getting the resource
Article.get({ article: article.id), function(article) {
  $scope.article = article;

  // and notify the whole world again
  $rootScope.$broadcast('selectedArticleLoaded', article);
});
```

So we now have two event names - akin to magic strings - to maintain and at least two controllers interested in the concept of a selected article. In my experience this gets messy quickly as applications grow.

Returning to our analogy, `$broadcast` is the conductor and controllers the musicians. The conductor interprets the composers vision and provides beat timing to keep the musicians in sync. The conductor doesn't tell individual musicians when or whay to play. Instead the musicians have printed music, which they're "watching" to get this information.

In Angular a shared service is the equivalent of printed music.

## Shared services to the rescue

We could easily extract the `$broadcast` solution into a shared service - which brings encapsulation benefits but won't solve the overhead of event name maintenance. For this we need alternative solutions.

```javascript
// naming should indicate purpose, so no need to append 'Service'
angular.module('shareDataSample.services')
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

    return service;
  });

angular.module('shareDataSample.controllers')
  .controller('ListCtrl', function($scope, ArticleList) {

    // for now just point scope prop to service prop
    $scope.articles = ArticleList.articles;

    $scope.selectArticle = function(article) {
      // let us know when an article is selected
      console.log('article with id ' + article.id + ' selected');
      ArticleList.selectedArticle = article;
    };
  });

angular.module('shareDataSample.controllers')
  .controller('DetailCtrl', function($scope, ArticleList) {

    // again for now, point scope prop to service prop
    $scope.article = ArticleList.selectedArticle;

    $scope.$watch('article', function(article) {
      // let us know when an article has been selected
      console.log('watched article: ' + article);
    });
  });
```

![][2]

From this we can see that the watch fires on initial set (to null) but not when an article is selected - why?

By adding simple logging, the order in which Angular instantiates and injects dependencies becomes clearer.

```javascript
angular.module('shareDataSample.services')
  .factory('ArticleList', function() {
    console.log('ArticleList instantiated');

    ...
  });

angular.module('shareDataSample.controllers')
  .controller('ListCtrl', function($scope, ArticleList) {
    console.log('ListCtrl instantiated');

    ...
  });

angular.module('shareDataSample.controllers')
  .controller('DetailCtrl', function($scope, ArticleList) {
    console.log('DetailCtrl instantiated');

    ...
  });
```  

![][3]

As the service is a dependency to the controllers it is instantiated first. `ArticleList.selectedArticle` is null when instantiated and injected into the controllers. This means the controllers are setting a scope property to a primitive value, i.e. not an object reference. This behaviour is standard JavaScript, Angular just adds a layer of DI complexity.

So can this be overcome?

In a 2012(!) [best practises presentation][4], [Misko Hevery][5] gives an infamous soundbite that stuck with me, "if you use ng-model there has to be a dot somewhere. If you don't have a dot you're doing it wrong".

The "dot" advice was in the context of scope inheritance (ng-model creates a new child scope) - but it is also applicable to our scenario.

```javascript
angular.module('shareDataSample.controllers')
  .controller('ListCtrl', function($scope, ArticleList) {

    // continue to point scope prop to service prop
    $scope.articles = ArticleList.articles;

    $scope.selectArticle = function(article) {
      // let us know when an article is selected
      console.log('article with id ' + article.id + ' selected');
      ArticleList.selectedArticle = article;
    };
  });

angular.module('shareDataSample.controllers')
  .controller('DetailCtrl', function($scope, ArticleList) {

    // this time point scope prop to entire service object
    $scope.articles = ArticleList;

    // so that our watch expression contains a "dot"
    $scope.$watch('articles.selectedArticle', function(article) {
      // let us know when an article has been selected
      console.log('watched article: ' + article);
    });
  });
```

![][6]

Problems exist with this approach though. We're forced to set a scope property to the entire service object, resulting in anything added to the service being available for binding in the view. View bindings also end up being fairly verbose.

```html
    <div ng-controller="DetailCtrl">
      <button type="button" ng-click="articles.someCompletelyUnrelatedFuncionality()">Click Me!</button>
      <dl>
        <dt>Title:</dt>
        <dd>{{articles.selectedArticle.title}}</dd>
        <dt>Author:</dt>
        <dd>{{articles.selectedArticle.author}}</dd>
        <dt>Published date:</dt>
        <dd>{{articles.selectedArticle.date}}</dd>
        <dt>Excerpt</dt>
        <dd>{{articles.selectedArticle.excerpt}}</dd>
      </dl>
    </div>
```    

Truth be told I haven't shared the whole truth with my orchestra analogy. Printed music just contains the part of the symphony for the individual musician's instrument. They are still "watching" it though, just only for the bits of the symphony they are interested in. We have one last solution to explore which mimics this.

## Shared service getter methods

`$scope.$watch` can take a function. Because of this controllers can effectively watch the return value of a function on a shared service.

```javascript
angular.module('shareDataSample.services')
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

angular.module('shareDataSample.controllers')
  .controller('ListCtrl', function($scope, ArticleList) {
    // no change...
  });

angular.module('shareDataSample.controllers')
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
``` 

![][7]

### Conclusions

Shared service getter methods get us the best of all worlds: - no magic strings , either in `$broadcast` event names or watch expressions - concise view bindings - shared data between controllers

And for completeness and privacy reasons I would add a setter method too.

```javascript
    $scope.selectArticle = ArticleLise.setSelectedArticle;
    
    ...
    
    // selectedArticle now private
    var selectedArticle = null;
    
    service.setSelectedArticle = function(article) {
      selectedArticle = article;
    };
```

 [2]: watch-service-selected-article.png
 [3]: instantiation-order.png
 [4]: http://www.youtube.com/watch?feature=player_detailpage&v=ZhfUv0spHCY#t=1758s
 [5]: https://twitter.com/mhevery
 [6]: watch-service-selected-article-dot.png
 [7]: watch-service-selected-article-getter.png
