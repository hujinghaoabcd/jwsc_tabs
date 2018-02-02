angular.module('starter.controllers', [])

/**
 * 控制tab模块
 */
.controller('TabCtrl',function($scope){

  $scope.onFolderSelect = function(index){

  }

  $scope.onTabDeselected = function(){
    //console.log(this);
    //window.location.reload(true);
  }

  $scope.onLawsSelect = function(index){
    //$ionicTabsDelegate.select(index);
  }

})

/**
 * 控制最新模块
 */
.controller('NewestCtrl',function($scope,ArticleServiceForLocal){

    /**
     * 获取最新文章列表
     */
    $scope.getNewestArticle = function(){
      ArticleServiceForLocal.getNewestList().then(function(data){
        $scope.articles = data;
      })
    }
    $scope.getNewestArticle();

    /**
     * 搜索数据
     */
    function search(){
      console.log("search data...");
      ArticleServiceForLocal.search($scope.searchData.query).then(function(data){
        $scope.articles = data;
        $scope.searchFlag = true;
      })
    }

    /**
     * 下拉刷新
     */
    $scope.doRefresh = function(){
      console.log($scope.searchFlag);
      if ($scope.searchFlag) {
        search();
        $scope.$broadcast('scroll.refreshComplete');
        return;
      }
      $scope.noMoreAvailable = false;
      $scope.getNewestArticle();

      $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.searchData = {'query':''};

    /**
     * 搜索按钮
     * @param $event
     */
    $scope.searchButton = function($event){
      if($scope.searchData.query == undefined || $scope.searchData.query == ''){
        $scope.searchFlag = false;
        $scope.getNewestArticle();
        return;
      }
      if ($event.keyCode !== 13) {//非搜索按钮，则返回
        return;
      };
      search();
    }

    $scope.isCleanButton = false;
    /**
     * 获取焦点
     */
    $scope.focus = function(){
      $scope.isCleanButton = true;
      $scope.searchFlag = false;
    };

    $scope.onblur = function(){
    };

    $scope.clearSearch = function(){
      $scope.isCleanButton = false;
      //$scope.islastFolder = false;
      $scope.searchFlag = false;
      $scope.searchData.query = "";
      $scope.getNewestArticle();
    };

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      if(toState.url == "/newest" && $scope.isCleanButton == false){
        $scope.getNewestArticle();
        console.log("newest stateChangeSuccess to doRefresh");
      }
    });
})

/**
 * 控制执法手册模块
 */
