/*
 * Created by liuchaorun
 * Date 18-6-1
 * Time 下午7:33
 **/
const areaNumber = 5;//巡逻区域数目
const shipNumber = 10;//巡逻船数目
const ships = [];//巡逻船数组，存放所有巡逻船信息
const areas = [
	[
		new BMap.Point(100.05,2.94),
		new BMap.Point(100.70,3.47),
		new BMap.Point(101.23,2.82),
		new BMap.Point(100.58,2.29)
	],
	[
		new BMap.Point(99.40,4.06),
		new BMap.Point(100.05,4.59),
		new BMap.Point(100.58,3.94),
		new BMap.Point(99.93,3.41)
	],
	[
		new BMap.Point(98.34,5.36),
		new BMap.Point(98.99,5.89),
		new BMap.Point(99.52,5.24),
		new BMap.Point(98.87,4.71)
	],
	[
		new BMap.Point(96.63,6.13),
		new BMap.Point(97.28,6.66),
		new BMap.Point(97.81,6.01),
		new BMap.Point(97.16,5.48)
	],
	[
		new BMap.Point(97.93,7.19),
		new BMap.Point(98.58,7.72),
		new BMap.Point(99.11,7.07),
		new BMap.Point(98.46,6.54)
	]
];//巡逻区域数组
let map = new BMap.Map("container");
// 创建地图实例
let point = new BMap.Point(100,4.3);
// 创建点坐标
map.centerAndZoom(point, 8.9);
// 初始化地图，设置中心点坐标和地图级别
map.enableScrollWheelZoom(true);
//允许滚轮缩放

let geo = new BMap.Geocoder();

map.addEventListener("rightclick", function(e){
	//通过点击百度地图，可以获取到对应的point, 由point的lng、lat属性就可以获取对应的经度纬度
	let pt = e.point;
	geo.getLocation(pt, function(){
		//将对应的HTML元素设置值
		document.getElementById('longitude').value = pt.lng.toString();
		document.getElementById('latitude').value = pt.lat.toString();
	});
});
//根据点击事件获取坐标

let styleOptions = {
    //strokeColor:"red",    //边线颜色。
    //fillColor:"red",      //填充颜色。当参数为空时，圆形将没有填充效果。
    strokeWeight: 1,       //边线的宽度，以像素为单位。
    strokeOpacity: 0.5,    //边线透明度，取值范围0 - 1。
    fillOpacity: 0,      //填充的透明度，取值范围0 - 1。
    strokeStyle: 'solid' //边线的样式，solid或dashed。
};
//区域样式
for (let i = 0;i<areaNumber;++i){
	let polygon = new BMap.Polygon(areas[i], styleOptions);  //创建多边形
	map.addOverlay(polygon);   //增加多边形
}



function addMarker(point){  // 创建图标对象
	let myIcon = new BMap.Icon("./ship.svg", new BMap.Size(1024,1024), {
		anchor: new BMap.Size(10, 25),
		imageSize:new BMap.Size(30,30)
	});
	// 创建标注对象并添加到地图
	let marker = new BMap.Marker(point, {icon: myIcon});
	map.addOverlay(marker);
	return marker;
}
// 随机向地图添加10个标注
var bounds = map.getBounds();
var lngSpan = bounds.Be - bounds.Ge;
var latSpan = bounds.Pd - bounds.Rd;
for (var i = 0; i < 10; i ++) {
	let point = new BMap.Point(bounds.Ge + lngSpan * (Math.random() * 0.7 + 0.15),
		bounds.Rd + latSpan * (Math.random() * 0.7 + 0.15));
	console.log(point);
	addMarker(point);
}