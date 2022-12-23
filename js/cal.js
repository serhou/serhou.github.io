//跨浏览器DOM对象
var DOMUtil = {
	getStyle: function (node, attr) {
		return node.currentStyle ? node.currentStyle[attr] : getComputedStyle(node, 0)[attr];
	},
	getScroll: function () { //获取滚动条的滚动距离
		var scrollPos = {};
		if (window.pageYOffset || window.pageXOffset) {
			scrollPos['top'] = window.pageYOffset;
			scrollPos['left'] = window.pageXOffset;
		} else if (document.compatMode && document.compatMode != 'BackCompat') {
			scrollPos['top'] = document.documentElement.scrollTop;
			scrollPos['left'] = document.documentElement.scrollLeft;
		} else if (document.body) {
			scrollPos['top'] = document.body.scrollTop;
			scrollPos['left'] = document.body.scrollLeft;
		}
		return scrollPos;
	},
	getClient: function () { //获取浏览器的可视区域位置
		var l, t, w, h;
		l = document.documentElement.scrollLeft || document.body.scrollLeft;
		t = document.documentElement.scrollTop || document.body.scrollTop;
		w = document.documentElement.clientWidth;
		h = document.documentElement.clientHeight;
		return {
			'left': l,
			'top': t,
			'width': w,
			'height': h
		};
	},
	getNextElement: function (node) { //获取下一个节点
		if (node.nextElementSibling) {
			return node.nextElementSibling;
		} else {
			var NextElementNode = node.nextSibling;
			while (NextElementNode.nodeValue != null) {
				NextElementNode = NextElementNode.nextSibling
			}
			return NextElementNode;
		}
	},
	getElementById: function (idName) {
		return document.getElementById(idName);
	},
	getElementsByClassName: function (className, context, tagName) { //根据class获取节点
		if (typeof context == 'string') {
			tagName = context;
			context = document;
		} else {
			context = context || document;
			tagName = tagName || '*';
		}
		if (context.getElementsByClassName) {
			return context.getElementsByClassName(className);
		}
		var nodes = context.getElementsByTagName(tagName);
		var results = [];
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			var classNames = node.className.split(' ');
			for (var j = 0; j < classNames.length; j++) {
				if (classNames[j] == className) {
					results.push(node);
					break;
				}
			}
		}
		return results;
	},
	addClass: function (node, classname) { //对节点增加class
		if (!new RegExp("(^|\s+)" + classname).test(node.className)) {
			node.className = (node.className + " " + classname).replace(/^\s+|\s+$/g, '');
		}
	},
	removeClass: function (node, classname) { //对节点删除class
		node.className = (node.className.replace(classname, "")).replace(/^\s+|\s+$/g, '');
	}
};