.controller('FolderCtrl', function($scope, $stateParams, $rootScope, $ionicPlatform, $sce, FolderServiceForLocal, ArticleServiceForLocal) {

  console.log('folderCurrentPage='+ $rootScope.folderCurrentPage);

  $scope.islastFolder = false;
  $scope.noMoreAvailable = false;
  $rootScope.folderCurrentPage = 1;
  var supModule = $stateParams.supModuleName;

  var module = $stateParams.moduleName;
  var subModule = $stateParams.subModuleName;
  $rootScope.supModule = supModule;//用于选择tab的时候返回目录

  $scope.getModule =function(isFirst){
    FolderServiceForLocal.getFolderList(supModule, module, subModule).then(function(data){
      $scope.modules = data;
      if (data.length == 0 && module !== '') {
        $scope.islastFolder = true;
        ArticleServiceForLocal.getArticleList(supModule,module,subModule, $rootScope.folderCurrentPage).then(function(data){
            $scope.articles = data;
            if (data.length == 0) {
              $scope.noMoreAvailable = true;
            }
        },function(){
            $scope.noMoreAvailable = true;
        })
      }
    })
    $scope.isFirst = isFirst;//是否是第一次加载
  };
  $scope.getModule(true);

    /**
     * 搜索
     */
    function search(){
      console.log("search data..")
      ArticleServiceForLocal.search($scope.searchData.query).then(function(data){
        $scope.articles = data;
        $scope.searchFlag = true;
        $scope.islastFolder = true;
      })
    }

  $scope.doRefresh = function(){
    //console.log($scope.searchFlag);
    if ($scope.searchFlag) {
      search();
      $scope.$broadcast('scroll.refreshComplete');
      return;
    };
    $rootScope.folderCurrentPage = 1;
    $scope.noMoreAvailable = false;
    $scope.getModule();

    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.loadMore = function(){
    var currentPage = $rootScope.folderCurrentPage;
    $rootScope.folderCurrentPage =  currentPage + 1;
    ArticleServiceForLocal.getArticleList(supModule,module,subModule, $rootScope.folderCurrentPage).then(function(data){
      $scope.articles = $scope.articles.concat(data);
      if (data.length == 0) {
        $scope.noMoreAvailable = true;
      };
      $scope.$broadcast('scroll.infiniteScrollComplete');
    },function(){
      $scope.noMoreAvailable = true;
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  };

  $scope.searchData = {'query':''};

  /**
   * 搜索按钮
   * @param $event
   */
  $scope.searchButton = function($event){
    if($scope.searchData.query == undefined || $scope.searchData.query == ''){
      $scope.searchFlag = false;
      $scope.islastFolder = false;
      if (subModule !== '') {//最后一级目录，直接加载文章
        $scope.islastFolder = true;

        $rootScope.folderCurrentPage = 1;
        ArticleServiceForLocal.getArticleList(supModule,module,subModule, $rootScope.folderCurrentPage).then(function(data){
            $scope.articles = data;
            if (data.length == 0) {
              $scope.noMoreAvailable = true;
            };
        },function(){
            $scope.noMoreAvailable = true;
        });
        return;
      }
      if (module !== '') {//二级目录
        $rootScope.folderCurrentPage = 1;
        $scope.getModule();
        return;
      }
      return;
    }
    if ($event.keyCode !== 13) {//非搜索按钮，则返回
      return;
    };
    search();
  }

  $scope.isCleanButton = false;
  /**
   * 获取焦点
   */
  $scope.focus = function(){
    $scope.isCleanButton = true;
    $scope.islastFolder = false;
    $scope.searchFlag = false;
  };

  /**
   * 失去焦点
   */
  $scope.onblur = function(){
    //$scope.isCleanButton = false;
    //$scope.searchData.query = "";
  };

  /**
   * 取消搜索按钮
   */
  $scope.clearSearch = function(){
    $scope.isCleanButton = false;
    $scope.islastFolder = false;
    $scope.searchFlag = false;
    $scope.searchData.query = "";
    //$scope.getModule();
    if (subModule !== '') {//最后一级目录，直接加载文章
        $scope.islastFolder = true;

        $rootScope.folderCurrentPage = 1;
        ArticleServiceForLocal.getArticleList(supModule,module,subModule, $rootScope.folderCurrentPage).then(function(data){
            $scope.articles = data;
            if (data.length == 0) {
              $scope.noMoreAvailable = true;
            };
        },function(){
            $scope.noMoreAvailable = true;
        });
        return;
      }
      if (module !== '') {//二级目录
        $rootScope.folderCurrentPage = 1;
        $scope.getModule();
        return;
      }
  };

  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    if($scope.isFirst !== true && toParams.supModuleName == supModule && toParams.moduleName == "" && toParams.subModuleName ==""){
      $scope.getModule(false);
      console.log("foler stateChangeSuccess to doRefresh");
    }
    if($scope.isFirst == true){
      $scope.isFirst = false;
    }
  });
})

/**
  * 转成标准的html格式
  **/
.filter('to_trusted', ['$sce', function($sce){
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}])

.controller('ArticleCtrl', function($scope, $location,$ionicScrollDelegate,$ionicLoading, $ionicPopup, $stateParams,$timeout, ArticleServiceForLocal) {

    //控制滚动视图
    $scope.scrollTo = function (id) {
      //alert(id);
      $location.hash(id);
      var delegateHandle = $ionicScrollDelegate.$getByHandle('articleContent');
      delegateHandle.anchorScroll(true);
    };

  $scope.lastPosition = "";
  $scope.noMoreAvailable = false;

  $scope.showAlert = function() {
     var alertPopup = $ionicPopup.alert({
       title: '网络异常',
       template: '请检查你的网络！'
     });
     alertPopup.then(function(res) {
       //console.log(res);
     });
  };

  /**
   * 服务异常提示页面
   */
  $scope.showServiceAlert = function() {
       var alertPopup = $ionicPopup.alert({
         title: '服务异常',
         template: '服务异常！'
       });
       alertPopup.then(function(res) {
         console.log(res);
       });
  };

  $ionicLoading.show({
      template: "正在加载..."
  });

  ArticleServiceForLocal.getArticle($stateParams.docid,$scope.lastPosition).then(function(data){
    //console.log("doc detail:");
    //console.log(data);
    if(null != data){
      $scope.article = data;
      $scope.lastPosition = data.lastPosition;
      $ionicLoading.hide();
      if ($scope.lastPosition !== -1) {
        $scope.loadMore($stateParams.docid);
      };
    }else{
      $ionicLoading.show({
        template: "该文章已删除，请返回列表。下拉刷新列表！"
      });
      $timeout(function() {
        $ionicLoading.hide();
      }, 2000);
    }
  },function(err){
      if (err == "FAIL") {
        $scope.showServiceAlert();
      }else{
        $scope.showAlert();
      }
      $ionicLoading.hide();
  });

  /**
   * 加载更多
   * @param docid
   */
  $scope.loadMore = function(docid){
    ArticleServiceForLocal.getArticle(docid,$scope.lastPosition).then(function(data){

      $scope.article.tZw += data.tZw;
      $scope.lastPosition = data.lastPosition;
      if ($scope.lastPosition !== -1) {
        $scope.loadMore(docid);
      };
    },function(err){
        if (err == "FAIL") {
          $scope.showServiceAlert();
        }else{
          $scope.showAlert();
        }
        $ionicLoading.hide();
    });
  };
})


.controller('LawsCtrl', function($scope, $stateParams, $rootScope, FolderServiceForLocal, ArticleServiceForLocal) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
    //研究使用方式
  //});

  var supModule = $stateParams.supModuleName;

  var module = $stateParams.moduleName;
  var subModule = $stateParams.subModuleName;

  $scope.islastFolder = false;
  $scope.noMoreAvailable = false;
  $rootScope.lawsCurrentPage = 1;

  /**
   * 加载目录
   */
  $scope.getModule =function(isFirst){
    FolderServiceForLocal.getFolderList(supModule, module, subModule).then(function(data){
      $scope.modules = data;
      //console.log(data);
      //console.log(data.length);
      if (data.length == 0 && module !== '') {
        $scope.islastFolder = true;
        ArticleServiceForLocal.getArticleList(supModule,module,subModule, $rootScope.lawsCurrentPage).then(function(data){
            $scope.articles = data;
            if (data.length == 0 ) {
              $scope.noMoreAvailable = true;
            };
        },function(){
            $scope.noMoreAvailable = true;
        });
      }
    },function(){
      $scope.noMoreAvailable = true;
    })
    $scope.isFirst = isFirst;//是否是第一次加载
  };
  $scope.getModule(true);

    /**
     * 搜索
     */
    function search(){
      console.log("search data...");
      ArticleServiceForLocal.search($scope.searchData.query).then(function(data){
        $scope.articles = data;
        $scope.searchFlag = true;
        $scope.islastFolder = true;
      });
    }
  /**
   * 下拉刷新
   */
  $scope.doRefresh = function(){
    if ($scope.searchFlag) {
      //$scope.noMoreAvailable = true;
      search();
      $scope.$broadcast('scroll.refreshComplete');
      return;
    };
    $rootScope.lawsCurrentPage = 1;
    $scope.noMoreAvailable = false;
    $scope.getModule();

    $scope.$broadcast('scroll.refreshComplete');
  };

  /**
   * 加载更多
   */
  $scope.loadMore = function(){
    var currentPage = $rootScope.lawsCurrentPage;
    $rootScope.lawsCurrentPage =  currentPage + 1;
    ArticleServiceForLocal.getArticleList(supModule,module,subModule, $rootScope.lawsCurrentPage).then(function(data){
      $scope.articles = $scope.articles.concat(data);
      if (data.length == 0) {
        $scope.noMoreAvailable = true;
      };
      $scope.$broadcast('scroll.infiniteScrollComplete');
    },function(){
      $scope.noMoreAvailable = true;
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  };

  /**
   * 搜索参数
   * @type {{query: string}}
   */
  $scope.searchData = {'query':''};

  /**
   * 搜索
   * @param $event
   */
  $scope.searchButton = function($event){
    if($scope.searchData.query == undefined || $scope.searchData.query == ''){
      $scope.searchFlag = false;
      $scope.islastFolder = false;
      if (subModule !== '') {//最后一级目录，直接加载文章
        $scope.islastFolder = true;
        $rootScope.lawsCurrentPage = 1;
        ArticleServiceForLocal.getArticleList(supModule,module,subModule, $rootScope.lawsCurrentPage).then(function(data){
            $scope.articles = data;
            if (data.length == 0) {
              $scope.noMoreAvailable = true;
            };
        },function(){
            $scope.noMoreAvailable = true;
        });
        return;
      }
      if (module !== '') {//二级目录
        $rootScope.lawsCurrentPage = 1;
        $scope.getModule();
        return;
      }
      return;
    }
    if ($event.keyCode !== 13) {//非搜索按钮，则返回
      return;
    }
    search();
  }

  $scope.isCleanButton = false;
  /**
   * 获取输入框
   */
  $scope.focus = function(){
    $scope.isCleanButton = true;
    $scope.islastFolder = false;
    $scope.searchFlag = false;
  }

  /**
   * 失去焦点时发生
   */
  $scope.onblur = function(){

  }

  /**
   * 取消搜索
   */
  $scope.clearSearch = function(){
    $scope.isCleanButton = false;

    $scope.searchFlag = false;
    $scope.searchData.query = "";
    if (subModule !== '') {//最后一级目录，直接加载文章
        $scope.islastFolder = true;
        $rootScope.lawsCurrentPage = 1;
        ArticleServiceForLocal.getArticleList(supModule,module,subModule, $rootScope.lawsCurrentPage).then(function(data){
            $scope.articles = data;
            if (data.length == 0) {
              $scope.noMoreAvailable = true;
            };
        },function(){
            $scope.noMoreAvailable = true;
        });
        return;
    }
    if (module !== '') {//二级目录
      $rootScope.lawsCurrentPage = 1;
      $scope.getModule();
      return;
    }
    $scope.islastFolder = false;
  };

  /**
   * 监听标签切换
   */
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    //console.log("laws stateChangeSuccess");
    if($scope.isFirst !== true && toParams.supModuleName ==supModule && toParams.moduleName == "" && toParams.subModuleName ==""){
      $scope.getModule();
      console.log("laws stateChangeSuccess to doRefresh");
    }
    if($scope.isFirst == true ){
      $scope.isFirst = false;
    }
  })
})

