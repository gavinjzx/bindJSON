json数据绑定jQuery插件
功能：
1、绑定列表数据
2、绑定单条数据到页面

使用方法
1、页面引用jquery和bindJSON插 件
    <code><script src="lib/jquery-1.12.4.min.js"></script>
    <script src="lib/jquery.bindJSON.js"></script></code>
如果手机端使用zepto.js，把jquery.bindJSON.js复制文件名为zepto.bindJSON.js，修改最后一行内容为:
})(zepto);//原为})(jQuery);
把
    <code><script src="lib/jquery.bindJSON.js"></script>换成
    <script src="lib/zepto.bindJSON.js"></script></code>
2、绑定列表数据：
a.设计模板：
    <code><ul class="jsTemplate" id="dataTemplate">
        <li>
            <div>
                <div class="hd">{placeName}</div>
                <div class="bd">活动时间：{activitytime}</div>
            </div>
        </li>
    </ul></code>
b.设计数据容器：
    <code><ul id="dataObj" data-templateID="dataTemplate" data-jsonUrl="js/json/data.json">
        <li class="loadInfo">数据加载中……</li>
    </ul></code>
c.JS调用：
    <code>$("#dataObj").bindJSON("list"});//循环调用json数据列表
    //对循环后的数据再处理，需使用回调函数
    $("#dataObj").bindJSON("list", {}, function () {
            $("ul>li").addClass("red");
            console.log("here");
        });</code>

3、绑定单条数据到页面
    <code>$("#dataObj").bindJSON("detail"});</code>



