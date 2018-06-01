/*
 * created by liuchaorun
 * Date 2018/6/1
 * Time 17:18
 **/
// let map = new BMap.Map("container");
// // 创建地图实例
// let point = new BMap.Point(100,4.3);
// // 创建点坐标
// map.centerAndZoom(point, 8.9);
// // 初始化地图，设置中心点坐标和地图级别
// map.enableScrollWheelZoom(true);
// // let geoc = new BMap.Geocoder();
// //
// // map.addEventListener("click", function(e){
// //     //通过点击百度地图，可以获取到对应的point, 由point的lng、lat属性就可以获取对应的经度纬度
// //     let pt = e.point;
// //     geoc.getLocation(pt, function(rs){
// //         //addressComponents对象可以获取到详细的地址信息
// //         let addComp = rs.addressComponents;
// //         let site = addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber;
// //         //将对应的HTML元素设置值
// //         console.log(site);
// //         console.log(pt.lng);
// //         console.log(pt.lat);
// //     });
// // });
// let styleOptions = {
//     //strokeColor:"red",    //边线颜色。
//     //fillColor:"red",      //填充颜色。当参数为空时，圆形将没有填充效果。
//     strokeWeight: 1,       //边线的宽度，以像素为单位。
//     strokeOpacity: 0.5,    //边线透明度，取值范围0 - 1。
//     fillOpacity: 0,      //填充的透明度，取值范围0 - 1。
//     strokeStyle: 'solid' //边线的样式，solid或dashed。
// };
// let polygon = new BMap.Polygon([
//     new BMap.Point(101,5),
//     new BMap.Point(101,3),
//     new BMap.Point(99,3),
//     new BMap.Point(99,5)
// ], styleOptions);  //创建多边形
// map.addOverlay(polygon);   //增加多边形

var data = [//自定义数据
    {latitude: 34.27563, longitude: 108.99059,stationType: 01,getTime:'2017-09-29 10:35:01'},//stationType站点类型：00普通站点、01起点、02终点
    {latitude: 34.276365, longitude: 108.980291,stationType: 00,getTime:'2017-09-29 10:36:45'},
    {latitude: 34.276361, longitude: 108.969296,stationType: 00,getTime:'2017-09-29 10:36:55'},
    {latitude: 34.276164, longitude: 108.953575,stationType: 00,getTime:'2017-09-29 10:38:04'},
    {latitude: 34.287457, longitude: 108.953593,stationType: 00,getTime:'2017-09-29 10:39:05'}
];

var map = new BMap.Map("container");    // 创建Map实例
map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
map.centerAndZoom(new BMap.Point(data[2].longitude,data[2].latitude), 16);  // 初始化地图,设置中心点坐标和地图级别

var points = getPoints(data);//获取data数据中的经纬度点并格式化点为BMap点
var times = getTimes(data);//获取data数据中的经纬度点的时间差（单位毫秒）
var allPoints = [];


//用站点画出公交路线，参数：站点、线路颜色、线路宽度、透明度
var polyline = new BMap.Polyline(points, {strokeColor:"#5298ff", strokeWeight:6, strokeOpacity:0.8});
map.addOverlay(polyline);

for(var i = 1; i < points.length; i++){//将所有的点分割为n个小点,用于移动过度动画
    allPoints.push.apply(allPoints,getPoins(points[i-1],points[i],500));
}

var icon = new BMap.Icon("bus.png",new BMap.Size(50,28),{anchor: new BMap.Size(25,23)});//声明公交icon
var mkrBus =new BMap.Marker(allPoints[0], { icon: icon});//声明公交标注

move(allPoints,points,times);//参数：allPoints分割点、points实际数据点、每个点的时间差（单位：毫秒）

//添加站点、起点、终点marker
for(var j = 1;j<data.length; j++){
    var prvePoint = new BMap.Point(data[j-1].longitude,data[j-1].latitude);
    var newPoint = new BMap.Point(data[j].longitude,data[j].latitude);
    addMarker(data[j-1].stationType,prvePoint);
}
addMarker(data[data.length-1].stationType,new BMap.Point(data[data.length-1].longitude,data[data.length-1].latitude));

/**
 *获取data数据中的经纬度点并格式化点为BMap点
 *@param data数据
 *@return points BMap经纬点数组
 */
function getPoints(data){
    var points = [];
    for (var i = 0; i < data.length; i++) {
        var x = data[i].longitude;
        var y = data[i].latitude;
        points[i] = new BMap.Point(x,y);

    }
    return points;
}

/**
 *获取data数据中的经纬度点的时间差（单位毫秒）
 *@param data数据
 *@return times 时间差数组
 */
function getTimes(data){
    var times = [];
    for (var i = 1; i < data.length; i++) {
        var d1 = new Date(data[i-1].getTime);
        var d2 = new Date(data[i].getTime);
        times[i-1] = parseInt(d2 - d1);

    }
    return times;
}

