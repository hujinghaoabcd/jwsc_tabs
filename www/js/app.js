// Ionic Starter App
//var baseUrl = "test";
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var db = null;
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services','ngCordova'])
.constant("appConfig", {
        "url": "http://139.196.170.172:8080/cnfj/jwsc/jwscapi",//阿里云后台服务地址
        //"url": "http://192.168.1.107:8080",//本地
        //"url": "http://10.16.163.200:8060/cnfj/jwsc/jwscapi",
        //"url": "http://192.168.1.44:10009/cnfj/jwsc/jwscapi",//警务通
        "appId": "cnfj.jwsc.6259",//appid名字
        "versionName":"2.0.0",//版本
        "dbName":".sh.gaj\\sh.gaj.cnfj.jwsc\\jwsc.db",//数据库路径
        "targetPath":"file:///storage/sdcard0/Download/jwsc_update.apk",//下载文件地址
        "pageSize" : 10,//显示文章列表数量
        "newListNum": 10//最新列表文章数量
})
.run(function($rootScope,$ionicPlatform,$ionicPopup,$log,$ionicLoading,$location,$ionicHistory,$timeout,
  $cordovaFileTransfer, $cordovaFile, $cordovaFileOpener2,$cordovaSQLite,DBA,LogsService,UpdateService,appConfig) {

  //主页面显示退出提示框
  $ionicPlatform.registerBackButtonAction(function (e) {

      e.preventDefault();

      function showConfirm() {
          var confirmPopup = $ionicPopup.confirm({
              title: '<strong>退出应用</strong>',
              template: '你确定要退出应用吗？',
              okText: '退出',
              cancelText: '取消'
          });

          confirmPopup.then(function (res) {
              if (res) {
                  ionic.Platform.exitApp();
              } else {
                  // Don't close
              }
          });
      }

      // Is there a page to go back to?
      //console.log($location.path());
      if ($location.path() == '/tab/' ) {
          //console.log("/tab");
          showConfirm();
      } else if ($ionicHistory.backView()) {
          $ionicHistory.goBack(-1);
      } else {
          // This is the last page: Show confirmation popup
          showConfirm();
      }

      return false;
  }, 101);

  $ionicPlatform.ready(function() {
    $rootScope.folderCurrentPage = 1;
    $rootScope.lawsCurrentPage = 1;
    $rootScope.useCache = false;//是否使用缓存

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

      cordova.getAppVersion.getVersionNumber(function (version) {
        console.log("varsion:" + version);
        setVersionInfo(version);
        if(serverVersion !="" && version != serverVersion){
          updateVersion();//弹出更新窗口
        }
      });

      //$cordovaSQLite.deleteDatabase(appConfig.dbName);
      db = $cordovaSQLite.openDB(appConfig.dbName);
    }else{
      db = window.openDatabase(appConfig.dbName, "1.0", "jwscdb", -1);
    }
    /**
     * 创建表
     */
    function createTable(){
      var createDocTable = "CREATE TABLE IF NOT EXISTS doc (docid integer primary key, lmId integer,suplm varchar(200),lm varchar(512),sublm varchar(50),tBt varchar(512),tZw text, zwText text,tDate varchar(20),updateTime DATETIME)";
      var createModuleTable = "CREATE TABLE IF NOT EXISTS moduleName (id integer primary key, moduleid varchar(50),supModuleName varchar(200),moduleName varchar(200),subModuleName varchar(200))";
      var createDocLogTable = "CREATE TABLE IF NOT EXISTS doc_log(id integer,docid integer,acttype varchar(20),acttime DATETIME)";
      $cordovaSQLite.execute(db,createDocTable);
      $cordovaSQLite.execute(db,createModuleTable);
      $cordovaSQLite.execute(db,createDocLogTable);
    }
    createTable();

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }

    //TODO  获取应用更新信息
    var serverVersion = appConfig.versionName;
    var updateContext = "版本有更新";
    var apkFilePath = appConfig.url + "/resources/apk/jwsc.apk";
    UpdateService.updateApp().then(function(data){
      //console.log("request update interface response data:");
      //console.log(data);
      if (data.totalCount == 1) {
        serverVersion = data.content.packageVersion;//应用版本号
        apkFilePath = data.content.pkgFilePath;//更新地址
        updateContext = data.content.packageDesc;//应用描述
      };
    },function(err){
      console.log("request updateApp interface error");
    });

    //设置全局版本号信息
    function setVersionInfo(ver){
      $rootScope.versionName = ver;
    };

    ionic.Platform.ready(function(){
      // will execute when device is ready, or immediately if the device is already ready.
      //研究使用方式？
    });

    //获取平台信息、手机imei
    var deviceInformation = ionic.Platform.device();
    var myImei = deviceInformation.uuid;
    $rootScope.myIMEI = myImei;
    console.log($rootScope.myIMEI);
    if(undefined == $rootScope.myIMEI){
      $rootScope.myIMEI = "testWeb";
    }

    //操作系统信息
    var currentPlatformVersion = ionic.Platform.version();
    console.log("currentPlatformVersion:" + currentPlatformVersion);

    //记录登录日志(
    LogsService.addLogin(myImei);

    //更新
    function updateVersion(){
        UpdateService.popupUpdateView(apkFilePath,updateContext);
    }

    $rootScope.updateCount = 0;
    //数据库内容为空，提示同步数据库
    /**
     * 检查本地数据，没有数据进行提示，有数据查看服务器是否有更新
     */
    function checkLocalData(){
      var selectSql = "select count(1) as count from doc";
      DBA.executeSql(selectSql).then(function(result){
        var count = DBA.getById(result).count;
        $rootScope.allCount = count;
        if(count < 1){
          var alertPopup = $ionicPopup.alert({
            title: '<b>本地数据为空！</b>',
            template: '&nbsp;&nbsp;&nbsp;&nbsp;操作提示：点击菜单“设置” ➜ “同步云端数据”，从网络获取数据。<br>&nbsp;&nbsp;&nbsp;&nbsp;注意：初次同步时内容较多，需看屏幕提示耐心等待。',
            okText:'我知道了'
          });
          alertPopup.then(function(res) {
            console.log('Thank you.');
          });
        }else{
          checkServerDataUpdate();
        }
      })
    }
    checkLocalData();

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
          if(lastId == ''){
            //插入doc_log表
            var insertSql = "insert into doc_log(id,docid,acttype,acttime) values (?,?,?,?)";
            var parameters;
            angular.forEach(result,function(docLog){
              parameters = [docLog.id,docLog.docid,docLog.acttype,docLog.acttime];
              //console.log(parameters);
              DBA.executeSql(insertSql,parameters);
            })
          }else{
            //TODO 统计有多少新增，更新、删除
            if(result.length > 0){
              $rootScope.updateCount = result.length;
              var updatePopup = $ionicPopup.alert({
                title: '<b>有'+ result.length+'篇文章更新！</b>',
                template: '&nbsp;&nbsp;&nbsp;&nbsp;操作提示：点击菜单“设置” ➜ “同步云端数据”，从网络获取数据。',
                okText:'我知道了'
              });
              updatePopup.then(function(res) {
                console.log('success notice.');
              });
            }
          }
        },function(err){
          $rootScope.updateCount = "x400";
        })
      })
    }
  });
})

