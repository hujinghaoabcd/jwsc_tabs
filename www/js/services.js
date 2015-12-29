angular.module('starter.services', [])

/**数据库操作**/
.factory('DBA', function($cordovaSQLite, $q, $ionicPlatform) {
  var self = this;

  // Handle query's and potential errors
  self.executeSql = function (sql, parameters) {
    parameters = parameters || [];
    var q = $q.defer();

    $ionicPlatform.ready(function () {
      $cordovaSQLite.execute(db, sql, parameters)
        .then(function (result) {
          q.resolve(result);
        }, function (error) {
          console.warn('I found an error');
          console.warn(error);
          q.reject(error);
        });
    });
    return q.promise;
  }

  // Proces a result set
  self.getAll = function(result) {
    var output = [];

    for (var i = 0; i < result.rows.length; i++) {
      output.push(result.rows.item(i));
    }
    return output;
  }

  // Proces a single result
  self.getById = function(result) {
    var output = null;
    if(result.rows.length > 0){
      output = angular.copy(result.rows.item(0));
    }
    return output;
  }

  return self;
})

/**目录service**/
.factory('FolderService',function($q, $http,$rootScope,$stateParams,DBA,appConfig){

  return {
    /**获取分类列表**/
    getFolderList : function(supModule, module, subModule, isSysn) {

      var defer = $q.defer();
        $http({
          method: "post",
          url: appConfig.url + "/module",
          params: {'supModule':supModule,'module':module,'subModule':subModule},
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'appId': appConfig.appId
          },
          cache: $rootScope.useCache
        }).success(function(data){
          //console.log(data.result);
          if(data.status == 'FAIL'){//后台返回FAIL
            defer.reject(data.status);
          }else{
            defer.resolve(data.result);
          }
        }).error(function(err){
          if (isSysn == true) {//同步时直接返回
            defer.reject(err);
          }else{
            console.log("fail to http POST module, start get data by local db");
            //网络获取失败，从本地获取数据

            console.log(supModule + "|" + module + "|" + subModule);
            if (supModule != '' && module !== '' && subModule != '') {
              defer.resolve([]);
            }else{
              var selectSql = "select id, moduleid, supModuleName, moduleName, subModuleName from moduleName where supModuleName = ? ";
              var parameters = [supModule];

              if (supModule != '' && module !== '' && subModule == '') {
                selectSql += " and moduleName = ? and subModuleName !=''";
                parameters.push(module);
              }
              else if (supModule != '' && module === '') {
                selectSql += " and moduleName != '' and subModuleName =''";
              };
              //console.log(selectSql);
              //console.log(parameters);
              DBA.executeSql(selectSql,parameters).then(function(result){
                //console.log(result);
                defer.resolve(DBA.getAll(result));
              },function(err){
                console.log("DBA err");
                defer.reject(err);
              })
            }
          }

        });
      return defer.promise;
    }
  };
})

  /** 查询本地数据库**/
  .factory('FolderServiceForLocal',function($q, $http,$rootScope,$stateParams,DBA){
    return{
      /**获取本地分类列表**/
      getFolderList : function(supModule, module, subModule) {
        console.log("start get data by local. " + supModule + "|" + module + "|" + subModule);

        var defer = $q.defer();
        if (supModule != '' && module !== '' && subModule != '') {
          defer.resolve([]);
        }else{
          var selectSql = "select id, moduleid, supModuleName, moduleName, subModuleName from moduleName where supModuleName = ? ";
          var parameters = [supModule];

          if (supModule != '' && module !== '' && subModule == '') {
            selectSql += " and moduleName = ? and subModuleName !=''";
            parameters.push(module);
          }
          else if (supModule != '' && module === '') {
            selectSql += " and moduleName != '' and subModuleName =''";
          };
          //console.log(selectSql);
          //console.log(parameters);
          DBA.executeSql(selectSql,parameters).then(function(result){
            //console.log(result);
            defer.resolve(DBA.getAll(result));
          },function(err){
            console.log("DBA err");
            defer.reject(err);
          })
        }
        return defer.promise;
      }
    }
  })

  /** 本地文章service**/
  .factory('ArticleServiceForLocal',function($q, $http,$rootScope,$stateParams,DBA,appConfig){
    var service = {    // our factory definition

      /**
       * 获取最新文章
       */
      getNewestList : function(){
        var defer = $q.defer();

        var returnDocList;
        var docLogList;
        var docLogSql = "select distinct docid from doc_log where acttype !='del' order by acttime limit ? offset 0";
        var params = [appConfig.newListNum];
        DBA.executeSql(docLogSql,params).then(function(result){
          //console.log(result);
          docLogList = DBA.getAll(result);
          if(docLogList.length > 0){
            var docids = "";
            angular.forEach(docLogList,function(doc){
              docids += doc.docid + ",";
            })
            docids = docids.substr(0,docids.length - 1);
            var fromDocLogSql = "select docid, lmId, suplm, lm, sublm, tBt, tDate from doc where docid in (" + docids+")";
            DBA.executeSql(fromDocLogSql).then(function(result){
              //console.log(result);
              returnDocList = DBA.getAll(result);
              var size = appConfig.newListNum - returnDocList.length;

              var selectSql = "select docid, lmId, suplm, lm, sublm, tBt, tDate from doc where docid not in ("+ docids +") order by docid desc limit ? offset 0"
              var parameters = [size];

              DBA.executeSql(selectSql,parameters).then(function(result){
                if(returnDocList.length == 0){
                  returnDocList = DBA.getAll(result);
                }else{
                  var out = DBA.getAll(result);
                  returnDocList.concat(out);
                  console.log(returnDocList);
                }
                defer.resolve(returnDocList);
              },function(err){
                console.log("select doc DBA err");
                defer.reject(err);
              });
            },function(err){
              defer.reject(err);
              console.log("select doc by docids" + docids);
            });
          }else{
            //doc_log为空
            var selectSql = "select docid, lmId, suplm, lm, sublm, tBt, tDate from doc order by docid desc limit ? offset 0"
            var parameters = [appConfig.newListNum];

            DBA.executeSql(selectSql,parameters).then(function(result){
              returnDocList = DBA.getAll(result);
              defer.resolve(returnDocList);
            },function(err){
              console.log("select doc DBA err");
              defer.reject(err);
            });
          }
        },function(err){
          console.log("select doc_log DBA err");
          defer.reject(err);
        });

        return defer.promise;
      },
      /**获取列表**/
      getArticleList : function(supLm, lm, subLm, pageNo) {
        var defer = $q.defer();
        console.log("start get data by local");

        var selectSql = "select docid, lmId, suplm, lm, sublm, tBt, tDate from doc where suplm = ?"
        var parameters = [supLm];

        var size = 10;//size:每页显示条数，index页码
        var start = 0;
        if(pageNo > 1){
          start = size * (pageNo -1) + 1;
        }
        if (subLm !=='') {
          selectSql += " and lm = ? and sublm = ?";
          parameters.push(lm);
          parameters.push(subLm);
        }
        else {
          selectSql += " and lm = ? and sublm = ''";
          parameters.push(lm);
        };

        parameters.push(size);
        parameters.push(start);
        selectSql += " order by tDate desc limit ? offset ?";//offset代表从第几条记录“之后“开始查询，limit表明查询多少条结果

        //console.log(selectSql);
        //console.log(parameters);
        DBA.executeSql(selectSql,parameters).then(function(result){
          //console.log(result);
          defer.resolve(DBA.getAll(result));
        },function(err){
          console.log("DBA err");
          defer.reject(err);
        });
        return defer.promise;
      },
      /** 获取详细内容 **/
      getArticle :function(docid){
        //console.log(docid)
        var defer = $q.defer();
        console.log("start get data by local");

        var selectSql = "select docid, lmId, suplm, lm, sublm, tBt, tZw, tDate from doc where  docid = ?";
        var parameters = [docid];

        //console.log(selectSql);
        //console.log(parameters);
        DBA.executeSql(selectSql,parameters).then(function(result){
          //console.log(result);
          var resultObj = DBA.getById(result);
          if(null != resultObj){
            resultObj['lastPosition'] = -1;
          }

          defer.resolve(resultObj);
        },function(err){
          console.log("DBA err");
          defer.reject(err);
        });
        return defer.promise;
      },

      /** 搜索 **/
      search : function(val){
        var defer = $q.defer();

        console.log("start get data by local");

        var selectSql = "select docid, lmId, suplm, lm, sublm, tBt, zwText, tDate from doc where zwText like ?";

        var parameters = ["%" + val + "%"];
        DBA.executeSql(selectSql,parameters).then(function(result){
          //处理副标题tm字段
          var output = [];
          var highlighter = "<span style=\"color:red;\">" + val+ "</span>";
          for (var i = 0; i < result.rows.length; i++) {
            //console.log(result.rows.item(i));
            var temp = result.rows.item(i);
            //console.log(temp.zwText);
            var index = temp.zwText.indexOf(val);
            var lm = temp.zwText.substring(index - 50, index + 100);//截取一段字符
            temp.lm = lm.replace(val,highlighter);
            //console.log(temp);
            output.push(temp);
          }

          defer.resolve(output);
        },function(err){
          console.log("DBA err");
          defer.reject(err);
        });

        return defer.promise;
      }
    };
    return service;
  })

