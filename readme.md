json数据绑定jQuery插件
功能：
1、绑定列表数据
2、绑定单条数据到页面

使用方法
1、页面引用jquery和bindJSON插 件
    <script src="lib/jquery-1.12.4.min.js"></script>
    <script src="lib/jquery.bindJSON.js"></script>`
如果手机端使用zepto.js，把jquery.bindJSON.js复制文件名为zepto.bindJSON.js，修改最后一行内容为:
})(zepto);//原为})(jQuery);
把
    <script src="lib/jquery.bindJSON.js"></script>`换成
    <script src="lib/zepto.bindJSON.js"></script>`
2、绑定列表数据：
a.设计模板：
    <ul class="jsTemplate" id="dataTemplate">
        <li>
            <div>
                <div class="hd">{placeName}</div>
                <div class="bd">活动时间：{activitytime}</div>
            </div>
        </li>
    </ul>
b.设计数据容器：
    <ul id="dataObj" data-templateID="dataTemplate" `data-jsonUrl="js/json/data.json">`
        <li class="loadInfo">数据加载中……</li>
    </ul>
c.JS调用：
    $("#dataObj").bindJSON("list"});//循环调用json数据列表
    //对循环后的数据再处理，需使用回调函数
    $("#dataObj").bindJSON("list", {}, function () {
            $("ul>li").addClass("red");
            console.log("here");
        });

3、绑定单条数据到页面
    $("#dataObj").bindJSON("detail"});



