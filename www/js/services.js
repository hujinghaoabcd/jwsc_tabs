angular.module('starter.services', [])

.factory('Folders',function($q, $http,$rootScope,$stateParams){

  return {
    /**获取分类列表**/
    getFolderList : function(fatherId) {
      var defer = $q.defer();
        $http({
          method: "post",
          url: $rootScope.baseUrl + "/folder/getFolderByFatherId",
          params: {'fatherId':fatherId},
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
          },
          //cache: $rootScope.useCache
        }).success(function(data){
          //console.log(data.result);
          defer.resolve(data.result);
        }).error(function(err){
          console.log("fail to http POST folder/getFolderByFatherId");
          defer.reject(err);
        });     
      return defer.promise;
    }
  };
})

.factory('ArticleService',function($q, $http,$rootScope,$stateParams){

  //var pageNo = 1;
  var service = {    // our factory definition
    
    /**获取列表**/
    getArticleList : function(folderId, pageNo) {
      var defer = $q.defer();
        $http({
          method: "post",
          url: $rootScope.baseUrl + "/article/getListByPage",
          params: {'pageNo':pageNo,'folderId':folderId},
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
          },
          //cache: $rootScope.useCache
        }).success(function(data){
          //console.log(data.result);
          defer.resolve(data.result);
        }).error(function(err){
          console.log("fail to http POST article/getListByPage");
          defer.reject(err);
        });     
      return defer.promise;
    },
    /** 获取详细内容 **/
    getArticle :function(){
      var defer = $q.defer();
      $http({
        method: "post",
        url: $rootScope.baseUrl + "/article/getById",
        params: {'id':$stateParams.articleId},
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        //cache: $rootScope.useCache
       }).success(function (data) {
        defer.resolve(data.result);
       }).error(function (err) {
        console.log("fail to http POST article/getById");
        defer.reject(err);
       });
     return defer.promise;
    },
    /** 搜索 **/
    search : function(val, path){
      var defer = $q.defer();
      $http({
        method: "post",
        url: $rootScope.baseUrl + "/article/search",
        params: {'val':val,'path':path},
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).success(function (data) {
        defer.resolve(data.result);
      }).error(function (err) {
        console.log("fail to http POST article/search");
        defer.reject(err);
      });
     return defer.promise;
    }
  };  
  return service;
});
