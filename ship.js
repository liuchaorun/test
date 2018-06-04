/*
 * Created by liuchaorun
 * Date 18-6-2
 * Time 下午12:14
 **/

let ship = function (type, area, marker, speed) {
	this.type = type;
	this.area = area;
	this.marker = marker;
	this.i = 0;
	this.speed = speed;
	this.path = [];
};

//开始巡航
ship.prototype.patrol = function () {
	let m = this;
	if (this.type === 1) {
		m._timeoutFlag = setTimeout(function () {
			m.moveNext(m.i);
		}, 400);
	}
};

//设置速度
ship.prototype.setSpeed = function (s) {
	let m = this;
	m.speed = s;
};

//换班函数
ship.prototype.change = function (end){
	let m = this;
	m.move(m.marker.getPosition(),end,m.marker);
	m.i = 0;
	//初始坐标
	let init_pos = map.getMapType().getProjection().lngLatToPoint(m.marker.getPosition());
		//获取结束点的(x,y)坐标
	let	target_pos = map.getMapType().getProjection().lngLatToPoint(end);
	setTimeout(function () {
		m.stop();
		if(m.type === 1){
			console.log(1);
			m.patrol();
		}
	},10*Math.round(this.getDistance(init_pos, target_pos) / (m.speed/100)))

};

//开始追击
ship.prototype.chase = function (end, t = 0) {
	if (t === 0) {
		let m = this,
			//当前的帧数
			currentCount = 0,
			//步长，米/秒
			timer = 10,
			step = m.speed / (1000 / timer),
			//初始坐标
			init_pos = map.getMapType().getProjection().lngLatToPoint(m.marker.getPosition()),
			//获取结束点的(x,y)坐标
			target_pos = map.getMapType().getProjection().lngLatToPoint(end),
			//总的步长
			count = Math.round(this.getDistance(init_pos, target_pos) / step);
		if (count < 1) {
			return;
		}
		m._intervalFlag = setInterval(function () {
			//两点之间当前帧数大于总帧数的时候，则说明已经完成移动
			if (currentCount >= count) {
				clearInterval(m._intervalFlag);
			} else {
				currentCount++;
				let x = m.tweenLinear(init_pos.x, target_pos.x, currentCount, count),
					y = m.tweenLinear(init_pos.y, target_pos.y, currentCount, count),
					pos = map.getMapType().getProjection().pointToLngLat(new BMap.Pixel(x, y));
				//设置marker
				if (currentCount === 1) {
					let proPos = m.area[(m.i - 1) % 4];
					m.setRotation(proPos, m.marker.getPosition(), end, m.marker);
				}
				//正在移动
				m.marker.setPosition(pos);
			}
		}, timer);
	}
	else {
		let m = this,
			//当前的帧数
			currentCount = 0,
			//步长，米/秒
			timer = 10,
			step = m.speed / (1000 / timer),
			//初始坐标
			init_pos = map.getMapType().getProjection().lngLatToPoint(m.marker.getPosition()),
			//获取结束点的(x,y)坐标
			target_pos = map.getMapType().getProjection().lngLatToPoint(end),
			//总的步长
			count = Math.round(this.getDistance(init_pos, target_pos) / step);
		if (count < 1) {
			return;
		}
		m._intervalFlag = setInterval(function () {
			//两点之间当前帧数大于总帧数的时候，则说明已经完成移动
			if (currentCount >= (t > count ? count : t)) {
				if (count < t) {
					document.getElementById('msg').innerText = '被袭船已被追捕！';
				}
				clearInterval(m._intervalFlag);
			} else {
				currentCount++;
				let x = m.tweenLinear(init_pos.x, target_pos.x, currentCount, count),
					y = m.tweenLinear(init_pos.y, target_pos.y, currentCount, count),
					pos = map.getMapType().getProjection().pointToLngLat(new BMap.Pixel(x, y));
				//设置marker
				if (currentCount === 1) {
					let proPos = m.area[(m.i - 1) % 4];
					m.setRotation(proPos, m.marker.getPosition(), end, m.marker);
				}
				//正在移动
				m.marker.setPosition(pos);
			}
		}, timer);
	}
};

//移动到下一个节点
ship.prototype.moveNext = function (index) {
	this.move(this.area[index % 4], this.area[(index + 1) % 4], this.marker);
};

//暂停巡航，执行任务
ship.prototype.stop = function () {
	let m = this;
	clearInterval(m._intervalFlag);
};

//移动函数
ship.prototype.move = function (initPos, targetPos, nowMarker) {
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
		if (currentCount >= count) {
			clearInterval(m._intervalFlag);
			m.moveNext(++m.i);
		} else {
			currentCount++;
			let x = m.tweenLinear(init_pos.x, target_pos.x, currentCount, count),
				y = m.tweenLinear(init_pos.y, target_pos.y, currentCount, count),
				pos = map.getMapType().getProjection().pointToLngLat(new BMap.Pixel(x, y));
			//设置marker
			if (currentCount === 1) {
				let proPos = m.area[(m.i - 1) % 4];
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
ship.prototype.getDistance = function (pxA, pxB) {
	return Math.sqrt(Math.pow(pxA.x - pxB.x, 2) + Math.pow(pxA.y - pxB.y, 2));
};

/**
 *在每个点的真实步骤中设置小船转动的角度
 */
ship.prototype.setRotation = function (prePos, curPos, targetPos, nowMarker) {
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
ship.prototype.tweenLinear = function (initPos, targetPos, currentCount, count) {
	let b = initPos, c = targetPos - initPos, t = currentCount,
		d = count;
	return c * t / d + b;
};

ship.prototype.linePixelLength = function (to) {
	let from = map.getMapType().getProjection().lngLatToPoint(this.marker.getPosition());
	return Math.sqrt(Math.abs(from.x - to.x) * Math.abs(from.x - to.x) + Math.abs(from.y - to.y) * Math.abs(from.y - to.y));
};