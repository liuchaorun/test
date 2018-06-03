/*
 * Created by liuchaorun
 * Date 18-6-2
 * Time 下午2:20
 **/
let chasedShip = function (startPoint, marker, speed) {
	this.startPoint = startPoint;
	this.marker = marker;
	this.speed = speed;
	this.path = [];
	this.i = 0;
};

chasedShip.prototype.start = function () {
	let m = this;
	m._timeoutFlag = setTimeout(function () {
		m.moveNext(m.i);
	}, 400);
};

chasedShip.prototype.addPath = function (p) {
	this.path.push(p);
};

chasedShip.prototype.moveNext = function (index) {
	let m = this;
	if (index === 0) {
		m.move(m.startPoint, m.path[index], m.marker);
	}
	else if (index <= this.path) {
		m.move(m.path[index - 1], m.path[index], m.marker);
	}
};

//移动函数
chasedShip.prototype.move = function (initPos, targetPos, nowMarker) {
	let m = this,
		//当前的帧数
		currentCount = 0,
		//步长，米/秒
		timer = 10,
		step = m.speed / (1000 / timer),
		//初始坐标
		init_pos = map.getMapType().getProjection().lngLatToPoint(initPos),
		//获取结束点的(x,y)坐标
		target_pos = map.getMapType().getProjection().lngLatToPoint(targetPos),
		//总的步长
		count = Math.round(this.getDistance(init_pos, target_pos) / step);
	if (count < 1) {
		this.moveNext(++m.i);
		return;
	}
	m._intervalFlag = setInterval(function () {
		//两点之间当前帧数大于总帧数的时候，则说明已经完成移动
		if (currentCount >= (count > m.chasedCount ? m.chasedCount : count)) {
			clearInterval(m._intervalFlag);
			m.moveNext(++m.i);
		} else {
			currentCount++;
			let x = m.tweenLinear(init_pos.x, target_pos.x, currentCount, count),
				y = m.tweenLinear(init_pos.y, target_pos.y, currentCount, count),
				pos = map.getMapType().getProjection().pointToLngLat(new BMap.Pixel(x, y));
			//设置marker
			if (currentCount === 1) {
				let proPos = null;
				if (m.i - 1 >= 0) {
					proPos = m.path[m.i - 1];
				}
				m.setRotation(proPos, initPos, targetPos, nowMarker);
			}
			//正在移动
			nowMarker.setPosition(pos);
		}
	}, timer);
};
/**
 * 计算两点间的距离
 * @param {Point} poi 经纬度坐标A点.
 * @param {Point} poi 经纬度坐标B点.
 * @return 无返回值.
 */
chasedShip.prototype.getDistance = function (pxA, pxB) {
	return Math.sqrt(Math.pow(pxA.x - pxB.x, 2) + Math.pow(pxA.y - pxB.y, 2));
};

/**
 *在每个点的真实步骤中设置小船转动的角度
 */
chasedShip.prototype.setRotation = function (prePos, curPos, targetPos, nowMarker) {
	let deg = 0;
	let m = this;
	//start!
	curPos = map.pointToPixel(curPos);
	targetPos = map.pointToPixel(targetPos);

	if (targetPos.x !== curPos.x) {
		let tan = (targetPos.y - curPos.y) / (targetPos.x - curPos.x),
			atan = Math.atan(tan);
		deg = atan * 360 / (2 * Math.PI);
		if (targetPos.x < curPos.x) {
			deg = -deg + 90 + 90;

		} else {
			deg = -deg;
		}
		nowMarker.setRotation(-deg);

	} else {
		let disy = targetPos.y - curPos.y;
		let bias = 0;
		if (disy > 0)
			bias = -1;
		else
			bias = 1;
		nowMarker.setRotation(-bias * 90);
	}
	return;

};

// 缓动效果 : 初始坐标，目标坐标，当前的步长，总的步长
chasedShip.prototype.tweenLinear = function (initPos, targetPos, currentCount, count) {
	let b = initPos, c = targetPos - initPos, t = currentCount,
		d = count;
	return c * t / d + b;
};

chasedShip.prototype.linePixelLength = function (to) {
	let from = map.getMapType().getProjection().lngLatToPoint(this.marker.getPosition());
	return Math.sqrt(Math.abs(from.x - to.x) * Math.abs(from.x - to.x) + Math.abs(from.y - to.y) * Math.abs(from.y - to.y));
};