/**文章service**/
.factory('ArticleService',function($q, $http,$rootScope,$stateParams,DBA,appConfig){

  var service = {    // our factory definition

    /**获取列表**/
    getArticleList : function(supLm, lm, subLm, pageNo, isSysn) {
      var defer = $q.defer();
        $http({
          method: "post",
          url: appConfig.url + "/doclist",
          params: {'pageNo':pageNo,'supLm':supLm, 'lm':lm, 'subLm':subLm},
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'appId': appConfig.appId
          },
          cache: $rootScope.useCache
        }).success(function(data){
          //console.log(data.result);
          if(data.status == 'FAIL'){//后台返回FAIL
            defer.reject(data.status);
          }else{
            defer.resolve(data.result);
          }
        }).error(function(err){
          if (isSysn == true) {//同步时直接返回
            defer.reject(err);
          }else{
            console.log("fail to http POST doclist, start get data by local");

            var selectSql = "select docid, lmId, suplm, lm, sublm, tBt, tDate from doc where suplm = ?"
            var parameters = [supLm];

            var size = 10;//size:每页显示条数，index页码
            var start = 0;
            if(pageNo > 1){
              start = size * (pageNo -1) + 1;
            }
            if (subLm !=='') {
              selectSql += " and lm = ? and sublm = ?";
              parameters.push(lm);
              parameters.push(subLm);
            }
            else {
              selectSql += " and lm = ? and sublm = ''";
              parameters.push(lm);
            };

            parameters.push(size);
            parameters.push(start);
            selectSql += " order by tDate desc limit ? offset ?";//offset代表从第几条记录“之后“开始查询，limit表明查询多少条结果

            //console.log(selectSql);
            //console.log(parameters);
            DBA.executeSql(selectSql,parameters).then(function(result){
              //console.log(result);
              defer.resolve(DBA.getAll(result));
            },function(err){
              console.log("DBA err");
              defer.reject(err);
            });
          }
        });
      return defer.promise;
    },
    /** 获取详细内容 **/
    getArticle :function(docid,lastPosition, isSysn){
      //console.log(docid)
      var defer = $q.defer();
      $http({
        method: "post",
        url: appConfig.url + "/doc",
        params: {'id':docid,'deviceId':$rootScope.myIMEI,'lastPosition':lastPosition},
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'appId': appConfig.appId
        },
        cache: $rootScope.useCache
       }).success(function (data) {
        if (data.status == "FAIL") {
          console.log("doc service return error code: "+ data.status);
          defer.reject(data.status);
        }else{
          defer.resolve(data.result);
        }
       }).error(function (err) {
        if (isSysn == true) {//同步时直接返回
            defer.reject(err);
        }else{
          console.log("fail to http POST doc, start get data by local");

          var selectSql = "select docid, lmId, suplm, lm, sublm, tBt, tZw, tDate from doc where  docid = ?";
          var parameters = [docid];

          //console.log(selectSql);
          //console.log(parameters);
          DBA.executeSql(selectSql,parameters).then(function(result){
            //console.log(result);
            var resultObj = DBA.getById(result);
            resultObj['lastPosition'] = -1;

            defer.resolve(resultObj);
          },function(err){
            console.log("DBA err");
            defer.reject(err);
          });
        }
       });
     return defer.promise;
    },

    /** 搜索 **/
    search : function(val){
      var defer = $q.defer();
      $http({
        method: "post",
        url: appConfig.url + "/search",
        params: {'val':val},
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'appId': appConfig.appId
        },
        cache: $rootScope.useCache
      }).success(function (data) {
        if(data.status == 'FAIL'){//后台返回FAIL
          defer.reject(data.status);
        }else{
          defer.resolve(data.result);
        }
      }).error(function (err) {
        console.log("fail to http POST search, start get data by local");

        var selectSql = "select docid, lmId, suplm, lm, sublm, tBt, zwText, tDate from doc where zwText like ?";

        var parameters = ["%" + val + "%"];
        DBA.executeSql(selectSql,parameters).then(function(result){
          //处理副标题tm字段
          var output = [];
          var highlighter = "<span style=\"color:red;\">" + val+ "</span>";
          for (var i = 0; i < result.rows.length; i++) {
            //console.log(result.rows.item(i));
            var temp = result.rows.item(i);
            //console.log(temp.zwText);
            var index = temp.zwText.indexOf(val);
            var lm = temp.zwText.substring(index - 50, index + 100);//截取一段字符
            temp.lm = lm.replace(val,highlighter);
            //console.log(temp);
            output.push(temp);
          }

          defer.resolve(output);
        },function(err){
          console.log("DBA err");
          defer.reject(err);
        });

        //defer.reject(err);
      });
     return defer.promise;
    }
  };
  return service;
})

