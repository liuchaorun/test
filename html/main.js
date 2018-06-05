/*
 * Created by liuchaorun
 * Date 18-6-1
 * Time 下午7:33
 **/
const base = 60 * 2;
//12小时为多少秒
let map = new BMap.Map("container");
// 创建地图实例
const speed = 7300;
//巡逻速度 米/秒
const chasedSpeed = 3650;
//被袭船逃跑速度 米/秒
const fullSpeed = 9125;
//追击速度 米/秒
const robberyTime = 100 * base / 24;
//劫船所需时间，单位秒
const changeTime = 100 * base;
//换岗时间
const areaNumber = 5;
//巡逻区域数目
const shipNumber = 10;
//巡逻船数目
const ships = [];
//巡逻船数组，存放所有巡逻船信息
const areasCenter = [];
//巡逻区域
const chasedShips = [];
//被追击的船
const usedShips = [];
//用以追击的船LDY

const areas = [
	[
		new BMap.Point(100.05, 2.94),
		new BMap.Point(100.70, 3.47),
		new BMap.Point(101.23, 2.82),
		new BMap.Point(100.58, 2.29)
	],
	[
		new BMap.Point(99.40, 4.06),
		new BMap.Point(100.05, 4.59),
		new BMap.Point(100.58, 3.94),
		new BMap.Point(99.93, 3.41)
	],
	[
		new BMap.Point(98.34, 5.36),
		new BMap.Point(98.99, 5.89),
		new BMap.Point(99.52, 5.24),
		new BMap.Point(98.87, 4.71)
	],
	[
		new BMap.Point(96.63, 6.13),
		new BMap.Point(97.28, 6.66),
		new BMap.Point(97.81, 6.01),
		new BMap.Point(97.16, 5.48)
	],
	[
		new BMap.Point(97.93, 7.19),
		new BMap.Point(98.58, 7.72),
		new BMap.Point(99.11, 7.07),
		new BMap.Point(98.46, 6.54)
	]
];//巡逻区域数组
let point = new BMap.Point(100, 4.3);
// 创建点坐标
map.centerAndZoom(point, 8.9);
// 初始化地图，设置中心点坐标和地图级别
map.enableScrollWheelZoom(true);
//允许滚轮缩放

let geo = new BMap.Geocoder();

map.addEventListener("rightclick", function (e) {
	//通过点击百度地图，可以获取到对应的point, 由point的lng、lat属性就可以获取对应的经度纬度
	let pt = e.point;
	geo.getLocation(pt, function (rs) {
		//将对应的HTML元素设置值
		let addComp = rs.addressComponents;
		if (addComp.city.length === 0) {
			document.getElementById('longitude').value = pt.lng.toString();
			document.getElementById('latitude').value = pt.lat.toString();
			if (chasedShips.length === 0) {
				let point = new BMap.Point(pt.lng, pt.lat);
				let myIcon = new BMap.Icon("./chasedShip.png", new BMap.Size(30, 30), {
					imageSize: new BMap.Size(30, 30)
				});
				// 创建标注对象并添加到地图
				let marker = new BMap.Marker(point, {icon: myIcon});
				map.addOverlay(marker);
				chasedShips.push(new chasedShip(point, marker, chasedSpeed));
			}
			else {
				let point = new BMap.Point(pt.lng, pt.lat);
				chasedShips[0].marker.setPosition(point);
				chasedShips[0].startPoint = point;
			}
		}
	});
});
//根据点击事件获取坐标

//获取巡逻区域中心点坐标
for (let i of areas) {
	areasCenter.push(new BMap.Point((i[0].lng + i[2].lng) / 2, (i[0].lat + i[2].lat) / 2));
}

let styleOptions = {
	//strokeColor:"red",    //边线颜色。
	//fillColor:"red",      //填充颜色。当参数为空时，圆形将没有填充效果。
	strokeWeight: 1,       //边线的宽度，以像素为单位。
	strokeOpacity: 0.5,    //边线透明度，取值范围0 - 1。
	fillOpacity: 0,      //填充的透明度，取值范围0 - 1。
	strokeStyle: 'solid' //边线的样式，solid或dashed。
};
//区域样式
for (let i = 0; i < areaNumber; ++i) {
	let polygon = new BMap.Polygon(areas[i], styleOptions);  //创建多边形
	map.addOverlay(polygon);   //增加多边形
}

function addMarker(point) {
	// 创建图标对象
	let myIcon = new BMap.Icon("./ship.png", new BMap.Size(30, 30), {
		imageSize: new BMap.Size(30, 30)
	});
	// 创建标注对象并添加到地图
	let marker = new BMap.Marker(point, {icon: myIcon});
	map.addOverlay(marker);
	return marker;
}

