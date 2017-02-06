/**
 * Created by c-zouzhongxing on 2017/2/5.
 */
(function ($) {
    //功能：用ITEMList替换JS模板中的字段,主要采用正则表达式实现
    // 参数：jsTemplate:JS模板对向，内含字段用{字段名}表示
    // 参数：itemList,数据对像
    var replaceTemplate = function (jsTemplate, itemList) {
        var strContent = "";
        $.each(itemList, function (i, item) {
            var reg = /\{(.*?)\}/g;
            var strMatches = jsTemplate.match(reg),
                strFieldName;
            var strOneRecord = jsTemplate;

            $.each(strMatches, function (i, strMatch) {
                strFieldName = strMatch.replace(/\{(.*?)\}/g, "$1");
                strOneRecord = strOneRecord.replace(strMatch, hasPrototype(item, strFieldName) ? item[strFieldName] : "<span style='color:red'>无此字段：" + strFieldName + "</span>");
            });
            strContent += strOneRecord;
        });
        return strContent;
    };
    //判断字段对象是否有此属性
    function hasPrototype(object, name) {
        return object.hasOwnProperty(name) && (name in object);
    }

    //方法
    // list:数据遍历列表方法
    //detail:详细信息展示方法
    var methods = {
            init: function () {
            },
            //list方法
            list: function (option, callback) {
                //获取模板ID
                var templateID = "#" + this.attr("data-templateID");
                //数据容器ID
                var htmlObjID = "#" + this.attr("id");
                //获取模板内容
                var strTemplate = $(templateID).html();
                //获取jsonURL
                var strJsonUrl = this.attr("data-jsonUrl");

                $.getJSON(strJsonUrl, function (jsonData) {
                    var htmlContent = replaceTemplate(strTemplate, jsonData.data);
                    $(htmlObjID).html(htmlContent);
                    if (typeof callback === "function") {
                        //执行回调函数
                        callback();
                    }
                });
            },
            detail: function (option, callback) {
                var that = this;
                //获取jsonURL
                var strJsonUrl = this.attr("data-jsonUrl");
                $.getJSON(strJsonUrl, function (jsonData) {
                    var htmlContent = that.html();
                    //定义正则表达式
                    var reg = /\{(.*?)\}/g;
                    var strMatches = htmlContent.match(reg);
                    //匹配字段
                    $.each(strMatches, function (i, strMatch) {
                        //获取字段名称
                        strFieldName = strMatch.replace(/\{(.*?)\}/g, "$1");
                        //字段替换
                        htmlContent = htmlContent.replace(strMatch, hasPrototype(jsonData.data, strFieldName) ? jsonData.data[strFieldName] : "<span style='color:red'>无此字段：" + strFieldName + "</span>");
                    });
                    that.html(htmlContent);
                });
                if (typeof callback === "function") {
                    //执行回调函数
                    callback();
                }
            }
        }
        ;
    $.fn.bindJSON = function () {
        var method = arguments[0];
        if (methods[method]) {
            method = methods[method];
            arguments = Array.prototype.slice.call(arguments, 1);
        } else if (typeof(method) == 'object' || !method) {
            method = methods.init;
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.bindJSON');
        }
        method.apply(this, arguments);
        return this;
    };
})(Zepto);