/**
 *添加起点、终点、站点和公交标注
 *@param type 类型，站点00、起点01、终点02
 *@param point BMap经纬点
 */
function addMarker(type,point){
    if(type == "00"){
        //创建图标 size定义Icon大小，anchor定义偏移量
        var icon00 = new BMap.Icon("stationPoint.png",new BMap.Size(14,14),{anchor: new BMap.Size(7,10)});
        var mkr00 =new BMap.Marker(point, { icon: icon00});//创建标注
        map.addOverlay(mkr00);//将标注添加到地图上
    }else if(type == "01"){
        var icon01 = new BMap.Icon("start.png",new BMap.Size(32,32),{anchor: new BMap.Size(16,28)});
        var mkr01 =new BMap.Marker(point, { icon: icon01});
        map.addOverlay(mkr01);
    }else if(type == "02"){
        var icon02 = new BMap.Icon("end.png",new BMap.Size(32,32),{anchor: new BMap.Size(16,28)});
        var mkr02 =new BMap.Marker(point, { icon: icon02});
        map.addOverlay(mkr02);
    }
}




/**
 *获取prvePoint和newPoint之间的num个点
 *@param prvePoint 起点
 *@param newPoint 终点
 *@param num 取两中间的点个数
 *@return points 两点之间的num个点的数组
 */
function getPoins(prvePoint,newPoint,num){
    var lat ;
    var lng ;
    var points = [];
    if(prvePoint.lng>newPoint.lng&&prvePoint.lat>newPoint.lat){
        lat = Math.abs(prvePoint.lat-newPoint.lat)/num;
        lng = Math.abs(prvePoint.lng-newPoint.lng)/num;
        points[0] = prvePoint;
        for(var i = 1;i<num-1;i++){
            points[i] = new BMap.Point(prvePoint.lng-lng*(i+1),prvePoint.lat-lat*(i+1));
        }
    }
    if(prvePoint.lng>newPoint.lng&&prvePoint.lat<newPoint.lat){
        lat = Math.abs(prvePoint.lat-newPoint.lat)/num;
        lng = Math.abs(prvePoint.lng-newPoint.lng)/num;
        points[0] = prvePoint;
        for(var i = 1;i<num-1;i++){
            points[i] = new BMap.Point(prvePoint.lng-lng*(i+1),prvePoint.lat+lat*(i+1));
        }
    }
    if(prvePoint.lng<newPoint.lng&&prvePoint.lat>newPoint.lat){
        lat = Math.abs(prvePoint.lat-newPoint.lat)/num;
        lng = Math.abs(prvePoint.lng-newPoint.lng)/num;
        points[0] = prvePoint;
        for(var i = 1;i<num-1;i++){
            points[i] = new BMap.Point(prvePoint.lng+lng*(i+1),prvePoint.lat-lat*(i+1));
        }
    }
    if(prvePoint.lng<newPoint.lng&&prvePoint.lat<newPoint.lat){
        lat = Math.abs(prvePoint.lat-newPoint.lat)/num;
        lng = Math.abs(prvePoint.lng-newPoint.lng)/num;
        points[0] = prvePoint;
        for(var i = 1;i<num-1;i++){
            points[i] = new BMap.Point(prvePoint.lng+lng*(i+1),prvePoint.lat+lat*(i+1));
        }
    }

    return points;
}

/**
 *@param prvePoint 起点
 *@param newPoint 终点
 *@param points 取两中间的点个数
 *@param speed 速度（单位km/h）
 *@param mkrBus 公交标标注
 */
function move(allPoints,points,times){
    var paths = allPoints.length;    //获得有几个点
    var time = times[0]/500;
    var j=0;
    mkrBus.addEventListener("click",attribute);
    function attribute(){
        alert("点击事件触发");
    }
    map.addOverlay(mkrBus);

    var label = new BMap.Label("陕A11111",{offset:new BMap.Size(0,-20)});
    label.setStyle({ border :"1px solid #e0dcd5" ,borderRadius: "5px"})
    mkrBus.setLabel(label);
    i=0;
    function resetMkPoint(i){

        if(mkrBus.getPosition().lng==points[j].lng&&mkrBus.getPosition().lat==points[j].lat){
            time = times[j]/500;
            console.log("第"+i+"个点和points比较值为："+(mkrBus.getPosition().lng==points[j].lng&&mkrBus.getPosition().lat==points[j].lat));
            console.log("每次时间为："+time);
            j++;
        }
        mkrBus.setPosition(allPoints[i]);
        if(i < paths){
            setTimeout(function(){
                i++;
                resetMkPoint(i);
            },time);
        }
    }
    setTimeout(function(){
        resetMkPoint(0);
    },time)
}