.controller('AccountCtrl', function($scope,$rootScope, $ionicPopup, $ionicLoading,
                                    $ionicPopover, $timeout,DBA,FolderService,ArticleService,UpdateService,LogsService,appConfig) {

  $scope.useCache = $rootScope.useCache;
  $scope.versionName = $rootScope.versionName;
  //console.log("$rootScope.updateCount:" + $rootScope.updateCount);

  /**
   * 清除缓存按钮
   */
  $scope.clean = function(){
     var myPopup = $ionicPopup.show({
      template: '正在清除缓存...',
      title: '<b>清除缓存</b>'
    });
    myPopup.then(function(res) {
      console.log('clean!');
      window.localStorage.clear();
    });
    $timeout(function() {
      myPopup.close(); //close the popup after 3 seconds for some reason
    }, 3000);
  };

  //页面显示年份
  $scope.now = new Date();
  // .fromTemplate() method
  var template = '<ion-popover-view style="height: 50px"><ion-content><ion-list><ion-item>邮箱：vip@bxsoft.cn</ion-item></ion-list></ion-content></ion-popover-view>';

  $scope.popover = $ionicPopover.fromTemplate(template, {
    scope: $scope
  });

  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };

  $scope.closePopover = function() {
    $scope.popover.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });

  /**
   * 退出提示
   */
  function confirmPopup(){
    var confirmPopup = $ionicPopup.confirm({
        title: '<strong>退出应用</strong>',
        template: '你确定要退出应用吗？',
        okText: '退出',
        cancelText: '取消'
    });
    confirmPopup.then(function (res) {
        if (res) {
            ionic.Platform.exitApp();
        }
    });
  }

  /**退出按钮**/
  $scope.logout = function() {
    //ionic.Platform.exitApp();
    confirmPopup();
  };

  /**
   * 添加或更新目录
   * @param moduleData
   */
  function addOrUpdateModuleName(moduleData){
    var insertSql = "replace INTO moduleName (id, moduleid, supModuleName, moduleName, subModuleName) VALUES (?,?,?,?,?)";
    var parameters = [moduleData.id,moduleData.moduleid,moduleData.supModuleName,moduleData.moduleName,moduleData.subModuleName];
    DBA.executeSql(insertSql,parameters);
  }

  /**
   * 去除html标签
   * @param htmlStr
   * @returns {*}
   */
  function replaceHtml(htmlStr){
    var zw_remove_html = htmlStr.replace(/<[^>]+>/g,"");//去掉所有的html标记
    zw_remove_html = zw_remove_html.replace(/(^\s*)|(\s*$)/g, ""); // 去除空格
    zw_remove_html = zw_remove_html.replace(/&nbsp;/ig, "");//去除&nbsp
    zw_remove_html = zw_remove_html.replace(/(\n)+|(\r\n)+/g, "");//去除换行

    return zw_remove_html;
  }

  /**获取所有目录和文章**/
  function getAllModuleAndDocList(suplm,module,sublm){

    $ionicLoading.show({
      template: "正在同步..."
    });
    FolderService.getFolderList(suplm,module,sublm,true).then(function(data){
      //console.log(data);
      $ionicLoading.show({
        template: "正在同步..."
      });
      if (data != undefined && data.length != undefined && data.length > 0) {
        angular.forEach(data, function(moduleData){
          $ionicLoading.show({
            template: "正在同步..."
          });
          //插入SQLite
          addOrUpdateModuleName(moduleData);
          //遍历下一个目录
          getAllModuleAndDocList(moduleData.supModuleName,moduleData.moduleName,moduleData.subModuleName);
        })
      }else{
          $ionicLoading.show({
            template: "正在同步..."
          });
          //获取文章列表
          var pageNo = 2001;//获取分类下所有文章列表，通过后台判断pageNo > 2000 来实现
          ArticleService.getArticleList(suplm,module,sublm, pageNo, true).then(function(data){
            //console.log(data);
            $ionicLoading.show({
              template: "正在同步..."
            });
            if (data.length != undefined && data.length > 0) {
              var len = data.length;
              var i = 0;
              angular.forEach(data, function(docData){
                $ionicLoading.show({
                  template: "正在同步..."
                });
                var lastPosition = -2;//获取文章详情，通过后台判断lastPosition=-2时不进行分段加载
                ArticleService.getArticle(docData.docid,lastPosition,true).then(function(data1){

                  $rootScope.updateCount = $rootScope.updateCount-1;
                  //console.log($rootScope.updateCount);
                  $rootScope.allCount = $rootScope.allCount + 1;
                  //console.log("---------------------");
                  //显示进度
                  i++;
                  var downloadProgress = Math.round((i / len) * 100);
                  var showText = suplm + "/" + module;
                  if (sublm !== '') {
                    showText += "/" + sublm;
                  };
                  showText += "，已同步" + downloadProgress + "%";
                  //console.log(showText);
                  $ionicLoading.show({
                    template:  showText
                  });

                  //去除html标签 存入字段
                  var zw_remove_html = replaceHtml(data1.tZw);
                  //console.log(zw_remove_html);
                  var insertSql = "replace INTO doc (docid, lmId, suplm,lm,sublm,tBt,tZw,zwText,tDate,updateTime) VALUES (?,?,?,?,?,?,?,?,?,?)";
                  var parameters = [docData.docid,docData.lmId,docData.suplm,docData.lm,docData.sublm,docData.tBt,data1.tZw,zw_remove_html,docData.tDate,data1.updateTime];
                  DBA.executeSql(insertSql,parameters);

                  //隐藏
                  if(downloadProgress > 99) {
                    $ionicLoading.hide();
                  }
                },function(err){
                  console.log("fail to update doc");
                  $ionicLoading.show({
                    template: "同步失败，请检查网络"
                  });
                  $timeout(function() {
                    $ionicLoading.hide();
                  }, 1000);
                })
              });
            }
        },function(err){
          console.log("fail to update doclist");
          $ionicLoading.show({
              template: "同步失败，请检查网络"
          });
          $timeout(function() {
            $ionicLoading.hide();
          }, 1000);
        });
      }
    },function(err){
      console.log("fail to update module");
      console.log(err);
      $rootScope.updateCount = "x400";
      $ionicLoading.show({
        template: "同步失败，请检查网络"
      });
      $timeout(function() {
        $ionicLoading.hide();
      }, 1000);
    });
  }

    /**
     * 插入日志表doc_log
     * @param docLog
     */
    function insertDocLog(docLog){
      if(undefined == docLog){
        //doc_log. lastId=""表示取最新文章日志
        var lastId = "";
        UpdateService.updateCheck(lastId).then(function(result){
          //插入doc_log  同步多个日志
          var insertSql = "insert into doc_log(id,docid,acttype,acttime) values (?,?,?,?)";
          var parameters;
          angular.forEach(result,function(docLogResult){
            parameters = [docLogResult.id,docLogResult.docid,docLogResult.acttype,docLogResult.acttime];
            //console.log(parameters);
            DBA.executeSql(insertSql,parameters);
          })
        })
      }else{
        //插入doc_log表
        var insertSql = "insert into doc_log(id,docid,acttype,acttime) values (?,?,?,?)";
        var parameters = [docLog.id,docLog.docid,docLog.acttype,docLog.acttime];
        DBA.executeSql(insertSql,parameters).then(function(result){
          console.log("success to insert doc_log")
        },function(err){
          console.log("fail to insert doc_log");
        })
      }
    }

    /**
     * 删除文档
     * @param docid 删除文章
     */
    function delDoc(docId,docLog,i,len){
      //显示进度
      var downloadProgress = Math.round((i / len) * 100);
      var showText = "共" + len + "个更新";

      showText += "，已同步" + downloadProgress + "%";
      $ionicLoading.show({
        template:  showText
      });

      var delSql = "delete from doc where docid = ?";
      var parameters = [docId];
      DBA.executeSql(delSql,parameters).then(function(result){
        //插入doc_log表
        var insertSql = "insert into doc_log(id,docid,acttype,acttime) values (?,?,?,?)";
        var parameters = [docLog.id,docLog.docid,docLog.acttype,docLog.acttime];
        DBA.executeSql(insertSql,parameters).then(function(result){
          //console.log("插入doclog成功")
        },function(err){
          console.log("插入doclog失败");
        })
        $rootScope.allCount = $rootScope.allCount - 1;
      },function(err){
        console.log(err);
        $ionicLoading.show({
          template: "更新失败"
        });
      })
    }

    /**
     * 新增或更新文档
     * @param docId 文档
     * @param i 第几篇
     * @param len 更新总数
     */
    function addOrUpdateDoc(docId,i,len){
      var lastPosition = -2;//获取文章详情，通过后台判断lastPosition=-2时不进行分段加载
      ArticleService.getArticle(docId,lastPosition,true).then(function(data1){

        //显示进度
        var downloadProgress = Math.round((i / len) * 100);
        var showText = "共" + len + "个更新";

        showText += "，已同步" + downloadProgress + "%";
        $ionicLoading.show({
          template:  showText
        });

        var insertSql = "replace INTO doc (docid, lmId, suplm,lm,sublm,tBt,tZw,zwText,tDate,updateTime) VALUES (?,?,?,?,?,?,?,?,?,?)";
        //去除html标签 存入字段
        var zw_remove_html = replaceHtml(data1.tZw);
        //console.log(zw_remove_html);
        var parameters = [data1.docid,data1.lmId,data1.suplm,data1.lm,data1.sublm,data1.tBt,data1.tZw,zw_remove_html,data1.tDate,data1.updateTime];
        DBA.executeSql(insertSql,parameters);

        //隐藏
        if(downloadProgress > 99){
          if(i == len){
            $timeout(function() {
              $ionicLoading.hide();
            }, 1000);
          }else{
            $ionicLoading.hide();
          }
        }
      },function(err){
        console.log("fail to update doc");
        $ionicLoading.show({
          template: "同步失败，请检查网络"
        });
        $timeout(function() {
          $ionicLoading.hide();
        }, 1000);
      })
    }

  /**同步云端数据按钮**/
  $scope.downloadData = function() {
    $ionicLoading.show({
      template: "正在同步..."
    });
    console.log($rootScope.updateCount);
    var sql = "select max(id) as id from doc_log";
    DBA.executeSql(sql).then(function(result){
      var lastId = DBA.getById(result).id;
      if(lastId !== null){
        // 查询doc_log
        UpdateService.updateCheck(lastId).then(function(result){
          console.log("updateCheck result:");
          console.log(result);
          if(result != undefined && result.length != undefined && result.length > 0){
            //获取更新的
            var i = 0;
            var len = result.length;
            angular.forEach(result, function(docLog){
              var docId = docLog.docid;
              $rootScope.updateCount = $rootScope.updateCount-1;//待更新数量
              if(docLog.acttype == 'del'){//删除
                i++;
                delDoc(docId,docLog,i,len);
                if(i == len){
                  $timeout(function() {
                    $ionicLoading.hide();
                  }, 1000);
                }else{
                  $ionicLoading.hide();
                }
              }else if(docLog.acttype == 'add'){//添加文章
                i++;
                addOrUpdateDoc(docId,i,len);
                insertDocLog(docLog);
                $rootScope.allCount = $rootScope.allCount + 1;//所有文章数量

              }else{
                //更新
                i++;
                addOrUpdateDoc(docId,i,len);
                insertDocLog(docLog);
                $rootScope.allCount = $rootScope.allCount ;//文章数量不变
              }
            })
          }else{
            $rootScope.updateCount = 0;
            $ionicLoading.show({
              template: "现在网络上没有新数据，不需同步"
            });
            $timeout(function() {
              $ionicLoading.hide();
            }, 1000);
          }
        },function(err){
          console.log(err);
          $rootScope.updateCount = "x400";
          $ionicLoading.show({
            template: "同步失败，请检查网络"
          });
          $timeout(function() {
            $ionicLoading.hide();
          }, 1000);
        })
      }else{
        //获取所有目录和文章
        getAllModuleAndDocList('执法工作手册','','');
        getAllModuleAndDocList('常用法律法规','','');
        insertDocLog();
      }
    })
    //send log
    LogsService.getSyncLogList().then(function(result){
      console.log(result);
      angular.forEach(result,function(log){
        LogsService.sendLog($rootScope.myIMEI,log.operate_type,log.operate_content,log.create_time).then(function(result){
          LogsService.updateLog(log.id);
        },function(err){
          console.log("fail to send log.id=" + log.id);
        })
      })
    });
  };

  $scope.update = function() {
    //TODO 需联调测试app更新
    var serverVersion = "";
    var updateContext = "版本有更新";
    var apkFilePath = appConfig.url + "/resources/apk/jwsc.apk";

    var updatePopup = $ionicPopup.show({
      template: '正在检查...',
      title: '检查版本'
    });

    updatePopup.then(function(res) {
      UpdateService.updateApp().then(function(data){
        console.log("request update interface response data:");
        console.log(data);
        if (data.totalCount == 1) {
          serverVersion = data.content.packageVersion;//应用版本号
          apkFilePath = data.content.pkgFilePath;//更新地址
          updateContext = data.content.packageDesc;//应用描述
        };
      },function(err){
        console.log("request update interface error:");
        console.log(err);
      });
      if (serverVersion == "" || $rootScope.versionName == serverVersion) {
        $ionicLoading.show({
          template: "当前是最新版本"
        });
        console.log('update!'+ res);
        updatePopup.close();
        $timeout(function() {
          $ionicLoading.hide();
        }, 1000);
      }else{
        updatePopup.close();
        UpdateService.popupUpdateView(apkFilePath,updateContext);
      }
    });
    $timeout(function() {
      updatePopup.close(); //close the popup after 3 seconds for some reason
    }, 3000);
  };

    /**
     * 检查服务器是否有新增文章
     */
    function checkServerDataUpdate(){
      var sql = "select max(id) as id from doc_log";
      DBA.executeSql(sql).then(function(result){
        var lastId = DBA.getById(result).id;;
        if(lastId == null){
          lastId = "";
        }
        UpdateService.updateCheck(lastId).then(function(result){
          //console.log("updateCheck result:");
          //console.log(result.length);
          //TODO 统计有多少新增，更新、删除
          if(result != undefined && result.length != undefined && result.length > 0){
            $rootScope.updateCount = result.length;
          }else{
            $rootScope.updateCount = 0;
          }
        },function(err){
          console.log(err);
          $rootScope.updateCount = "x400";
        })
      })
    }
    /**
     * 选择设置tab
     */
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      if(toState.url == "/account"){
        if($rootScope.allCount > 0){
          checkServerDataUpdate();
          console.log("account stateChangeSuccess to doRefresh");
        }
      }
    });
})

