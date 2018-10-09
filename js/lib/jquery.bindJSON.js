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
                arrPages = dimArray(totalPage, 1);
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
            strNext = "<li data-page='[page:pageNum]'>&gt;</li>".replace(/\[page:pageNum\]/g, (parseInt(ps.currentPage) + 1) > totalPage ? totalPage : parseInt(ps.currentPage) + 1);
            strLast = "<li data-page='[page:pageNum]'>&gt;&gt;</li>".replace(/\[page:pageNum\]/g, totalPage);
            if (ps.currentPage === 1) {
                strFirst = "";
                strPrev = "";
            }
            if (parseInt(ps.currentPage) === totalPage) {
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

    var getPageHtmlMobile = function () {

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
                    isMobile: false,
                    pageSize: 20,
                    currentPage: 1,
                    totalRecords: 0
                };
                //初始化参数
                listSetting.isMobile = (/(iemobile|iphone|ipod|android|nokia|sonyericsson|blackberry|samsung|sec\-|windows ce|motorola|mot\-|up.b|midp\-)/gi).test(navigator.appVersion);
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
                var strLoadInfo = "<div class='loading'>" + $(htmlObjID).attr("data-loadInfo") + "</div>";
                if (listSetting.currentPage == 1) {
                    $(htmlObjID).html(strLoadInfo).removeClass("hide");
                }
                //取得带分页代码的jsonUrl
                var getJsonUrl = function (currentPage, pageSize) {

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
                    if (jsonUrl.indexOf("pageSize") > -1) {
                        jsonUrl = jsonUrl.replace(/pageSize=(\d+)*/g, "pageSize=" + pageSize);
                    }
                    else {
                        if (jsonUrl.indexOf("?") > -1) {
                            jsonUrl = jsonUrl + "&pageSize=" + pageSize;
                        }
                        else {
                            jsonUrl = jsonUrl + "?pageSize=" + pageSize;
                        }
                    }
                    //console.log(jsonUrl);
                    return jsonUrl;
                };
                //获取jsonURL
                var strJsonUrl = this.attr("data-jsonurl");
                strJsonUrl = getJsonUrl(listSetting.currentPage, listSetting.pageSize);
                $.getJSON(strJsonUrl, function (jsonData) {
                    console.log(jsonData);
                    //var jsonData = JSON.parse(jsonData);
                    var htmlContent = replaceTemplate(strTemplate, jsonData.data);
                    listSetting.totalRecords = jsonData.totalRecord;
                    if (listSetting.isMobile && listSetting.currentPage > 1) {
                        //如果是手机采用append
                        $(htmlObjID).prev(".loading").remove();
                        $(htmlObjID).append(htmlContent);
                        //console.log("htmlObjHtml:" + $(htmlObjID).html());
                        //console.log("htmlContent:" + htmlContent);
                    }
                    else {
                        //如果是非手机采用替换方法
                        $(htmlObjID).prev(".loading").remove();
                        $(htmlObjID).html(htmlContent);
                    }
                    //分页代码开始
                    if (listSetting.isPage) {

                        //总页数
                        var totalPage = Math.ceil(listSetting.totalRecords / listSetting.pageSize);
                        listSetting.totalRecords = jsonData.totalRecord;
                        if (listSetting.isMobile) {
                            //http://yijiebuyi.com/blog/957bfb7468d2cc53d72ddebc2b5d39d3.html
                            //文档高度
                            var getDocumentTop = function () {
                                var scrollTop = 0, bodyScrollTop = 0, documentScrollTop = 0;
                                if (document.body) {
                                    bodyScrollTop = document.body.scrollTop;
                                }
                                if (document.documentElement) {
                                    documentScrollTop = document.documentElement.scrollTop;
                                }
                                scrollTop = (bodyScrollTop - documentScrollTop > 0) ? bodyScrollTop : documentScrollTop;
                                return scrollTop;
                            };
                            //可视窗口高度
                            var getWindowHeight = function () {
                                var windowHeight = 0;
                                if (document.compatMode == "CSS1Compat") {
                                    windowHeight = document.documentElement.clientHeight;
                                } else {
                                    windowHeight = document.body.clientHeight;
                                }
                                return windowHeight;
                            };
                            //滚动条滚动高度
                            var getScrollHeight = function () {
                                var scrollHeight = 0, bodyScrollHeight = 0, documentScrollHeight = 0;
                                if (document.body) {
                                    bodyScrollHeight = document.body.scrollHeight;
                                }
                                if (document.documentElement) {
                                    documentScrollHeight = document.documentElement.scrollHeight;
                                }
                                scrollHeight = (bodyScrollHeight - documentScrollHeight > 0) ? bodyScrollHeight : documentScrollHeight;
                                return scrollHeight;
                            };


                            //清除状态
                            var clearStatus = function () {
                                //延时1秒清除
                                setTimeout(function () {
                                    $(htmlObjID).next().remove();
                                }, 1000)
                            };
                            //loading
                            var loading = function () {
                                if (listSetting.currentPage < totalPage) {
                                    if (!$(".loading")[0]) {
                                        $(htmlObjID).html("<div class='loading'>载入中……</div>");
                                    }
                                    //todo

                                }
                                else {
                                    if (!$(htmlObjID).next().hasClass("loadEnd")) {
                                        $(htmlObjID).after("<div class='loadEnd'>已经是底部</div>");
                                    }
                                }
                            };
                            //加载下一页
                            var loadNextPage = function () {
                                if (listSetting.currentPage < totalPage)//小于总页数
                                {
                                    //listSetting.currentPage += 1;//取消当前页+1，因为在loading中，已经+1了
                                    //console.log(listSetting.currentPage);
                                    var jsonUrl = getJsonUrl(listSetting.currentPage, listSetting.pageSize);
                                    $(htmlObjID).attr("data-jsonUrl", getJsonUrl(listSetting.currentPage, listSetting.pageSize));
                                    $("body").unbind("touchend");
                                    listSetting.currentPage += 1;
                                    $(htmlObjID).bindJSON("list", listSetting, callback);
                                }
                            };
                            //loadFull如果首页不满，填充第二页
                            var loadFull = function () {
                                if (getDocumentTop() < getWindowHeight() && listSetting.currentPage === 1 && totalPage > 1) {
                                    var jsonUrl = getJsonUrl(2, listSetting.pageSize);
                                    $(htmlObjID).attr("data-jsonUrl", jsonUrl);
                                    listSetting.currentPage = 2;
                                    $(htmlObjID).bindJSON("list", listSetting, callback);
                                    //loadNextPage();
                                }
                            };
                            //手机端分页
                            var el = document.querySelector('body');
                            var startPosition, endPosition, deltaX, deltaY, moveLength;

                            el.addEventListener('touchstart', function (e) {
                                var touch = e.touches[0];
                                startPosition = {
                                    x: touch.pageX,
                                    y: touch.pageY
                                }
                            });

                            $("body").bind('touchend', function (e) {
                                var touch = e.changedTouches[0];
                                endPosition = {
                                    x: touch.pageX,
                                    y: touch.pageY
                                }

                                deltaX = endPosition.x - startPosition.x;
                                deltaY = endPosition.y - startPosition.y;
                                moveLength = Math.sqrt(Math.pow(Math.abs(deltaX), 2) + Math.pow(Math.abs(deltaY), 2));
                                console.log(moveLength);
                                if (deltaY < -10) {
                                    if (getScrollHeight() == getDocumentTop() + getWindowHeight()) {
                                        //e.preventDefault();
                                        loading();//截入ing
                                        //console.log(totalPage);
                                        loadNextPage();//加载下一页
                                        clearStatus();//清除状态
                                    }
                                }
                            });
                            //$("body").bind('touchend', function (e) {
                            //    console.log("touchEnd:");
                            //
                            //    if (getScrollHeight() == getDocumentTop() + getWindowHeight()) {
                            //        //e.preventDefault();
                            //        loading();//截入ing
                            //        //console.log(totalPage);
                            //        loadNextPage();//加载下一页
                            //        clearStatus();//清除状态
                            //    }
                            //});
                            loadFull();
                        } else {
                            //PC 端分页代码
                            var pageHtml = getPageHtml(listSetting);
                            $(htmlObjID).next().remove();
                            $(htmlObjID).after(pageHtml);
                            $(htmlObjID).next().find("li[data-page='" + listSetting.currentPage + "']").addClass("currentPage");
                            $(htmlObjID).next().find("li").on("click", function () {
                                var currentPage = $(this).attr("data-page");
                                var jsonUrl = getJsonUrl(currentPage, listSetting.pageSize);//获取jsonURL
                                $(htmlObjID).attr("data-jsonUrl", jsonUrl);
                                listSetting.currentPage = parseInt(currentPage);
                                if (!$(this).hasClass("currentPage")) {
                                    $(htmlObjID).bindJSON("list", listSetting, callback);
                                }
                            });
                        }
                    }
                    //分页代码结束
                    if (typeof callback === "function") {
                        //执行回调函数
                        callback(jsonData);
                        $(htmlObjID).removeAttr("style");
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
                    that.removeClass("hide");
                    if (typeof callback === "function") {
                        //执行回调函数
                        callback(jsonData);
                    }
                });
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
})(jQuery);