//.config(['$stateProvider','$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    controller: 'TabCtrl'
  })

  // Each tab has its own nav history stack:

    .state('tab.newest', {
      url: '/newest',
      views: {
        'tab-newest': {
          templateUrl: 'templates/tab-newest.html',
          controller: 'NewestCtrl'
        }
      }
    })

    .state('tab.newestArticle', {
      url: '/newestArticle/:docid',
      views: {
        'tab-newest': {
          templateUrl: 'templates/tab-article.html',
          controller: 'ArticleCtrl'
        }
      }
    })

  .state('tab.folder', {
    url: '/folder/:supModuleName/:moduleName/:subModuleName',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-folder.html',
        controller: 'FolderCtrl'
      }
    }
  })

  .state('tab.article', {
    url: '/articles/:docid',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-article.html',
        controller: 'ArticleCtrl'
      }
    }
  })

  .state('tab.laws', {
      url: '/laws/:supModuleName/:moduleName/:subModuleName',
      views: {
        'tab-laws': {
          templateUrl: 'templates/tab-laws.html',
          controller: 'LawsCtrl'
        }
      }
    })
  .state('tab.lawsArticle', {
      url: '/lawsArticle/:docid',
      views: {
        'tab-laws': {
          templateUrl: 'templates/tab-article.html',
          controller: 'ArticleCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  })

  .state('tab.us', {
    url: '/us',
    views: {
      'tab-account': {
        templateUrl: 'templates/us.html'
      }
    }
  })

  .state('tab.interface', {
    url: '/interface',
    views: {
      'tab-account': {
        templateUrl: 'templates/interface.html',
        controller:'InterfaceCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/newest');
  //$locationProvider.html5Mode(true);
});
