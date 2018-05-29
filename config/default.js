'use strict';

import dtime from 'time-formater'
import pinyin from 'pinyin'

global.dtime = dtime;
global.pinyin = function (ele) {
	return pinyin(ele).join('')
};
module.exports = {
	port: 8003,
	url: 'mongodb://localhost:27017/weixin',
	session: {
		name: 'UID',
		secret: 'UID',
		cookie: {
			httpOnly: true,
			secure: false,
			maxAge: 365 * 24 * 60 * 60 * 1000,
		}
	}
}