/**
 * Created by gavin joe(阿提) on 2017/2/5.微信号:gavinjzx,qq:120534960
 */
(function ($) {
    //在数组上添加定义二维数组的方法
    //参照《javascript语言精粹》第62页
    //参数length:数组长度
    //参数initial：初始化值
    var dimArray = function (length, initial) {
        var a = [], i;
        for (i = 0; i < length; i += 1) {
            a[i] = initial + i;
        }
        return a;
    }
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

    //获取分页代码
    var getPageHtml = function (option) {
        var pageSetting = {
                //当前页
                currentPage: 1,
                pageSize: 20,
                //总记录
                totalRecords: 0,
                pageTemplate: "<div>当前页: [page:page], 总页数: [page:pages]，<ul class='pageNav'>[page:pageLink]</ul></div>",
                pageLinkTemplate: "<li data-page='[page:pageNum]'>[page:pageNum]</li>"
            }
            ;
        $.extend(pageSetting, option);
        //临时模板数据
        return function (ps) {
            var totalPage = Math.ceil(ps.totalRecords / ps.pageSize);
            if (totalPage < 2)return;
            var tempHtml = ps.pageTemplate;
            var pageHtml = "";
            var arrPages = "";//列表页码的数组
            var strPrev = "";//上一页
            var strNext = "";//下一页
            var strFirst = "";//第一页
            var strLast = "";//最后一页
            var strPageLink = "";//数字页码区

            if (!(totalPage > 10)) {
                arrPages = dimArray(10, 1);

            }
            if (totalPage > 10) {
                //分成三种情况,
                // 1、当前页<10
                //2.当前页>10 and <总页数-5
                if (ps.currentPage <= 10) {
                    arrPages = dimArray(10, 1);
                }
                if (ps.currentPage > 10) {
                    if (ps.currentPage <= (totalPage - 5)) {
                        arrPages = dimArray(10, ps.currentPage - 4);
                    }
                    else {
                        arrPages = dimArray(10, totalPage - 9);
                    }

                }
            }
            $.each(arrPages, function (i, item) {
                strPageLink += ps.pageLinkTemplate.replace(/\[page:pageNum\]/g, item);
            });
            strFirst = "<li data-page='[page:pageNum]'>&lt;&lt;</li>".replace(/\[page:pageNum\]/g, 1);
            strPrev = "<li data-page='[page:pageNum]'>&lt;</li>".replace(/\[page:pageNum\]/g, parseInt(ps.currentPage) - 1);
            strNext = "<li data-page='[page:pageNum]'>&gt;</li>".replace(/\[page:pageNum\]/g, parseInt(ps.currentPage) + 1);
            strLast = "<li data-page='[page:pageNum]'>&gt;&gt;</li>".replace(/\[page:pageNum\]/g, totalPage);
            if (ps.currentPage == 1) {
                strFirst = "";
                strPrev = "";
            }
            if (ps.currentPage == ps.pages) {
                strNext = "";
                strLast = "";
            }
            pageHtml = strFirst + strPrev + strPageLink + strNext + strLast;

            tempHtml =
                //替换总页数
                tempHtml.replace(/\[page\:pages\]/g, totalPage)
                    //替换当前页
                    .replace(/\[page\:page\]/g, ps.currentPage ? ps.currentPage : 1)
                    //数字区域
                    .replace(/\[page\:pageLink\]/g, pageHtml);
            return tempHtml;
        }(pageSetting);
    };

    //方法
    // list:数据遍历列表方法
    //detail:详细信息展示方法
    var methods = {
            init: function () {
            },
            //list方法
            list: function (option, callback) {
                //参数设置
                var listSetting = {
                    isPage: false,
                    pageSize: 20,
                    currentPage: 1,
                    totalRecords: 0
                };
                //初始化参数
                $.extend(listSetting, option);
                //console.log(listSetting);
                var htmlObjID = "#" + this.attr("id");
                var htmlObjTemplateID = htmlObjID + "Template";
                //获取模板内容
                var strTemplate = "";
                if ($(htmlObjTemplateID)[0]) {
                    strTemplate = $(htmlObjTemplateID).html();
                } else {
                    strTemplate = $(htmlObjID).html();
                    $("body").append("<div id='" + htmlObjTemplateID.slice(1) + "' class='hide'></div>");
                    $(htmlObjTemplateID).html(strTemplate);
                }
                //数据载入提示并去掉隐藏样式.hide
                //console.log(strTemplate);
                var strLoadInfo = $(htmlObjID).attr("data-loadInfo");
                $(htmlObjID).html(strLoadInfo).removeClass("hide");
                //获取jsonURL
                var strJsonUrl = this.attr("data-jsonUrl");

                $.getJSON(strJsonUrl, function (jsonData) {
                    var htmlContent = replaceTemplate(strTemplate, jsonData.data);
                    $(htmlObjID).html(htmlContent);
                    //分页代码开始
                    if (listSetting.isPage) {
                        listSetting.totalRecords = jsonData.totalRecord;
                        var pageHtml = getPageHtml(listSetting);
                        //console.log(pageHtml);
                        $(htmlObjID).next().remove();
                        $(htmlObjID).after(pageHtml);
                        $(htmlObjID).next().find("li[data-page='" + listSetting.currentPage + "']").addClass("currentPage");
                        $(htmlObjID).next().find("li[data-page!='" + listSetting.currentPage + "']").on("click", function () {
                            var currentPage = $(this).attr("data-page");
                            var jsonUrl = $(htmlObjID).attr("data-jsonUrl");
                            if (jsonUrl.indexOf("page") > -1) {
                                jsonUrl = jsonUrl.replace(/page=(\d+)*/g, "page=" + currentPage);
                            }
                            else {
                                if (jsonUrl.indexOf("?") > -1) {
                                    jsonUrl = jsonUrl + "&page=" + currentPage;
                                }
                                else {
                                    jsonUrl = jsonUrl + "?page=" + currentPage;
                                }
                            }
                            $(htmlObjID).attr("data-jsonUrl", jsonUrl);
                            listSetting.currentPage = parseInt(currentPage);
                            $(htmlObjID).bindJSON("list", listSetting, callback);
                        })
                    }
                    //分页代码结束
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