function init(){map=new ymaps.Map("yaMap",{center:[59.91596187,30.30575744],zoom:14,controls:["zoomControl"]});var t=ymaps.templateLayoutFactory.createClass("<div class='ya-map__icon ya-map__icon--red'></div>"),e=ymaps.templateLayoutFactory.createClass("<div class='ya-map__icon ya-map__icon--blue'></div>");pointOne=new ymaps.Placemark([59.9219184,30.31779727],{hintContent:"Точка для обклейки",balloonContent:"Спб, Московский проспект, 97а<br>10:00-18:00"},{iconLayout:e,iconShape:{type:"Rectangle",coordinates:[[-7,-40],[33,0]]}}),pointTwo=new ymaps.Placemark([59.90988461,30.29648772],{hintContent:"Главный офис",balloonContent:"Какой-то другой адрес<br>10:00-18:00"},{iconLayout:t,iconShape:{type:"Rectangle",coordinates:[[-7,-40],[33,0]]}}),map.behaviors.disable("scrollZoom"),map.geoObjects.add(pointOne),map.geoObjects.add(pointTwo)}if(function(){var t,e,o,a,n,i,r,s,l,d;e=window.device,t={},window.device=t,a=window.document.documentElement,d=window.navigator.userAgent.toLowerCase(),t.ios=function(){return t.iphone()||t.ipod()||t.ipad()},t.iphone=function(){return!t.windows()&&n("iphone")},t.ipod=function(){return n("ipod")},t.ipad=function(){return n("ipad")},t.android=function(){return!t.windows()&&n("android")},t.androidPhone=function(){return t.android()&&n("mobile")},t.androidTablet=function(){return t.android()&&!n("mobile")},t.blackberry=function(){return n("blackberry")||n("bb10")||n("rim")},t.blackberryPhone=function(){return t.blackberry()&&!n("tablet")},t.blackberryTablet=function(){return t.blackberry()&&n("tablet")},t.windows=function(){return n("windows")},t.windowsPhone=function(){return t.windows()&&n("phone")},t.windowsTablet=function(){return t.windows()&&n("touch")&&!t.windowsPhone()},t.fxos=function(){return(n("(mobile;")||n("(tablet;"))&&n("; rv:")},t.fxosPhone=function(){return t.fxos()&&n("mobile")},t.fxosTablet=function(){return t.fxos()&&n("tablet")},t.meego=function(){return n("meego")},t.cordova=function(){return window.cordova&&"file:"===location.protocol},t.nodeWebkit=function(){return"object"==typeof window.process},t.mobile=function(){return t.androidPhone()||t.iphone()||t.ipod()||t.windowsPhone()||t.blackberryPhone()||t.fxosPhone()||t.meego()},t.tablet=function(){return t.ipad()||t.androidTablet()||t.blackberryTablet()||t.windowsTablet()||t.fxosTablet()},t.desktop=function(){return!t.tablet()&&!t.mobile()},t.television=function(){var t;for(television=["googletv","viera","smarttv","internet.tv","netcast","nettv","appletv","boxee","kylo","roku","dlnadoc","roku","pov_tv","hbbtv","ce-html"],t=0;t<television.length;){if(n(television[t]))return!0;t++}return!1},t.portrait=function(){return window.innerHeight/window.innerWidth>1},t.landscape=function(){return window.innerHeight/window.innerWidth<1},t.noConflict=function(){return window.device=e,this},n=function(t){return-1!==d.indexOf(t)},r=function(t){var e;return e=new RegExp(t,"i"),a.className.match(e)},o=function(t){var e=null;r(t)||(e=a.className.replace(/^\s+|\s+$/g,""),a.className=e+" "+t)},l=function(t){r(t)&&(a.className=a.className.replace(" "+t,""))},t.ios()?t.ipad()?o("ios ipad tablet"):t.iphone()?o("ios iphone mobile"):t.ipod()&&o("ios ipod mobile"):t.android()?o(t.androidTablet()?"android tablet":"android mobile"):t.blackberry()?o(t.blackberryTablet()?"blackberry tablet":"blackberry mobile"):t.windows()?o(t.windowsTablet()?"windows tablet":t.windowsPhone()?"windows mobile":"desktop"):t.fxos()?o(t.fxosTablet()?"fxos tablet":"fxos mobile"):t.meego()?o("meego mobile"):t.nodeWebkit()?o("node-webkit"):t.television()?o("television"):t.desktop()&&o("desktop"),t.cordova()&&o("cordova"),i=function(){t.landscape()?(l("portrait"),o("landscape")):(l("landscape"),o("portrait"))},s=Object.prototype.hasOwnProperty.call(window,"onorientationchange")?"orientationchange":"resize",window.addEventListener?window.addEventListener(s,i,!1):window.attachEvent?window.attachEvent(s,i):window[s]=i,i(),"function"==typeof define&&"object"==typeof define.amd&&define.amd?define(function(){return t}):"undefined"!=typeof module&&module.exports?module.exports=t:window.device=t}.call(this),function(t,e,o,a){var n=t(e);t.fn.lazyload=function(i){function r(){var e=0;l.each(function(){var o=t(this);if(!d.skip_invisible||o.is(":visible"))if(t.abovethetop(this,d)||t.leftofbegin(this,d));else if(t.belowthefold(this,d)||t.rightoffold(this,d)){if(++e>d.failure_limit)return!1}else o.trigger("appear"),e=0})}var s,l=this,d={threshold:0,failure_limit:0,event:"scroll",effect:"show",container:e,data_attribute:"original",skip_invisible:!1,appear:null,load:null,placeholder:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"};return i&&(a!==i.failurelimit&&(i.failure_limit=i.failurelimit,delete i.failurelimit),a!==i.effectspeed&&(i.effect_speed=i.effectspeed,delete i.effectspeed),t.extend(d,i)),s=d.container===a||d.container===e?n:t(d.container),0===d.event.indexOf("scroll")&&s.bind(d.event,function(){return r()}),this.each(function(){var e=this,o=t(e);e.loaded=!1,o.attr("src")!==a&&o.attr("src")!==!1||o.is("img")&&o.attr("src",d.placeholder),o.one("appear",function(){if(!this.loaded){if(d.appear){var a=l.length;d.appear.call(e,a,d)}t("<img />").bind("load",function(){var a=o.attr("data-"+d.data_attribute);o.hide(),o.is("img")?o.attr("src",a):o.css("background-image","url('"+a+"')"),o[d.effect](d.effect_speed),e.loaded=!0;var n=t.grep(l,function(t){return!t.loaded});if(l=t(n),d.load){var i=l.length;d.load.call(e,i,d)}}).attr("src",o.attr("data-"+d.data_attribute))}}),0!==d.event.indexOf("scroll")&&o.bind(d.event,function(){e.loaded||o.trigger("appear")})}),n.bind("resize",function(){r()}),/(?:iphone|ipod|ipad).*os 5/gi.test(navigator.appVersion)&&n.bind("pageshow",function(e){e.originalEvent&&e.originalEvent.persisted&&l.each(function(){t(this).trigger("appear")})}),t(o).ready(function(){r()}),this},t.belowthefold=function(o,i){var r;return r=i.container===a||i.container===e?(e.innerHeight?e.innerHeight:n.height())+n.scrollTop():t(i.container).offset().top+t(i.container).height(),r<=t(o).offset().top-i.threshold},t.rightoffold=function(o,i){var r;return r=i.container===a||i.container===e?n.width()+n.scrollLeft():t(i.container).offset().left+t(i.container).width(),r<=t(o).offset().left-i.threshold},t.abovethetop=function(o,i){var r;return r=i.container===a||i.container===e?n.scrollTop():t(i.container).offset().top,r>=t(o).offset().top+i.threshold+t(o).height()},t.leftofbegin=function(o,i){var r;return r=i.container===a||i.container===e?n.scrollLeft():t(i.container).offset().left,r>=t(o).offset().left+i.threshold+t(o).width()},t.inviewport=function(e,o){return!(t.rightoffold(e,o)||t.leftofbegin(e,o)||t.belowthefold(e,o)||t.abovethetop(e,o))},t.extend(t.expr[":"],{"below-the-fold":function(e){return t.belowthefold(e,{threshold:0})},"above-the-top":function(e){return!t.belowthefold(e,{threshold:0})},"right-of-screen":function(e){return t.rightoffold(e,{threshold:0})},"left-of-screen":function(e){return!t.rightoffold(e,{threshold:0})},"in-viewport":function(e){return t.inviewport(e,{threshold:0})},"above-the-fold":function(e){return!t.belowthefold(e,{threshold:0})},"right-of-fold":function(e){return t.rightoffold(e,{threshold:0})},"left-of-fold":function(e){return!t.rightoffold(e,{threshold:0})}})}(jQuery,window,document),jQuery(document).ready(function(t){function e(){t("[data-clock='h']").text(Math.floor(o/3600)),t("[data-clock='m']").text(Math.floor(o%3600/60)),t("[data-clock='s']").text(Math.floor(o%3600%60)),o+=1}t("body").on("click",".burger",function(e){e.preventDefault(),t(".navigation").toggleClass("navigation--open")}),t("body").on("click",".dot-strip__input",function(e){switch(t(this).attr("id")){case"dotCar":t(".dot-strip__runner").attr("data-pos","one");break;case"dotLorry":t(".dot-strip__runner").attr("data-pos","two");break;case"dotBus":t(".dot-strip__runner").attr("data-pos","three")}t(this).closest(".slider").find(".slide-pack").attr("data-slider-pos",t(this).attr("data-dot-pos"))}),t("body").on("click","#nextPage",function(e){e.preventDefault(),"true"===t("#pageOne").attr("data-show")?(t("#pageOne").attr("data-show","false"),t("#pageTwo").attr("data-show","true"),t("[data-step]").attr("data-step","two")):"true"===t("#pageTwo").attr("data-show")&&(t("#pageTwo").attr("data-show","false"),t("#pageThree").attr("data-show","true"),t("[data-step]").attr("data-step","three"))}),t("body").on("click","#prevPage",function(e){e.preventDefault(),"true"===t("#pageThree").attr("data-show")?(t("#pageThree").attr("data-show","false"),t("#pageTwo").attr("data-show","true"),t("[data-step]").attr("data-step","two")):"true"===t("#pageTwo").attr("data-show")&&(t("#pageTwo").attr("data-show","false"),t("#pageOne").attr("data-show","true"),t("[data-step]").attr("data-step","one"))}),t("body").on("input",".input__input",function(e){""!==t(this).val()?t(this).attr("data-filled","true"):t(this).attr("data-filled","false")}),t("#map").lazyload({threshold:200,effect:"fadeIn"}),t("body").on("click",".message__bg, .message__close",function(e){e.preventDefault(),t(this).closest(".message").removeClass("message--show")}),t("body").on("mouseenter",".map .pin",function(e){e.preventDefault(),t(this).removeClass("pin--show").css("z-index","2").siblings().removeClass("pin--show").css("z-index","1")});var o=55555;if(t("html").hasClass("desktop")){var a=new Date;a.setDate(a.getDate());var n=(new Date).getHours(),i=(new Date).getMinutes(),r=(new Date).getSeconds();t("[data-clock='h'").text(n),t("[data-clock='m'").text(i),t("[data-clock='s'").text(r),setInterval(function(){n=(new Date).getHours(),t("[data-clock='h'").text(n),i=(new Date).getMinutes(),t("[data-clock='m'").text(i),r=(new Date).getSeconds(),t("[data-clock='s'").text(r)},1e3)}else t("[data-clock='h']").text(Math.floor(o/3600)),t("[data-clock='m']").text(Math.floor(o%3600/60)),t("[data-clock='s']").text(Math.floor(o%3600%60)),o+=1,setInterval(e,1e3);t(".questions__item").eq(1).hide(),t("body").on("click",".main-btn--hdiw",function(e){e.preventDefault(),t(this).hasClass("main-btn--active")||(t(this).addClass("main-btn--active").siblings().removeClass("main-btn--active"),t(".questions__item").eq(t(this).index()-2).fadeIn(300).siblings().fadeOut(300),t(".questions__item").find(".question__body").slideUp(300))}),t("body").on("click",".question__title",function(e){e.preventDefault(),t(this).closest(".question__header").siblings(".question__body").slideToggle(300).closest(".question").siblings(".question").find(".question__body").slideUp(300)});var s=0;t(window).scroll(function(e){t(".search").length&&t(window).scrollTop()>=t(".search").offset().top-t(window).height()+t(".search").height()/2&&1!==s&&(t(".search").addClass("search--animate"),s=1)}),t("body").on("click",".select__input",function(e){t(this).closest(".select--open").length?t(this).closest(".select").removeClass("select--open"):(t(".select--open").removeClass("select--open"),t(this).closest(".select").addClass("select--open"))}),t("body").on("click",".select__variant",function(e){e.preventDefault(),t(this).closest(".select__variants").siblings(".select__input").val(t(this).text()).closest(".select").removeClass("select--open")}),t("body").on("click","[data-pag-pos]",function(e){e.preventDefault(),t(this).addClass("slide-pack__pag--active").siblings().removeClass("slide-pack__pag--active").closest(".slide-pack__pags").siblings("[data-slider-pos]").attr("data-slider-pos",t(this).attr("data-pag-pos"))});var l=t("#tablet").attr("data-mob-x1"),d=t("#tablet").attr("data-mob-x2"),c=t("#tablet").attr("data-mob-x3"),f=t("#tablet").attr("data-tab-x1"),u=t("#tablet").attr("data-tab-x2"),h=t("#tablet").attr("data-tab-x3");window.devicePixelRatio>=3?t("html").hasClass("mobile")?t("#tablet").attr("data-original",c):t("#tablet").attr("data-original",h):window.devicePixelRatio>=2?t("html").hasClass("mobile")?t("#tablet").attr("data-original",d):t("#tablet").attr("data-original",u):t("html").hasClass("mobile")?t("#tablet").attr("data-original",l):t("#tablet").attr("data-original",f),t("#tablet").lazyload({threshold:200,effect:"fadeIn"}),t("body").on("click",".wd-slider__pag",function(e){e.preventDefault(),t(this).addClass("wd-slider__pag--active").siblings().removeClass("wd-slider__pag--active"),1===t(this).index()?t(this).closest(".wd-slider").addClass("wd-slider--two"):t(this).closest(".wd-slider").removeClass("wd-slider--two")})}),$("#yaMap").length){ymaps.ready(init);var map,point}