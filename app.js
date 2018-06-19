/*
 * Created by liuchaorun
 * Date 18-6-4
 * Time 下午3:13
 **/
const koa = require('koa');
const koa_static = require('koa-static');

app = new koa();

app.use(koa_static(__dirname));

app.listen(3002);