var getData = (function () {
	//公历农历转换
	var calendar = {
		lunarInfo: [0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
			0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
			0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
			0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
			0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
			0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
			0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
			0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
			0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
			0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
			0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
			0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
			0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
			0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
			0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
			0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
			0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
			0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
			0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
			0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
			0x0d520
		],
		//公历每个月份的天数普通表
		solarMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
		//天干地支之天干速查表  ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"]
		Gan: ["\u7532", "\u4e59", "\u4e19", "\u4e01", "\u620a", "\u5df1", "\u5e9a", "\u8f9b", "\u58ec", "\u7678"],
		//天干地支之地支速查表 ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"]
		Zhi: ["\u5b50", "\u4e11", "\u5bc5", "\u536f", "\u8fb0", "\u5df3", "\u5348", "\u672a", "\u7533", "\u9149", "\u620c", "\u4ea5"],
		//干地支之地支速查表<=>生肖 ["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"]
		Animals: ["\u9f20", "\u725b", "\u864e", "\u5154", "\u9f99", "\u86c7", "\u9a6c", "\u7f8a", "\u7334", "\u9e21", "\u72d7", "\u732a"],
		//24节气速查表 ["小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至"]
		solarTerm: ["\u5c0f\u5bd2", "\u5927\u5bd2", "\u7acb\u6625", "\u96e8\u6c34", "\u60ca\u86f0", "\u6625\u5206", "\u6e05\u660e", "\u8c37\u96e8", "\u7acb\u590f", "\u5c0f\u6ee1", "\u8292\u79cd", "\u590f\u81f3", "\u5c0f\u6691", "\u5927\u6691", "\u7acb\u79cb", "\u5904\u6691", "\u767d\u9732", "\u79cb\u5206", "\u5bd2\u9732", "\u971c\u964d", "\u7acb\u51ac", "\u5c0f\u96ea", "\u5927\u96ea", "\u51ac\u81f3"],
		//1900-2100各年的24节气日期速查表
		sTermInfo: ['9778397bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e', '97bcf97c3598082c95f8c965cc920f',
			'97bd0b06bdb0722c965ce1cfcc920f', 'b027097bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e',
			'97bcf97c359801ec95f8c965cc920f', '97bd0b06bdb0722c965ce1cfcc920f', 'b027097bd097c36b0b6fc9274c91aa',
			'97b6b97bd19801ec9210c965cc920e', '97bcf97c359801ec95f8c965cc920f', '97bd0b06bdb0722c965ce1cfcc920f',
			'b027097bd097c36b0b6fc9274c91aa', '9778397bd19801ec9210c965cc920e', '97b6b97bd19801ec95f8c965cc920f',
			'97bd09801d98082c95f8e1cfcc920f', '97bd097bd097c36b0b6fc9210c8dc2', '9778397bd197c36c9210c9274c91aa',
			'97b6b97bd19801ec95f8c965cc920e', '97bd09801d98082c95f8e1cfcc920f', '97bd097bd097c36b0b6fc9210c8dc2',
			'9778397bd097c36c9210c9274c91aa', '97b6b97bd19801ec95f8c965cc920e', '97bcf97c3598082c95f8e1cfcc920f',
			'97bd097bd097c36b0b6fc9210c8dc2', '9778397bd097c36c9210c9274c91aa', '97b6b97bd19801ec9210c965cc920e',
			'97bcf97c3598082c95f8c965cc920f', '97bd097bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa',
			'97b6b97bd19801ec9210c965cc920e', '97bcf97c3598082c95f8c965cc920f', '97bd097bd097c35b0b6fc920fb0722',
			'9778397bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e', '97bcf97c359801ec95f8c965cc920f',
			'97bd097bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e',
			'97bcf97c359801ec95f8c965cc920f', '97bd097bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa',
			'97b6b97bd19801ec9210c965cc920e', '97bcf97c359801ec95f8c965cc920f', '97bd097bd07f595b0b6fc920fb0722',
			'9778397bd097c36b0b6fc9210c8dc2', '9778397bd19801ec9210c9274c920e', '97b6b97bd19801ec95f8c965cc920f',
			'97bd07f5307f595b0b0bc920fb0722', '7f0e397bd097c36b0b6fc9210c8dc2', '9778397bd097c36c9210c9274c920e',
			'97b6b97bd19801ec95f8c965cc920f', '97bd07f5307f595b0b0bc920fb0722', '7f0e397bd097c36b0b6fc9210c8dc2',
			'9778397bd097c36c9210c9274c91aa', '97b6b97bd19801ec9210c965cc920e', '97bd07f1487f595b0b0bc920fb0722',
			'7f0e397bd097c36b0b6fc9210c8dc2', '9778397bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e',
			'97bcf7f1487f595b0b0bb0b6fb0722', '7f0e397bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa',
			'97b6b97bd19801ec9210c965cc920e', '97bcf7f1487f595b0b0bb0b6fb0722', '7f0e397bd097c35b0b6fc920fb0722',
			'9778397bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e', '97bcf7f1487f531b0b0bb0b6fb0722',
			'7f0e397bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e',
			'97bcf7f1487f531b0b0bb0b6fb0722', '7f0e397bd07f595b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa',
			'97b6b97bd19801ec9210c9274c920e', '97bcf7f0e47f531b0b0bb0b6fb0722', '7f0e397bd07f595b0b0bc920fb0722',
			'9778397bd097c36b0b6fc9210c91aa', '97b6b97bd197c36c9210c9274c920e', '97bcf7f0e47f531b0b0bb0b6fb0722',
			'7f0e397bd07f595b0b0bc920fb0722', '9778397bd097c36b0b6fc9210c8dc2', '9778397bd097c36c9210c9274c920e',
			'97b6b7f0e47f531b0723b0b6fb0722', '7f0e37f5307f595b0b0bc920fb0722', '7f0e397bd097c36b0b6fc9210c8dc2',
			'9778397bd097c36b0b70c9274c91aa', '97b6b7f0e47f531b0723b0b6fb0721', '7f0e37f1487f595b0b0bb0b6fb0722',
			'7f0e397bd097c35b0b6fc9210c8dc2', '9778397bd097c36b0b6fc9274c91aa', '97b6b7f0e47f531b0723b0b6fb0721',
			'7f0e27f1487f595b0b0bb0b6fb0722', '7f0e397bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa',
			'97b6b7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722', '7f0e397bd097c35b0b6fc920fb0722',
			'9778397bd097c36b0b6fc9274c91aa', '97b6b7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722',
			'7f0e397bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa', '97b6b7f0e47f531b0723b0b6fb0721',
			'7f0e27f1487f531b0b0bb0b6fb0722', '7f0e397bd07f595b0b0bc920fb0722', '9778397bd097c36b0b6fc9274c91aa',
			'97b6b7f0e47f531b0723b0787b0721', '7f0e27f0e47f531b0b0bb0b6fb0722', '7f0e397bd07f595b0b0bc920fb0722',
			'9778397bd097c36b0b6fc9210c91aa', '97b6b7f0e47f149b0723b0787b0721', '7f0e27f0e47f531b0723b0b6fb0722',
			'7f0e397bd07f595b0b0bc920fb0722', '9778397bd097c36b0b6fc9210c8dc2', '977837f0e37f149b0723b0787b0721',
			'7f07e7f0e47f531b0723b0b6fb0722', '7f0e37f5307f595b0b0bc920fb0722', '7f0e397bd097c35b0b6fc9210c8dc2',
			'977837f0e37f14998082b0787b0721', '7f07e7f0e47f531b0723b0b6fb0721', '7f0e37f1487f595b0b0bb0b6fb0722',
			'7f0e397bd097c35b0b6fc9210c8dc2', '977837f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721',
			'7f0e27f1487f531b0b0bb0b6fb0722', '7f0e397bd097c35b0b6fc920fb0722', '977837f0e37f14998082b0787b06bd',
			'7f07e7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722', '7f0e397bd097c35b0b6fc920fb0722',
			'977837f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722',
			'7f0e397bd07f595b0b0bc920fb0722', '977837f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721',
			'7f0e27f1487f531b0b0bb0b6fb0722', '7f0e397bd07f595b0b0bc920fb0722', '977837f0e37f14998082b0787b06bd',
			'7f07e7f0e47f149b0723b0787b0721', '7f0e27f0e47f531b0b0bb0b6fb0722', '7f0e397bd07f595b0b0bc920fb0722',
			'977837f0e37f14998082b0723b06bd', '7f07e7f0e37f149b0723b0787b0721', '7f0e27f0e47f531b0723b0b6fb0722',
			'7f0e397bd07f595b0b0bc920fb0722', '977837f0e37f14898082b0723b02d5', '7ec967f0e37f14998082b0787b0721',
			'7f07e7f0e47f531b0723b0b6fb0722', '7f0e37f1487f595b0b0bb0b6fb0722', '7f0e37f0e37f14898082b0723b02d5',
			'7ec967f0e37f14998082b0787b0721', '7f07e7f0e47f531b0723b0b6fb0722', '7f0e37f1487f531b0b0bb0b6fb0722',
			'7f0e37f0e37f14898082b0723b02d5', '7ec967f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721',
			'7f0e37f1487f531b0b0bb0b6fb0722', '7f0e37f0e37f14898082b072297c35', '7ec967f0e37f14998082b0787b06bd',
			'7f07e7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722', '7f0e37f0e37f14898082b072297c35',
			'7ec967f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722',
			'7f0e37f0e366aa89801eb072297c35', '7ec967f0e37f14998082b0787b06bd', '7f07e7f0e47f149b0723b0787b0721',
			'7f0e27f1487f531b0b0bb0b6fb0722', '7f0e37f0e366aa89801eb072297c35', '7ec967f0e37f14998082b0723b06bd',
			'7f07e7f0e47f149b0723b0787b0721', '7f0e27f0e47f531b0723b0b6fb0722', '7f0e37f0e366aa89801eb072297c35',
			'7ec967f0e37f14998082b0723b06bd', '7f07e7f0e37f14998083b0787b0721', '7f0e27f0e47f531b0723b0b6fb0722',
			'7f0e37f0e366aa89801eb072297c35', '7ec967f0e37f14898082b0723b02d5', '7f07e7f0e37f14998082b0787b0721',
			'7f07e7f0e47f531b0723b0b6fb0722', '7f0e36665b66aa89801e9808297c35', '665f67f0e37f14898082b0723b02d5',
			'7ec967f0e37f14998082b0787b0721', '7f07e7f0e47f531b0723b0b6fb0722', '7f0e36665b66a449801e9808297c35',
			'665f67f0e37f14898082b0723b02d5', '7ec967f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721',
			'7f0e36665b66a449801e9808297c35', '665f67f0e37f14898082b072297c35', '7ec967f0e37f14998082b0787b06bd',
			'7f07e7f0e47f531b0723b0b6fb0721', '7f0e26665b66a449801e9808297c35', '665f67f0e37f1489801eb072297c35',
			'7ec967f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722'
		],
		//数字转中文速查表 ['日','一','二','三','四','五','六','七','八','九','十']
		nStr1: ["\u65e5", "\u4e00", "\u4e8c", "\u4e09", "\u56db", "\u4e94", "\u516d", "\u4e03", "\u516b", "\u4e5d", "\u5341"],
		//日期转农历称呼速查表 ['初','十','廿','卅']
		nStr2: ["\u521d", "\u5341", "\u5eff", "\u5345"],
		//月份转农历称呼速查表 ['正','一','二','三','四','五','六','七','八','九','十','冬','腊']
		nStr3: ["\u6b63", "\u4e8c", "\u4e09", "\u56db", "\u4e94", "\u516d", "\u4e03", "\u516b", "\u4e5d", "\u5341", "\u51ac", "\u814a"],
		//返回农历y年一整年的总天数
		lYearDays: function (y) {
			var i, sum = 348;
			for (i = 0x8000; i > 0x8; i >>= 1) {
				sum += (calendar.lunarInfo[y - 1900] & i) ? 1 : 0;
			}
			return (sum + calendar.leapDays(y));
		},
		//返回农历y年闰月是哪个月；若y年没有闰月 则返回0
		leapMonth: function (y) {
			return (calendar.lunarInfo[y - 1900] & 0xf);
		},
		//返回农历y年闰月的天数 若该年没有闰月则返回0
		leapDays: function (y) {
			if (calendar.leapMonth(y)) {
				return ((calendar.lunarInfo[y - 1900] & 0x10000) ? 30 : 29);
			}
			return (0);
		},
		//返回农历y年m月（非闰月）的总天数，计算m为闰月时的天数请使用leapDays方法
		monthDays: function (y, m) {
			if (m > 12 || m < 1) {
				return -1
			}
			return ((calendar.lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29);
		},
		//返回公历(!)y年m月的天数
		solarDays: function (y, m) {
			if (m > 12 || m < 1) {
				return -1
			}
			var ms = m - 1;
			if (ms == 1) {
				return (((y % 4 == 0) && (y % 100 != 0) || (y % 400 == 0)) ? 29 : 28);
			} else {
				return (calendar.solarMonth[ms]);
			}
		},
		//公历月、日判断所属星座
		toAstro: function(cMonth,cDay) {
			//魔羯水瓶双鱼白羊金牛双子巨蟹狮子处女天秤天蝎射手魔羯
			var s   = "\u9b54\u7faf\u6c34\u74f6\u53cc\u9c7c\u767d\u7f8a\u91d1\u725b\u53cc\u5b50\u5de8\u87f9\u72ee\u5b50\u5904\u5973\u5929\u79e4\u5929\u874e\u5c04\u624b\u9b54\u7faf";
			var arr = [20,19,21,21,21,22,23,23,23,23,22,22];
			return s.substr(cMonth*2 - (cDay < arr[cMonth-1] ? 2 : 0),2);
		},
		//传入offset偏移量返回干支
		toGanZhi: function (offset) {
			return (calendar.Gan[offset % 10] + calendar.Zhi[offset % 12]);
		},
		//传入公历(!)y年获得该年第n个节气的公历日期
		getTerm: function (y, n) {
			if (y < 1900 || y > 2100) {
				return -1;
			}
			if (n < 1 || n > 24) {
				return -1;
			}
			var _table = calendar.sTermInfo[y - 1900];
			var _info = [
				parseInt('0x' + _table.substr(0, 5)).toString(),
				parseInt('0x' + _table.substr(5, 5)).toString(),
				parseInt('0x' + _table.substr(10, 5)).toString(),
				parseInt('0x' + _table.substr(15, 5)).toString(),
				parseInt('0x' + _table.substr(20, 5)).toString(),
				parseInt('0x' + _table.substr(25, 5)).toString()
			];
			var _calday = [
				_info[0].substr(0, 1),
				_info[0].substr(1, 2),
				_info[0].substr(3, 1),
				_info[0].substr(4, 2),
				_info[1].substr(0, 1),
				_info[1].substr(1, 2),
				_info[1].substr(3, 1),
				_info[1].substr(4, 2),
				_info[2].substr(0, 1),
				_info[2].substr(1, 2),
				_info[2].substr(3, 1),
				_info[2].substr(4, 2),
				_info[3].substr(0, 1),
				_info[3].substr(1, 2),
				_info[3].substr(3, 1),
				_info[3].substr(4, 2),
				_info[4].substr(0, 1),
				_info[4].substr(1, 2),
				_info[4].substr(3, 1),
				_info[4].substr(4, 2),
				_info[5].substr(0, 1),
				_info[5].substr(1, 2),
				_info[5].substr(3, 1),
				_info[5].substr(4, 2),
			];
			return parseInt(_calday[n - 1]);
		},
		//传入农历数字月份返回汉语通俗表示法
		toChinaMonth: function (m) {
			if (m > 12 || m < 1) {
				return -1
			}
			var s = calendar.nStr3[m - 1];
			s += "\u6708";
			return s;
		},
		//传入农历日期数字返回汉字表示法
		toChinaDay: function (d) {
			var s;
			switch (d) {
				case 10:
					s = '\u521d\u5341';
					break;
				case 20:
					s = '\u4e8c\u5341';
					break;
				case 30:
					s = '\u4e09\u5341';
					break;
				default:
					s = calendar.nStr2[Math.floor(d / 10)];
					s += calendar.nStr1[d % 10];
			}
			return (s);
		},
		//年份转生肖[!仅能大致转换] => 精确划分生肖分界线是“立春”
		getAnimal: function (y) {
			return calendar.Animals[(y - 4) % 12]
		},
		//传入阳历年月日获得详细的公历、农历object信息 <=>JSON 公历转农历：calendar.solar2lunar(1987,11,01);
		solar2lunar: function (y, m, d) {//参数区间1900.1.31~2100.12.31
			//年份限定、上限
			if (y < 1900 || y > 2100) {
				return -1;// undefined转换为数字变为NaN
			}
			//公历传参最下限
			if (y == 1900 && m == 1 && d < 31) {
				return -1;
			}
		    //未传参  获得当天
			if (!y) {
				var objDate = new Date();
			} else {
				var objDate = new Date(y, parseInt(m) - 1, d)
			}
			var i, leap = 0,
				temp = 0;
			//修正ymd参数
			var y = objDate.getFullYear(),
				m = objDate.getMonth() + 1,
				d = objDate.getDate();
			var offset = (Date.UTC(objDate.getFullYear(), objDate.getMonth(), objDate.getDate()) - Date.UTC(1900, 0, 31)) / 86400000;
			for (i = 1900; i < 2101 && offset > 0; i++) {
				temp = calendar.lYearDays(i);
				offset -= temp;
			}
			if (offset < 0) {
				offset += temp;
				i--;
			}
			//是否今天
			var isTodayObj = new Date(),
				isToday = false;
			if (isTodayObj.getFullYear() == y && isTodayObj.getMonth() + 1 == m && isTodayObj.getDate() == d) {
				isToday = true;
			}
			//星期几
			var nWeek = objDate.getDay(),
				cWeek = calendar.nStr1[nWeek];
			//数字表示周几顺应天朝周一开始的惯例
			if (nWeek == 0) {
				nWeek = 7;
			}
			//农历年
			var year = i;
			var leap = calendar.leapMonth(i);//闰哪个月
			var isLeap = false;
			//效验闰月
			for (i = 1; i < 13 && offset > 0; i++) {
				//闰月
				if (leap > 0 && i == (leap + 1) && isLeap == false) {
					--i;
					isLeap = true;
					temp = calendar.leapDays(year);//计算农历闰月天数
				} else {
					temp = calendar.monthDays(year, i);//计算农历普通月天数
				}
				//解除闰月
				if (isLeap == true && i == (leap + 1)) {
					isLeap = false;
				}
				offset -= temp;
			}
			// 闰月导致数组下标重叠取反
			if (offset == 0 && leap > 0 && i == leap + 1) {
				if (isLeap) {
					isLeap = false;
				} else {
					isLeap = true;
					--i;
				}
			}
			if (offset < 0) {
				offset += temp;
				--i;
			}
			//农历月
			var month = i;
			//农历日
			var day = offset + 1;
			//天干地支处理
			var sm = m - 1;
			var term3 = calendar.getTerm(year, 3);
			var gzY = calendar.toGanZhi(year - 4);
			gzY = calendar.toGanZhi(year - 4); //modify
			//当月的两个节气
			var firstNode = calendar.getTerm(y, (m * 2 - 1));
			var secondNode = calendar.getTerm(y, (m * 2));
			//依据12节气修正干支月
			var gzM = calendar.toGanZhi((y - 1900) * 12 + m + 11);
			if (d >= firstNode) {
				gzM = calendar.toGanZhi((y - 1900) * 12 + m + 12);
			}
			//传入的日期的节气与否
			var isTerm = false;
			var Term = null;
			if (firstNode == d) {
				isTerm = true;
				Term = calendar.solarTerm[m * 2 - 2];
			}
			if (secondNode == d) {
				isTerm = true;
				Term = calendar.solarTerm[m * 2 - 1];
			}
			//日柱 当月一日与 1900/1/1 相差天数
			var dayCyclical = Date.UTC(y, sm, 1, 0, 0, 0, 0) / 86400000 + 25567 + 10;
			var gzD = calendar.toGanZhi(dayCyclical + d - 1);
			//该日期所属的星座
			var astro = calendar.toAstro(m,d);
			return {
				'lYear': year,
				'lMonth': month,
				'lDay': day,
				'Animal': calendar.getAnimal(year),
				'IMonthCn': (isLeap ? "\u95f0" : '') + calendar.toChinaMonth(month),
				'IMonthCnDays': (isLeap ? calendar.leapDays(year) : calendar.monthDays(year, month)),//农历月份天数
				'IDayCn': calendar.toChinaDay(day),
				'cYear': y,
				'cMonth': m,
				'cDay': d,
				'cAstro': astro,//星座
				'gzYear': gzY,
				'gzMonth': gzM,
				'gzDay': gzD,
				'isToday': isToday,
				'isLeap': isLeap,
				'nWeek': nWeek,
				'ncWeek': "\u661f\u671f" + cWeek,
				'isTerm': isTerm,
				'Term': Term
			};
		}
	};
	//公历节日
	var _festival1 = {
		'0101': '元旦',
		'0202': '世界湿地日',
		'0210': '国际气象节',
		'0214': '情人节',
		'0301': '国际海豹日',
		'0303': '全国爱耳日',
		'0305': '学雷锋纪念日',
		'0308': '妇女节',
		'0312': '植树节',
		'0314': '国际警察日',
		'0315': '消费者权益日',
		'0317': '中国国医节 国际航海日',
		'0321': '世界森林日 消除种族歧视国际日 世界儿歌日',
		'0322': '世界水日',
		'0323': '世界气象日',
		'0324': '世界防治结核病日',
		'0325': '全国中小学生安全教育日',
		'0401': '愚人节',
		'0407': '世界卫生日',
		'0422': '世界地球日',
		'0423': '世界图书和版权日',
		'0424': '亚非新闻工作者日',
		'0501': '劳动节',
		'0504': '青年节',
		'0515': '防治碘缺乏病日',
		'0508': '世界红十字日',
		'0512': '国际护士节',
		'0515': '国际家庭日',
		'0517': '世界电信日',
		'0518': '国际博物馆日',
		'0520': '全国学生营养日',
		'0521': '国际茶日',
		'0522': '国际生物多样性日',
		'0531': '世界无烟日',
		'0601': '国际儿童节 世界牛奶日',
		'0605': '世界环境日',
		'0606': '全国爱眼日',
		'0617': '防治荒漠化和干旱日',
		'0623': '国际奥林匹克日',
		'0625': '全国土地日',
		'0626': '国际禁毒日',
		'0701': '建党节 香港回归纪念日',
		'0702': '国际体育记者日',
		'0711': '世界人口日 航海日',
		'0801': '建军节',
		'0808': '中国男子节(爸爸节)',
		'0903': '抗日战争胜利纪念日',
		'0908': '国际扫盲日 国际新闻工作者日',
		'0910': '教师节',
		'0916': '国际臭氧层保护日',
		'0918': '九·一八事变纪念日',
		'0920': '国际爱牙日',
		'0927': '世界旅游日',
		'1001': '国庆节 国际音乐日 国际老人节',
		'1002': '国际非暴力日 国际和平与民主自由斗争日',
		'1004': '世界动物日',
		'1006': '老人节',
		'1008': '全国高血压日',
		'1005': '国际教师节',
		'1009': '世界邮政日',
		'1010': '辛亥革命纪念日 世界精神卫生日',
		'1013': '世界保健日 国际减灾日',
		'1014': '世界标准日',
		'1015': '国际盲人节(白手杖节)',
		'1016': '世界粮食日',
		'1017': '世界消除贫困日',
		'1022': '世界传统医药日',
		'1024': '联合国日 世界发展信息日',
		'1031': '世界勤俭日',
		'1107': '十月社会主义革命纪念日',
		'1108': '中国记者日',
		'1109': '全国消防安全宣传教育日',
		'1110': '世界青年节',
		'1111': '国际科学与和平周(本日所属的一周)',
		'1112': '孙中山诞辰纪念日',
		'1114': '联合国糖尿病日',
		'1117': '国际大学生节',
		'1121': '世界问候日 世界电视日',
		'1129': '国际声援巴勒斯坦人民国际日',
		'1201': '世界艾滋病日',
		'1203': '世界残疾人日',
		'1204': '宪法日',
		'1205': '国际志愿人员日',
		'1209': '世界足球日',
		'1210': '世界人权日',
		'1212': '西安事变纪念日',
		'1213': '南京大屠杀纪念日',
		'1220': '澳门回归纪念',
		'1221': '国际篮球日',
		'1223': '天津',
		'1224': '平安夜',
		'1225': '圣诞节',
		'1226': '毛泽东诞辰纪念日'
	};
	//某月的第几个星期几,第3位为5表示最后一星期
	var _festival2 = {
		'0110': '黑人日',
		'0150': '世界麻风日',
		'0440': '世界儿童日',
		'0520': '国际母亲节',
		'0532': '国际牛奶日',
		'0530': '全国助残日',
		'0630': '父亲节',
		'0711': '世界建筑日',
		'0730': '被奴役国家周',
		'0936': '世界清洁地球日',
		'0932': '国际和平日',
		'0940': '国际聋人节',
		'1011': '国际住房日',
		'1024': '世界视觉日',
		'1144': '感恩节',
		'1220': '国际儿童电视广播日'
	};
	//农历节日
	var _festival3 = {
		'0101': '春节',
		'0102': '初二',
		'0103': '初三',
		'0115': '元宵节',
		'0202': '龙抬头',
		'0323': '妈祖生辰',
		'0505': '端午节',
		'0707': '七夕节',
		'0715': '中元节',
		'0815': '中秋节',
		'0909': '重阳节',
		'1208': '腊八节',
		'1223': '小年',
		'0100': '除夕'
	};

	//假日安排数据
	var _holiday = {
		'2011': {
			'0402': 0,
			'0403': 1,
			'0404': 1,
			'0405': 1,
			'0430': 1,
			'0501': 1,
			'0502': 1,
			'0604': 1,
			'0605': 1,
			'0606': 1,
			'0910': 1,
			'0911': 1,
			'0912': 1,
			'1001': 1,
			'1002': 1,
			'1003': 1,
			'1004': 1,
			'1005': 1,
			'1006': 1,
			'1007': 1,
			'1008': 0,
			'1009': 0,
			'1231': 0
		},
		'2012': {
			'0101': 1,
			'0102': 1,
			'0103': 1,
			'0121': 0,
			'0122': 1,
			'0123': 1,
			'0124': 1,
			'0125': 1,
			'0126': 1,
			'0127': 1,
			'0128': 1,
			'0129': 0,
			'0331': 0,
			'0401': 0,
			'0402': 1,
			'0403': 1,
			'0404': 1,
			'0428': 0,
			'0429': 1,
			'0430': 1,
			'0501': 1,
			'0622': 1,
			'0623': 1,
			'0624': 1,
			'0929': 0,
			'0930': 1,
			'1001': 1,
			'1002': 1,
			'1003': 1,
			'1004': 1,
			'1005': 1,
			'1006': 1,
			'1007': 1
		},
		'2013': {
			'0101': 1,
			'0102': 1,
			'0103': 1,
			'0105': 0,
			'0106': 0,
			'0209': 1,
			'0210': 1,
			'0211': 1,
			'0212': 1,
			'0213': 1,
			'0214': 1,
			'0215': 1,
			'0216': 0,
			'0217': 0,
			'0404': 1,
			'0405': 1,
			'0406': 1,
			'0407': 0,
			'0427': 0,
			'0428': 0,
			'0429': 1,
			'0430': 1,
			'0501': 1,
			'0608': 0,
			'0609': 0,
			'0610': 1,
			'0611': 1,
			'0612': 1,
			'0919': 1,
			'0920': 1,
			'0921': 1,
			'0922': 0,
			'0929': 0,
			'1001': 1,
			'1002': 1,
			'1003': 1,
			'1004': 1,
			'1005': 1,
			'1006': 1,
			'1007': 1,
			'1012': 0
		},
		'2014': {
			'0101': 1,
			'0126': 0,
			'0131': 1,
			'0201': 1,
			'0202': 1,
			'0203': 1,
			'0203': 1,
			'0204': 1,
			'0205': 1,
			'0206': 1,
			'0208': 0,
			'0405': 1,
			'0406': 1,
			'0407': 1,
			'0501': 1,
			'0502': 1,
			'0503': 1,
			'0504': 0,
			'0531': 1,
			'0601': 1,
			'0602': 1,
			'0908': 1,
			'0928': 0,
			'1001': 1,
			'1002': 1,
			'1003': 1,
			'1004': 1,
			'1005': 1,
			'1006': 1,
			'1007': 1,
			'1011': 0
		},
		'2015': {
			'0101': 1,
			'0102': 1,
			'0103': 1,
			'0104': 0,
			'0215': 0,
			'0218': 1,
			'0219': 1,
			'0220': 1,
			'0221': 1,
			'0222': 1,
			'0223': 1,
			'0224': 1,
			'0228': 0,
			'0404': 1,
			'0405': 1,
			'0406': 1,
			'0501': 1,
			'0502': 1,
			'0503': 1,
			'0620': 1,
			'0621': 1,
			'0622': 1,
			'0903': 1,
			'0904': 1,
			'0905': 1,
			'0906': 0,
			'0927': 1,
			'1001': 1,
			'1002': 1,
			'1003': 1,
			'1004': 1,
			'1005': 1,
			'1006': 1,
			'1007': 1,
			'1010': 0
		},
		'2016': {
			'0101': 1,
			'0102': 1,
			'0103': 1,
			'0206': 0,
			'0207': 1,
			'0208': 1,
			'0209': 1,
			'0210': 1,
			'0211': 1,
			'0212': 1,
			'0213': 1,
			'0214': 0,
			'0402': 1,
			'0403': 1,
			'0404': 1,
			'0430': 1,
			'0501': 1,
			'0502': 1,
			'0609': 1,
			'0610': 1,
			'0611': 1,
			'0612': 0,
			'0915': 1,
			'0916': 1,
			'0917': 1,
			'0918': 0,
			'1001': 1,
			'1002': 1,
			'1003': 1,
			'1004': 1,
			'1005': 1,
			'1006': 1,
			'1007': 1,
			'1008': 0,
			'1009': 0
		},
		'2017': {
			'0101': 1,
			'0102': 1,
			'0122': 0,
			'0127': 1,
			'0128': 1,
			'0129': 1,
			'0130': 1,
			'0131': 1,
			'0201': 1,
			'0202': 1,
			'0204': 0,
			'0401': 0,
			'0402': 1,
			'0403': 1,
			'0404': 1,
			'0429': 1,
			'0430': 1,
			'0501': 1,
			'0527': 0,
			'0528': 1,
			'0529': 1,
			'0530': 1,
			'0930': 0,
			'1001': 1,
			'1002': 1,
			'1003': 1,
			'1004': 1,
			'1005': 1,
			'1006': 1,
			'1007': 1,
			'1008': 1,
			'1230': 1,
			'1231': 1
		},
		'2018': {
			'0101': 1,
			'0211': 0,
			'0215': 1,
			'0216': 1,
			'0217': 1,
			'0218': 1,
			'0219': 1,
			'0220': 1,
			'0221': 1,
			'0224': 0,
			'0405': 1,
			'0406': 1,
			'0407': 1,
			'0408': 0,
			'0428': 0,
			'0429': 1,
			'0430': 1,
			'0501': 1,
			'0616': 1,
			'0617': 1,
			'0618': 1,
			'0922': 1,
			'0923': 1,
			'0924': 1,
			'0929': 0,
			'0930': 0,
			'1001': 1,
			'1002': 1,
			'1003': 1,
			'1004': 1,
			'1005': 1,
			'1006': 1,
			'1007': 1,
			'1229': 0,
			'1230': 1,
			'1231': 1
		},
		'2019': {
			'0101': 1,
			'0202': 0,
			'0203': 0,
			'0204': 1,
			'0205': 1,
			'0206': 1,
			'0207': 1,
			'0208': 1,
			'0209': 1,
			'0210': 1,
			'0405': 1,
			'0406': 1,
			'0407': 1,
			'0428': 0,
			'0501': 1,
			'0502': 1,
			'0503': 1,
			'0504': 1,
			'0505': 0,
			'0607': 1,
			'0608': 1,
			'0609': 1,
			'0913': 1,
			'0914': 1,
			'0915': 1,
			'0929': 0,
			'1001': 1,
			'1002': 1,
			'1003': 1,
			'1004': 1,
			'1005': 1,
			'1006': 1,
			'1007': 1,
			'1012': 0
		},
		'2020':{'0101':1,'0119':0,'0124':1,'0125':1,'0126':1,'0127':1,'0128':1,'0129':1,'0130':1,'0131':1,'0201':1,'0202':1,'0404':1,'0405':1,'0406':1,'0426':0,'0501':1,'0502':1,'0503':1,'0504':1,'0505':1,'0509':0,'0625':1,'0626':1,'0627':1,'0628':0,'0927':0,'1001':1,'1002':1,'1003':1,'1004':1,'1005':1,'1006':1,'1007':1,'1008':1,'1010':0},
		'2021':{
			'0101':1,
			'0102':1,
			'0103':1,
			'0211':1,
			'0212':1,
			'0213':1,
			'0214':1,
			'0215':1,
			'0216':1,
			'0217':1,
			'0403':1,
			'0404':1,
			'0405':1,
			'0501':1,
			'0502':1,
			'0503':1,
			'0504':1,
			'0505':1,
			'0612':1,
			'0613':1,
			'0614':1,
			'0919':1,
			'0920':1,
			'0921':1,
			'1001':1,
			'1002':1,
			'1003':1,
			'1004':1,
			'1005':1,
			'1006':1,
			'1007':1,
			'0207':0,
			'0220':0,
			'0425':0,
			'0508':0,
			'0918':0,
			'0926':0,
			'1009':0
		},
		'2022':{
			'0101':1,
			'0102':1,
			'0103':1,
			'0129':0,
			'0130':0,
			'0131':1,
			'0201':1,
			'0202':1,
			'0203':1,
			'0204':1,
			'0205':1,
			'0206':1,
			'0402':0,
			'0403':1,
			'0404':1,
			'0405':1,
			'0424':0,
			'0430':1,
			'0501':1,
			'0502':1,
			'0503':1,
			'0504':1,
			'0507':0,
			'0603':1,
			'0604':1,
			'0605':1,
			'0910':1,
			'0911':1,
			'0912':1,
			'1001':1,
			'1002':1,
			'1003':1,
			'1004':1,
			'1005':1,
			'1006':1,
			'1007':1,
			'1008':0,
			'1009':0,
			'1231':1
		},
		'2023': {
			'0101': 1,
			'0102': 1,
			'0121': 1,
			'0122': 1,
			'0123': 1,
			'0124': 1,
			'0125': 1,
			'0126': 1,
			'0127': 1,
			'0128': 0,
			'0129': 0,
			'0405': 1,
			'0423': 0,
			'0429': 1,
			'0430': 1,
			'0501': 1,
			'0502': 1,
			'0503': 1,
			'0506': 0,
			'0622': 1,
			'0623': 1,
			'0624': 1,
			'0625': 0,
			'0929': 1,
			'0930': 1,
			'1001': 1,
			'1002': 1,
			'1003': 1,
			'1004': 1,
			'1005': 1,
			'1006': 1,
			'1007': 0,
			'1008': 0
		}		
	};
	//获取日期数据
	var getDateObj = function (year, month, day) {
		var date = arguments.length && year ? new Date(year, month - 1, day) : new Date();
		return {
			'year': date.getFullYear(),
			'month': date.getMonth() + 1,
			'day': date.getDate(),
			'week': date.getDay()
		};
	};
	//当天
	var _today = getDateObj();
	//获取当月天数
	var getMonthDays = function (obj) {
		var day = new Date(obj.year, obj.month, 0);
		return day.getDate();
	};
	if (!String.prototype.trim) {
		String.prototype.trim = function () {
			return this.replace(/^\s+|\s+$/g, '');
		};
	}
	//获取某天日期信息
	var getDateInfo = function (obj) {
		var info = calendar.solar2lunar(obj.year, obj.month, obj.day);
		var cMonth = info.cMonth > 9 ? '' + info.cMonth : '0' + info.cMonth;
		var cDay = info.cDay > 9 ? '' + info.cDay : '0' + info.cDay;
		var lMonth = info.lMonth > 9 ? '' + info.lMonth : '0' + info.lMonth;
		var lDay = info.lDay > 9 ? '' + info.lDay : '0' + info.lDay;
		var code1 = cMonth + cDay;
		var code2 = cMonth + Math.ceil(info.cDay / 7) + info.nWeek % 7;
		//除夕日进行转换，12.30大月 12.29小月
		var code3 = 12 == lMonth && lDay == info.IMonthCnDays && !info.isLeap  ? '0100' : lMonth + lDay;
		var days = getMonthDays(obj);
		//节日信息
		info['festival'] = '';
		if (_festival3[code3]) {
			info['festival'] += _festival3[code3];
		}
		if (_festival1[code1]) {
			info['festival'] += ' ' + (code1 == '1223' ?  _festival1[code1] + (obj.year -1404) + '岁生日' : _festival1[code1]);
		}
		if (_festival2[code2]) {
			info['festival'] += ' ' + _festival2[code2];
		}
		if (obj['day'] + 7 > days) {
			var code4 = cMonth + 5 + info.nWeek % 7;
			if (code4 != code2 && _festival2[code4]) {
				info['festival'] += ' ' + _festival2[code4];
			}
		}

		//黄历宜忌
		info['almanac'] = getAlmanac(obj);
		//名人名言
		if (true) {
			info['poem'] = '今日诗：' + getPoem(obj);
		}
		info['festival'] = info['festival'].trim();
		//放假、调休等标记
		info['sign'] = '';
		if (_holiday[info.cYear]) {
			var holiday = _holiday[info.cYear];
			if (typeof holiday[code1] != 'undefined') {
				info['sign'] = holiday[code1] ? 'holiday' : 'work';
			}
		}
		if (info.cYear == _today.year && info.cMonth == _today.month && info.cDay == _today.day) {
			//info['sign'] = 'today';
		}
		return info;
	};
	//获取日历信息
	return (function (date) {
		var date = date || _today;
		var first = getDateObj(date['year'], date['month'], 1); //当月第一天
		var days = getMonthDays(date); //当月天数
		var data = []; //日历信息
		var obj = {};
		//上月日期
		for (var i = first['week']; i > 0; i--) {
			obj = getDateObj(first['year'], first['month'], first['day'] - i);
			var info = getDateInfo(obj);
			info['disabled'] = 1;
			data.push(info);
		}
		//当月日期
		for (var i = 0; i < days; i++) {
			obj = {
				'year': first['year'],
				'month': first['month'],
				'day': first['day'] + i,
				'week': (first['week'] + i) % 7
			};
			var info = getDateInfo(obj);
			info['disabled'] = 0;
			data.push(info);
		}
		//下月日期
		var last = obj;
		for (var i = 1; last['week'] + i < 7; i++) {
			obj = getDateObj(last['year'], last['month'], last['day'] + i);
			var info = getDateInfo(obj);
			info['disabled'] = 1;
			data.push(info);
		}
		return {
			'date': getDateInfo(date), //当前日历选中日期
			'data': data,
			'days': days //当前月份天数
		};
	});
})();

//万年历
var $mod_calendar = DOMUtil.getElementsByClassName('mod-calendar')[0];
//var $table = DOMUtil.getElementsByClassName('table',$mod_calendar)[0];
//var $year = DOMUtil.getElementsByClassName('year',$mod_calendar)[0];
//var $month = DOMUtil.getElementsByClassName('month',$mod_calendar)[0];
//var $holiday = DOMUtil.getElementsByClassName('holiday',$mod_calendar)[0];
//var $goback = DOMUtil.getElementsByClassName('goback',$mod_calendar)[0];
//var $prev_year = DOMUtil.getElementsByClassName('prev-year',$mod_calendar)[0];
//var $next_year = DOMUtil.getElementsByClassName('next-year',$mod_calendar)[0];
//var $prev_month = DOMUtil.getElementsByClassName('prev-month',$mod_calendar)[0];
//var $next_month = DOMUtil.getElementsByClassName('next-month',$mod_calendar)[0];
var $info = DOMUtil.getElementsByClassName('info', $mod_calendar)[0];
var _data = [];
var _day = 1;
var holiday = {
	'2011': [{
			value: '2011-01-01',
			name: '元旦'
		},
		{
			value: '2011-02-03',
			name: '春节'
		},
		{
			value: '2011-04-05',
			name: '清明'
		},
		{
			value: '2011-05-01',
			name: '劳动节'
		},
		{
			value: '2011-06-06',
			name: '端午节'
		},
		{
			value: '2011-09-12',
			name: '中秋节'
		},
		{
			value: '2011-10-01',
			name: '国庆节'
		}
	],
	'2012': [{
			value: '2012-01-01',
			name: '元旦'
		},
		{
			value: '2012-01-23',
			name: '春节'
		},
		{
			value: '2012-04-04',
			name: '清明'
		},
		{
			value: '2012-05-01',
			name: '劳动节'
		},
		{
			value: '2012-06-23',
			name: '端午节'
		},
		{
			value: '2012-09-30',
			name: '中秋节'
		},
		{
			value: '2012-10-01',
			name: '国庆节'
		}
	],
	'2013': [{
			value: '2013-01-01',
			name: '元旦'
		},
		{
			value: '2013-02-10',
			name: '春节'
		},
		{
			value: '2013-04-04',
			name: '清明'
		},
		{
			value: '2013-05-01',
			name: '劳动节'
		},
		{
			value: '2013-06-12',
			name: '端午节'
		},
		{
			value: '2013-09-19',
			name: '中秋节'
		},
		{
			value: '2013-10-01',
			name: '国庆节'
		}
	],
	'2014': [{
			value: '2014-01-01',
			name: '元旦'
		},
		{
			value: '2014-01-31',
			name: '春节'
		},
		{
			value: '2014-04-05',
			name: '清明'
		},
		{
			value: '2014-05-01',
			name: '劳动节'
		},
		{
			value: '2014-06-02',
			name: '端午节'
		},
		{
			value: '2014-09-08',
			name: '中秋节'
		},
		{
			value: '2014-10-01',
			name: '国庆节'
		}
	],
	'2015': [{
			value: '2015-01-01',
			name: '元旦'
		},
		{
			value: '2015-02-19',
			name: '春节'
		},
		{
			value: '2015-04-05',
			name: '清明'
		},
		{
			value: '2015-05-01',
			name: '劳动节'
		},
		{
			value: '2015-06-20',
			name: '端午节'
		},
		{
			value: '2015-09-03',
			name: '胜利日'
		},
		{
			value: '2015-09-27',
			name: '中秋节'
		},
		{
			value: '2015-10-01',
			name: '国庆节'
		}
	],
	'2016': [{
			value: '2016-01-01',
			name: '元旦'
		},
		{
			value: '2016-02-08',
			name: '春节'
		},
		{
			value: '2016-04-04',
			name: '清明'
		},
		{
			value: '2016-05-01',
			name: '劳动节'
		},
		{
			value: '2016-06-09',
			name: '端午节'
		},
		{
			value: '2016-09-15',
			name: '中秋节'
		},
		{
			value: '2016-10-01',
			name: '国庆节'
		}
	],
	'2017': [{
			value: '2017-01-01',
			name: '元旦'
		},
		{
			value: '2017-01-28',
			name: '春节'
		},
		{
			value: '2017-04-04',
			name: '清明'
		},
		{
			value: '2017-05-01',
			name: '劳动节'
		},
		{
			value: '2017-05-30',
			name: '端午节'
		},
		{
			value: '2017-10-04',
			name: '中秋节'
		},
		{
			value: '2017-10-01',
			name: '国庆节'
		}
	],
	'2018': [{
			value: '2018-01-01',
			name: '元旦'
		},
		{
			value: '2018-02-16',
			name: '春节'
		},
		{
			value: '2018-04-05',
			name: '清明'
		},
		{
			value: '2018-05-01',
			name: '劳动节'
		},
		{
			value: '2018-06-18',
			name: '端午节'
		},
		{
			value: '2018-09-24',
			name: '中秋节'
		},
		{
			value: '2018-10-01',
			name: '国庆节'
		}
	],
	'2019': [{
			value: '2019-01-01',
			name: '元旦'
		},
		{
			value: '2019-02-05',
			name: '春节'
		},
		{
			value: '2019-04-05',
			name: '清明'
		},
		{
			value: '2019-05-01',
			name: '劳动节'
		},
		{
			value: '2019-06-07',
			name: '端午节'
		},
		{
			value: '2019-09-13',
			name: '中秋节'
		},
		{
			value: '2019-10-01',
			name: '国庆节'
		}
	]
};
var format = function (date) {
	var result = getData(date);
	var date = result['date'];
	var days = result['days'];//每月的天数
	var bigorsmall = days === 31 ? '大' : '小';
	_data = result['data'];
	var almanac = date['almanac'];
	var map = {
		'work': ' 班',
		'holiday': ' 休'
	}
	var html = '<table>\
			<thead>\
				<tr><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr>\
			</thead>\
			<tbody>\
				<tr>';
	for (var i = 0, len = _data.length; i < len; i++) {
		var item = _data[i];
		var className = '',
			className2 = '';
		if (item['sign']) {
			className += item['sign'];
		}
		if (item['disabled']) {
			className += ' disabled';
		}
		if (date && item['cMonth'] == date['cMonth'] && item['cDay'] == date['cDay']) {
			className2 = 'active';
		}
		var festival = item['festival'].split(' ')[0];
		if (festival.length > 3) {
			festival = '';
		}
		html += '<td class="' + className + '" data-id="' + i + '">\
				<a href="javascript:;"' + (className2 ? ' class="' + className2 + '"' : '') + '>\
					<span class="s1">' + item['cDay'] + '</span>\
					<span class="s2">' + (item['Term'] || festival || item['IDayCn']) + '</span>\
					' + (item['sign'] && map[item['sign']] ? '<i>' + map[item['sign']] + '</i>' : '') + '\
				</a>\
			</td>';
		if (i % 7 == 6 && i < len - 1) {
			html += '</tr><tr>';
		}
	}
	html += '</tr>\
			</tbody>\
		</table>';
	//$year.value = date['cYear'];
	//$month.value = date['cMonth'];
	//排列休班和今天
	var workToday = '<ul class="worktoday">'
	//上班还是休息
	var workorothers = map[date['sign']] == undefined ? '' : map[date['sign']];
	if(workorothers ){
		workorothers = '<span class="workorothers">' + workorothers + '</span>' ;
		workToday += '<li>' + workorothers + '</li>';
	}
	
	if(date['isToday']){
		var isToday = '<span class="today">今</span>' ;
		workToday += '<li>' + isToday + '</li>';
	}
	workToday += '</ul>';
	//调整日和休班今天的样式 包含任何一个 左移20px即今或休的宽度
	var marginleft = '';
	if(workorothers != '' || date['isToday']){
		marginleft = ' style="margin-left: 20px;"';
	}
	//二十四节气
	var isTerm  = date['isTerm'];
	var term = '';
	if(isTerm){
		term = '<p class="vfestival">' + date['Term'] + '</p>';
	}
	//数九
	var shujiuDate = new Date(date["cYear"], date["cMonth"] - 1, date["cDay"]);
	term = term + (shujiu(shujiuDate) != '' ? '<p class="vfestival">' + shujiu(shujiuDate) + '</p>' : '');
	$info.innerHTML = '<p><a class="triangle-left" href="javascript:void(0);" οnfοcus="this.blur();" onclick="changeDay('+ date["cYear"] +',' + date["cMonth"] +',' + date["cDay"] +',' + ' -1);"><span class="glyphicon glyphicon-triangle-left"></span></a><strong id="changecal" class="changecal">' + date['cYear'] + '-' + (date['cMonth'] > 9 ? date['cMonth'] : '0' + date['cMonth']) + '-' + (date['cDay'] > 9 ? date['cDay'] : '0' + date['cDay']) + '</strong> <span class="glyphicon glyphicon-pencil"></span><strong>' + ' ' + date['ncWeek'] + '</strong><a class="triangle-right" href="javascript:void(0);" onclick="changeDay('+ date["cYear"] +',' + date["cMonth"] +',' + date["cDay"] +',' + ' 1);"><span class="glyphicon glyphicon-triangle-right"></span></a></p>\
		<div'+ marginleft +'><span class="day">' + date['cDay'] + '</span>' + workToday + '</div> \
		<div class="sub"><p><span class="solar">公历</span> ' + (date['isLeap'] == true ? '&nbsp;&nbsp;&nbsp;' : '') + (date['cMonth'] > 9 ? date['cMonth'] : '&nbsp;&nbsp;' + date['cMonth']) +'月' + bigorsmall + ' ♦ ' + date['cAstro'] + '</p><p><span class="lunar">农历</span> ' + date['IMonthCn'] + (date['IMonthCnDays'] == 30 ? '大 ♦ ' : '小 ♦ ') + date['IDayCn'] + '</p>\
		<p>' + date['gzYear'] + '年 【' + date['Animal'] + '年】\
		' + date['gzMonth'] + '月 ' + date['gzDay'] + '日</p></div>' + '<div><span class="suitable">宜</span> '+almanac['suitable']+' <span class="inappropriate">忌</span> '+almanac['inappropriate']+'</div>' + '\
		<div class="festival">' + term + (date['festival'] == '' ? '' : '<p class="vfestival">' + date['festival'].replace(/\s/g, '</p><p  class="vfestival">') + '</p>') + '<p>' + date['poem'] + '</p></div>';
	//$table.innerHTML = html;
};

format();

 //执行一个laydate实例
 function reloadlaydate () {
	laydate.render({
		elem: '#changecal'
		,lang: 'zh' //指定元素
		,btns: ['now', 'confirm']
		,done: function(value, date){ //监听日期被切换
			var vdate = {
				"year": date['year'],
				"month": date['month'],
				"day": date['date']
			};
			//切换万年历
			format(vdate);  
			//递归调用解决laydate不能重新渲染问题
			reloadlaydate();
		}
	});
}


function shujiu(b) {
	debugger
    var a = b.getFullYear()
        , f = b.getMonth() + 1;
    b = b.getDate();
    var e = "";
	// 当月份为 1 2 3 12
    if (12 == f || 1 == f || 2 == f || 3 == f) {
        var a = a.toString()
            , d = parseInt(a.substring(0, 2)) + 1
            , c = "";
		// 21世纪C=21.94，20世纪=22.60.
        if (21 == d) {
			c = 21.94;
		}
        else if (20 == d) {
			c = 22.6;
		}
        else {
			return;
		}
        y = a.substring(2);
        d = "";
		// 冬至日期(东八区)的计算公式：(YD+C)-L
		// 公式解读：Y=年数后2位，D=0.2422，L=闰年数，21世纪C=21.94，20世纪=22.60.
		// 2020年冬至日期=[20×0.2422+21.94]-[20/4]=21，所以12月21日冬至。
		// 需要说明的是：无论按照平气法(1645年以前使用)还是定气法(1645年起沿用至今)推算，冬至的具体交节时刻都是完全一样的。这在二十四节气之中是仅有的一个。
		// 
        d = 12 == f ? parseInt(.2422 * y + c) - parseInt(y / 4) : parseInt(.2422 * (y - 1) + c) - parseInt((y - 1) / 4);
        // 21 年冬至是21日  例外：1918年和2021年的计算结果减1日。
		// "1918" != a || "2021" != a || --d;
		if("2021" == a && 12 == f){
			// 12月时冬至减一
			--d;
		}
		// 第二年数九时
		if("2022" == a && 12 != f){
			// 12月时冬至减一
			--d;
		}
        a = parseInt(a);
        c = 28;
        if (0 == a % 4 && 0 != a % 100 || 0 == a % 400) {
			c = 29;
		}
        var c = ["12 " + d + " 12 " + (d + 8) + " 一九", "12 " + (d + 9) + " 1 " + (d + 17 - 31) + " 二九", "1 " + (d + 18 - 31) + " 1 " + (d + 26 - 31) + " 三九", "1 " + (d + 27 - 31) + " 1 " + (d + 35 - 31) + " 四九", "1 " + (d + 36 - 31) + " 2 " + (d + 44 - 62) + " 五九", "2 " + (d + 45 - 62) + " 2 " + (d + 53 - 62) + " 六九", "2 " + (d + 54 - 62) + " 2 " + (d + 62 - 62) + " 七九", "2 " + (d + 63 - 62) + " 3 " + (d + 71 - 62 - c) + " 八九", "3 " + (d + 72 - 62 - c) + " 3 " + (d + 80 - 62 - c) + " 九九"], d = "九八七六五四三二一".split(""), h;
        for (h in c) {
            c[h].match(/^(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(.*?)$/) && (f == Number(RegExp.$1) && f == Number(RegExp.$3) && b >= Number(RegExp.$2) && b <= Number(RegExp.$4) && (e = RegExp.$5 + "第" + d[parseInt(RegExp.$4) - b] + "天"),
            RegExp.$1 != RegExp.$3 && f == RegExp.$1 && b >= RegExp.$2 && (e = RegExp.$5 + "第" + d[8 - (b - RegExp.$2)] + "天"),
			RegExp.$1 != RegExp.$3 && f == RegExp.$3 && b <= RegExp.$4 && (e = RegExp.$5 + "第" + d[parseInt(RegExp.$4) - b] + "天"))
		}
    }
    return e;
}


function changeDay(cYear, cMonth, cDay,offsite) {
	//当前日期
	var cdate = new Date(cYear, cMonth - 1, cDay);
	var goYear = '';
	var goMonth = '';
	var goDay = '';
	if(offsite === 1){
		//后一天日期
		var ndate = new Date(cdate.getTime() + 24 * 60 * 60 * 1000);
		goYear = ndate.getFullYear();
		goMonth = ndate.getMonth();
		goDay = ndate.getDate();
	}else{
		//前一天日期
		var pdate = new Date(cdate.getTime() - 24 * 60 * 60 * 1000);
		goYear = pdate.getFullYear();
		goMonth = pdate.getMonth();
		goDay = pdate.getDate();
	}
	var vdate = {
		"year": goYear,
		"month": goMonth + 1,
		"day": goDay
	};
	//切换万年历
	format(vdate);  
	//递归调用解决laydate不能重新渲染问题
	reloadlaydate();
}