//创建所有巡逻船的实例
for (let i = 0; i < areaNumber; ++i) {
	ships.push(new ship(1, areas[i], addMarker(areas[i][0]), speed));
	ships.push(new ship(0, areas[i], addMarker(areasCenter[i]), speed));
}

//所有船开始巡航
for (let i of ships){
	i.patrol();
}
//巡逻换班
setInterval(function () {
	for (let i = 0;i<shipNumber;++i) {
		if(usedShips.length > 0 && usedShips.length < 4){
			setTimeout(function () {
                if(usedShips[0] === i || usedShips[1] === i || usedShips[2] === i || usedShips[3] === i){
                    //do nothing
                }
                else{
                    ships[i].stop();
                    ships[i].type = (ships[i].type===0?1:0);
                    ships[i].change(ships[i].type === 0?areasCenter[parseInt((i/2).toString())]:areas[parseInt((i/2).toString())][0]);
                }
            },100)
		}else{
            if(usedShips[0] === i || usedShips[1] === i || usedShips[2] === i || usedShips[3] === i){
                //do nothing
            }
            else{
                ships[i].stop();
                ships[i].type = (ships[i].type===0?1:0);
                ships[i].change(ships[i].type === 0?areasCenter[parseInt((i/2).toString())]:areas[parseInt((i/2).toString())][0]);
            }
		}
	}
},10*changeTime);

//追击函数
function chase() {
	if (chasedShips.length === 0) {
		let point = new BMap.Point(document.getElementById('longitude').value, document.getElementById('latitude').value);
		let myIcon = new BMap.Icon("./chasedShip.png", new BMap.Size(30, 30), {
			imageSize: new BMap.Size(30, 30)
		});
		// 创建标注对象并添加到地图
		let marker = new BMap.Marker(point, {icon: myIcon});
		map.addOverlay(marker);
		chasedShips.push(new chasedShip(point, marker, chasedSpeed));
	}
	else {
		let point = new BMap.Point(document.getElementById('longitude').value, document.getElementById('latitude').value);
		chasedShips[0].marker.setPosition(point);
		chasedShips[0].startPoint = point;
	}
	document.getElementById('msg').innerText = '正在劫船!';
	//获取目标船的经纬度
	let goal = new BMap.Point(document.getElementById('longitude').value, document.getElementById('latitude').value);
	let length = [];
	//计算巡逻船与目标船的距离
	for (let i = 0; i < shipNumber; ++i) {
		length.push({
			no: i,
			length: ships[i].linePixelLength(map.getMapType().getProjection().lngLatToPoint(goal))
		});
	}
	//对距离冒泡排序
	for (let i = 0; i < length.length; ++i) {
		for (let j = i; j < length.length; ++j) {
			if (length[i].length > length[j].length) {
				let temp = length[i];
				length[i] = length[j];
				length[j] = temp;
			}
		}
	}
	//取距离最近的前四个
	for (let i = 0; i < 4; ++i) {
		usedShips.push(length[i].no);
	}
	//这四艘船停止巡逻，赶往目标船地点，目标船进行劫船
	for (let i of usedShips) {
		ships[i].stop();
		ships[i].setSpeed(fullSpeed);
		ships[i].chase(chasedShips[0].marker.getPosition(), robberyTime);
	}
	//劫船完成之后的事件
	setTimeout(function () {
		let flag = 0;
		for (let i of usedShips) {
			ships[i].stop();
			if (chasedShips[0].marker.getPosition().lng === ships[i].marker.getPosition().lng && chasedShips[0].marker.getPosition().lat === ships[i].marker.getPosition().lat) {
				flag = 1;
			}
		}
		if (flag) {
			for (let i of usedShips) {
				ships[i].chase(chasedShips[0].marker.getPosition());
			}
		}
		else {
            console.log(11111);
            document.getElementById('msg').innerText = '被袭船逃跑，正在追捕！';
			getTheNearest(chasedShips[0].marker.getPosition()).then((r1) => {
				let r = map.getMapType().getProjection().lngLatToPoint(r1);
				let chasedShipPoint = map.getMapType().getProjection().lngLatToPoint(chasedShips[0].marker.getPosition());
				let pointLength = [];
				for (let i of usedShips) {
					ships[i].stop();
					let point = map.getMapType().getProjection().lngLatToPoint(ships[i].marker.getPosition());
					let c = getCos(point, chasedShipPoint, r);
					let a = fullSpeed / chasedSpeed;
					let l = Math.sqrt(Math.pow(chasedShipPoint.x - point.x, 2) + Math.pow(chasedShipPoint.y - point.y, 2));
					let le = solve(a * a - 1, 2 * c * l, -l * l);
					pointLength.push(le);
				}
				for (let i = 0; i < pointLength.length; ++i) {
					for (let j = i; j < pointLength.length; ++j) {
						if (pointLength[i].length > pointLength[j].length) {
							let temp = pointLength[i];
							pointLength[i] = pointLength[j];
							pointLength[j] = temp;
						}
					}
				}
                console.log(pointLength);
                let end = map.getMapType().getProjection().lngLatToPoint(new BMap.Point(0, 0));
				if (r.x === chasedShipPoint.x) {
					if (r.y > chasedShipPoint.y) {
						end.y = chasedShipPoint.y + pointLength[0];
					} else {
						end.y = chasedShipPoint.y - pointLength[0];
					}
					end.x = chasedShipPoint.x;
				} else {
					let k = (r.y - chasedShipPoint.y) / (r.x - chasedShipPoint.x);
					let z = r.y - k * r.x;
					let a = k * k + 1;
					let b = -2 * (chasedShipPoint.x - k * (z - chasedShipPoint.y));
					let c = chasedShipPoint.x * chasedShipPoint.x + (z - chasedShipPoint.y) * (z - chasedShipPoint.y) - pointLength[0] * pointLength[0];
					let x1 = (-b - Math.pow(b * b - 4 * a * c, 1 / 2)) / (2 * a);
					let x2 = (-b + Math.pow(b * b - 4 * a * c, 1 / 2)) / (2 * a);
					console.log(x1);
					console.log(x2);
					console.log(chasedShipPoint.x);
					console.log(r.x);
					if (x1 < r.x && x1 > chasedShipPoint.x || x1 > r.x && x1 < chasedShipPoint.x) {
						end.x = x1;
						end.y = k * x1 + z;
						console.log(end);
						console.log(r);
					}
					else if (x2 < r.x && x2 > chasedShipPoint.x || x2 > r.x && x2 < chasedShipPoint.x) {
						end.x = x2;
						end.y = k * x2 + z;
					}
					else {
						end.x = r.x;
						end.y = r.y;
					}
				}
				chasedShips[0].addPath(map.getMapType().getProjection().pointToLngLat(end));
				chasedShips[0].start();
				for (let i of usedShips) {
					ships[i].setSpeed(fullSpeed);
					ships[i].chase(map.getMapType().getProjection().pointToLngLat(end));
				}
			});
		}
	}, 10 * robberyTime);
}