.controller('InterfaceCtrl',function($scope,$http,$location,$ionicScrollDelegate,$ionicLoading,$rootScope,FolderService,ArticleService,LogsService,UpdateService,appConfig){

    //控制滚动视图
    $scope.scrollTo = function (id) {
      //alert(id);
      $location.hash(id);
      var delegateHandle = $ionicScrollDelegate.$getByHandle('myContent');
      delegateHandle.anchorScroll(true);
    };

  $scope.getModule = function(){
    $scope.requestUrl = appConfig.url + "/module";
    $scope.requestParams = "supModule=执法工作手册"
    FolderService.getFolderList("执法工作手册", "", "",true).then(function(data){
      $scope.result = data;
      $scope.status = data.status;
      $scope.errorMsg = data.message;
      console.log("modulesData=" + data);
      //$scope.hide();
    },function(err){
      $scope.result = err;
    });
  };

  $scope.getArticleList = function(){
    //$ionicTabsDelegate.select(index);
    $scope.requestUrl = appConfig.url + "/doclist";
    $scope.requestParams = "supLm=执法工作手册，lm=社区民警执法手册，subLm=''，pageNo=1";
    $http({
          method: "post",
          url: appConfig.url + "/doclist",
          params: {'pageNo':1,'supLm':"执法工作手册", 'lm':"社区民警执法手册", 'subLm':""},
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'appId': appConfig.appId
          },
          cache: $rootScope.useCache
        }).success(function(data){
          $scope.result = data;
            $scope.status = data.status;
            $scope.errorMsg = data.message;
          //console.log(data.result);
          //defer.resolve(data.result);
        }).error(function(err){
          $scope.result = err;
          console.log("fail to http POST doclist");
          //defer.reject(err);
        });
  };

  $scope.getDoc = function(){
    //$ionicTabsDelegate.select(index);
    $scope.requestUrl = appConfig.url + "/doc";
    $scope.requestParams = "id=4164，deviceId='test',lastPosition=''"
    $http({
        method: "post",
        url: appConfig.url + "/doc",
        params: {'id':4164,'deviceId':'test','lastPosition':""},
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'appId': appConfig.appId
        }
       }).success(function (data) {
        if (data.status == "FAIL") {
          console.log("doc service return error code: "+ data.status);
          //defer.reject(data.status);
        }else{
          $scope.result = data;
          $scope.status = data.status;
          $scope.errorMsg = data.message;
          //defer.resolve(data.result);
        }
       }).error(function (err) {
        $scope.result = err;
        console.log("fail to http POST doc");
        //defer.reject(err);
       });
  };

  $scope.savelog = function(){
    //$ionicTabsDelegate.select(index);
    $scope.requestUrl = appConfig.url + "/log";
    $scope.requestParams = "deviceId=testInterface"
    LogsService.addLogin("testInterface").then(function(data){
        $scope.result = data;
        $scope.status = data.status;
        $scope.errorMsg = data.message;
        console.log("logs=" + data);

            //$scope.hide();
        },function(err){
            $scope.result = err;
    });
  };

  $scope.testSearch = function(){
    //$ionicTabsDelegate.select(index);
    $scope.requestUrl = appConfig.url + "/search";
    $scope.requestParams = "val=执法"
    ArticleService.search("执法").then(function(data){

      $scope.result = data;
      $scope.status = data.status;
      $scope.errorMsg = data.message;
      console.log(data);
    },function(err){
      $scope.result = err;
    });
  };

  $scope.testUpdate = function(){
    $ionicLoading.show({
        template: "正在连接..."
    });
    //$ionicTabsDelegate.select(index);
    $scope.requestUrl = appConfig.url + "/update";
    $scope.requestParams = "version=" + $rootScope.versionName;
    UpdateService.updateApp().then(function(data){

      $scope.result = data;
      $scope.status = data.status;
      $scope.errorMsg = data.message;
      console.log(data.name);
      $ionicLoading.hide();
    },function(err){
      $scope.result = err;
      $ionicLoading.hide();
    });
  };
});