/**日志service**/
.factory('LogsService',function($q, $http,$rootScope,$stateParams,appConfig){

  return {
    /**添加登录日志**/
    addLogin : function(myIMEI) {
      var defer = $q.defer();
        $http({
          method: "post",
          url: appConfig.url + "/log",
          params: {'deviceId':myIMEI},
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'appId': appConfig.appId
          },
          cache: $rootScope.useCache
        }).success(function (data){
          if(data.status == 'FAIL'){//后台返回FAIL
            defer.reject(data.status);
          }else{
            defer.resolve(data.status);
          }
        }).error(function (err){
          console.log("fail to http POST /log");
          defer.reject(err);
        });
      return defer.promise;
    }
  };
})

/**更新service**/
.factory('UpdateService',function($q, $http,$rootScope,$stateParams,$ionicPopup,$ionicLoading,$timeout,
  $cordovaFileTransfer,$cordovaFileOpener2,appConfig){

  return {
    /**检查文章更新**/
    updateCheck : function(lastId) {
      var defer = $q.defer();
      $http({
        method: "post",
        url: appConfig.url + "/update",
        params: {'lastId':lastId},
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'appId': appConfig.appId
        },
        cache: $rootScope.useCache
      }).success(function (data){
        if(data.status == 'FAIL'){//后台返回FAIL
          defer.reject(data.status);
        }else{
          defer.resolve(data.result);
        }
      }).error(function (err){
        console.log("fail to http POST /update");
        defer.reject(err);
      });
      return defer.promise;
    },
    /**更新APP**/
    updateApp : function() {
      var defer = $q.defer();
        $http({
          method: "post",
          url: appConfig.url + "/AppUpdate",
          params: {'version':$rootScope.versionName},
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'appId': appConfig.appId
          },
          cache: $rootScope.useCache
        }).success(function (data){
          if(data.status == 'FAIL'){//后台返回FAIL
            defer.reject(data.status);
          }else{
            defer.resolve(data.result);
          }
        }).error(function (err){
          console.log("fail to http POST /AppUpdate");
          defer.reject(err);
        });
      return defer.promise;
    },

    /**更新窗口**/
    popupUpdateView : function(apkFilePath,updateContext){
      var confirmPopup = $ionicPopup.confirm({
                title: '版本升级',
                template: updateContext, //从服务端获取更新的内容
                cancelText: '取消',
                okText: '升级'
        });
      confirmPopup.then(function (res) {
          if (res) {
              $ionicLoading.show({
                  template: "已经下载：0%"
              });
              var url = apkFilePath; //可以从服务端获取更新APP的路径
              var targetPath = appConfig.targetPath; //APP下载存放的路径，可以使用cordova file插件进行相关配置
              var trustHosts = true
              var options = {};
              $cordovaFileTransfer.download(url, targetPath, options, trustHosts).then(function (result) {
                  // 打开下载下来的APP
                  $cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive'
                  ).then(function () {
                          // 成功
                          console.log("open apk success");
                      }, function (err) {
                          // 错误
                          console.log("open apk fail");
                      });
                  $ionicLoading.hide();
              }, function (err) {
                  //alert('下载失败');
                  $ionicLoading.show({
                    template: "下载失败"
                  });
                  console.log('update!'+ res);
                    $timeout(function() {
                    $ionicLoading.hide();
                  }, 1000);
              }, function (progress) {
                  //进度，这里使用文字显示下载百分比
                  $timeout(function () {
                      var downloadProgress = (progress.loaded / progress.total) * 100;
                      $ionicLoading.show({
                          template: "已经下载：" + Math.floor(downloadProgress) + "%"
                      });
                      if (downloadProgress > 99) {
                          $ionicLoading.hide();
                      }
                  })
              });
          } else {
              // 取消更新
            console.log("取消更新")
          }
      });
    }
  };
});