//判断pt点是否为陆地，近似用是否属于某个城市
let getCity = function (pt) {
	return new Promise((resolve, reject) => {
		geo.getLocation(pt, function (rs) {
			//将对应的HTML元素设置值
			let addComp = rs.addressComponents;
			if (addComp.city.length === 0) {
				resolve(false);
			}
			else {
				resolve(true);
			}
		});
	})
};

//获得离pt点最近的陆地的point
async function getTheNearest(pt) {
	let r = 1;
	let flag = 0;
	let msg = {};
	let p = false;
	while (1) {
		for (let i = 0; i < 8; ++i) {
			let hudu = (2 * Math.PI / 360) * i * 45;
			let x = pt.lng + Math.sin(hudu) * r;
			let y = pt.lat + Math.cos(hudu) * r;
			let now = new BMap.Point(x, y);
			if (await getCity(now)) {
				flag = 1;
				msg = {
					r: r,
					i: i
				};
				break;
			}
		}
		if (flag) {
			break;
		}
		r += 1;
	}
	let hudu = (2 * Math.PI / 360) * msg.i * 45;
	let s = Math.sin(hudu);
	let c = Math.cos(hudu);
	let start = msg.r - 1;
	let end = msg.r;
	let middle = (start + end) / 2;
	while (true) {
		middle = (start + end) / 2;
		let now = new BMap.Point(pt.lng + s * middle, pt.lat + c * middle);
		if (await getCity(now)) {
			end = middle;
		}
		else {
			start = middle;
		}
		if (end - start < 0.01) {
			return now;
		}
	}
}

//解一元二次方程函数
function solve(a, b, c) {
	if ((b * b - 4 * a * c) < 0) {
		return 0;
	} else {
		let x1 = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
		let x2 = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
		if (x1 < 0 && x2 < 0) {
			return 0;
		}
		else if (x1 < 0 && x2 > 0) {
			return x2;
		}
		else {
			return x1;
		}
	}
}

//获得角p1p2p3的余弦值
function getCos(p1, p2, p3) {
	let l1 = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
	let l2 = Math.sqrt(Math.pow(p2.x - p3.x, 2) + Math.pow(p2.y - p3.y, 2));
	let l3 = Math.sqrt(Math.pow(p1.x - p3.x, 2) + Math.pow(p1.y - p3.y, 2));
	return (l1 * l1 + l2 * l2 - l3 * l3) / (2 * l1 * l2);
}

setInterval(function () {
	if(document.getElementById('flag').innerText === '1111') {
		document.getElementById('msg').innerText = '被袭船已被追捕！';
	}
},10);