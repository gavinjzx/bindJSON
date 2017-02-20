json数据绑定jQuery插件
功能：
  1、绑定列表数据
  2、绑定单条数据到页面

使用方法
  1、页面引用jquery和bindJSON插 件
    <code>&lt;script src="lib/jquery-1.12.4.min.js"&gt;&lt;/script&gt;
    &lt;script src="lib/jquery.bindJSON.js"&gt;&lt;/script&gt;</code>
  如果手机端使用zepto.js，把jquery.bindJSON.js复制文件名为zepto.bindJSON.js，修改最后一行内容为:
  })(zepto);//原为})(jQuery);
  把
    <code>&lt;script src="lib/jquery.bindJSON.js"&gt;&lt;/script&gt;换成
    &lt;script src="lib/zepto.bindJSON.js"&gt;&lt;/script&gt;</code>
  2、绑定列表数据：
  a.设计模板：
    <pre><code>&lt;ul  id="dataObj" class="jsTemplate hide"&gt;
        &lt;li&gt;
            &lt;div&gt;
                &lt;div class="hd"&gt;{placeName}&lt;/div&gt;
                &lt;div class="bd"&gt;活动时间：{activitytime}&lt;/div&gt;
            &lt;/div&gt;
        &lt;/li&gt;
    &lt;/ul&gt;</code></pre>
  b.JS调用：
    <pre><code>$("#dataObj").bindJSON("list"});//循环调用json数据列表
    //对循环后的数据再处理，需使用回调函数
    $("#dataObj").bindJSON("list", {}, function () {
            $("ul&gt;li").addClass("red");
            console.log("here");
        });</code></pre>

  3、绑定单条数据到页面
    <pre><code>$("#dataObj").bindJSON("detail",{},function(){});</code></pre>
    
      20170210更新：list方法添加分页功能。
      使用方法：传参数时isPage:true;
      如
      $("#dataObj").bindJSON("list", {isPage: true, pageSize: 2});



