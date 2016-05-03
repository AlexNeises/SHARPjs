$(document).ready(function() {
	draw_graph();
});

function draw_graph() {
	var MISSING		= -9999.0;
	var ROCP		= 0.28571426;
	var ZEROCNK		= 273.15;
	var G			= 9.80665;
	var TOL			= 1e-10;

	var WHITE		= '#FFFFFF';
	var BLACK		= '#000000';
	var RED			= '#FF0000';
	var ORANGE		= '#FF4000';
	var YELLOW		= '#FFFF00';
	var MAGENTA		= '#E700DF';
	var DBROWN		= '#775000';
	var LBROWN		= '#996600';
	var LBLUE		= '#06B5FF';
	var CYAN		= '#00FFFF';

	var c1			= 0.0498646455;
	var c2			= 2.4082965;
	var c3			= 7.07475;
	var c4			= 38.9114;
	var c5			= 0.0915;
	var c6			= 1.2035;
	var eps			= 0.62197;

	var lpad		= 30;
	var rpad	 	= 50;
	var tpad	 	= 20;
	var bpad	 	= 20;
	var tlx		 	= rpad;
	var tly		 	= tpad;
	var wid		 	= 600 - rpad;
	var hgt		 	= 600 - bpad;
	var brx		 	= wid;
	var bry		 	= hgt;
	var pmax	 	= 1050.0;
	var pmin	 	= 99.5;
	var barbx	 	= brx + rpad / 2;
	var log_pmax 	= Math.log(pmax);
	var log_pmin	= Math.log(pmin);
	var bltmpc		= -50;
	var brtmpc		= 50;
	var dt			= 10;
	var xskew		= 100 / 3.0;
	var xrange		= brtmpc - bltmpc;
	var yrange		= Math.tan(xskew * Math.PI / 180) * xrange;
	var originx		= 0.0;
	var originy		= 0.0;
	var scale		= 1.0;

	var svg = document.getElementById("canvas");

	var newclip = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
	newclip.setAttribute("id", "plot-clip");
	svg.appendChild(newclip);

	var cliprect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	cliprect.setAttribute("x", 36);
	cliprect.setAttribute("y", 15);
	cliprect.setAttribute("width", 513);
	cliprect.setAttribute("height", 580);
	newclip.appendChild(cliprect);

	var d_theta = math.range(bltmpc, 80, 20);
	var t_isoth = math.range(bltmpc - 100, brtmpc + dt, dt);
	var t_isotx = math.range(bltmpc, brtmpc + dt, dt);
	var p_isoba = [1000, 850, 700, 500, 300, 200, 100];
	var r_mixin = math.range(4, 33, 4);

	t_isoth.forEach(function(value) {
		var isotherm_array = draw_isotherm(value);
		var newpath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		newpath.setAttribute("d", "M " + isotherm_array[1] + " " + isotherm_array[2] + " L " + isotherm_array[3] + " " + isotherm_array[4]);
		newpath.setAttribute("stroke-dasharray", "5,5");
		newpath.setAttribute("clip-path", "url(#plot-clip)");
		newpath.style.stroke = isotherm_array[0];
		newpath.style.strokeWidth = "1px";
		newpath.style.fill = "none";
		svg.appendChild(newpath);
	});

	d_theta.forEach(function(value) {
		var points = draw_dry_adiabat(value);
		for (var i = 0; i + 1 < points.length; i++) {
			var newpath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			newpath.setAttribute("d", "M " + points[i][0] + " " + points[i][1] + " L " + points[i+1][0] + " " + points[i+1][1]);
			newpath.setAttribute("clip-path", "url(#plot-clip)");
			newpath.style.stroke = "#333333";
			newpath.style.strokeWidth = "1px";
			newpath.style.fill = "none";
			svg.appendChild(newpath);
		}
	});

	p_isoba.forEach(function(value) {
		var isobar_values = draw_isobar(value, 1);
		var newpath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		newpath.setAttribute("d", "M " + lpad + " " + isobar_values[0] + " L " + brx + " " + isobar_values[0]);
		newpath.setAttribute("clip-path", "url(#plot-clip)");
		newpath.style.stroke = DBROWN;
		newpath.style.strokeWidth = "1px";
		newpath.style.fill = "none";
		svg.appendChild(newpath);

		var newrect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		newrect.setAttribute("x", 1);
		newrect.setAttribute("y", isobar_values[0] - 8);
		newrect.setAttribute("width", 35);
		newrect.setAttribute("height", 20);
		newrect.style.stroke = WHITE;
		newrect.style.strokeWidth = "1px";
		newrect.style.fill = WHITE;
		svg.appendChild(newrect);

		var newtext = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		newtext.setAttribute("x", 1);
		newtext.setAttribute("y", isobar_values[0] + 5);
		newtext.textContent = value;
		svg.appendChild(newtext);
	});

	t_isotx.forEach(function(value) {
		var isotherm_values = draw_isotherm_labels(value);
		var newrect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		newrect.setAttribute("x", isotherm_values[0] - 2);
		newrect.setAttribute("y", isotherm_values[1]);
		newrect.setAttribute("width", 25);
		newrect.setAttribute("height", 20);
		newrect.style.stroke = WHITE;
		newrect.style.strokeWidth = "1px";
		newrect.style.fill = WHITE;
		svg.appendChild(newrect);

		var newtext = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		newtext.setAttribute("x", isotherm_values[0]);
		newtext.setAttribute("y", isotherm_values[1] + 13);
		newtext.textContent = value;
		svg.appendChild(newtext);
	});

	r_mixin.forEach(function(value) {
		var ratio_values = draw_mixing_ratios(value + 2, 600);
		var newrect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		newrect.setAttribute("x", ratio_values["text"][0] + 1);
		newrect.setAttribute("y", ratio_values["text"][1] - 3);
		newrect.setAttribute("width", 13);
		newrect.setAttribute("height", 13);
		newrect.style.stroke = WHITE;
		newrect.style.strokeWidth = "1px";
		newrect.style.fill = WHITE;
		svg.appendChild(newrect);

		var newpath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		newpath.setAttribute("d", "M " + ratio_values["line"][0] + " " + ratio_values["line"][1] + " L " + ratio_values["line"][2] + " " + ratio_values["line"][3]);
		newpath.setAttribute("clip-path", "url(#plot-clip)");
		newpath.style.stroke = "#006600";
		newpath.style.strokeWidth = "1px";
		newpath.style.fill = "none";
		svg.appendChild(newpath);

		var newtext = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		newtext.setAttribute("x", ratio_values["text"][0] + 2);
		newtext.setAttribute("y", ratio_values["text"][1] + 5);
		newtext.setAttribute("font-size", 8);
		newtext.setAttribute("fill", "#006600");
		newtext.textContent = ratio_values["text"][2];
		svg.appendChild(newtext);
	});

	var border = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	border.setAttribute("x", 36);
	border.setAttribute("y", 20);
	border.setAttribute("width", 513);
	border.setAttribute("height", 560);
	border.style.stroke = BLACK;
	border.style.strokeWidth = "3px";
	border.style.fill = "none";
	svg.appendChild(border);

	function draw_dry_adiabat(theta) {
		var dp = -10;
		var presvals = math.range(parseInt(pmax), parseInt(pmin) + dp, dp);
		var thetas = [];
		presvals.forEach(function(value) {
			thetas.push(((theta + ZEROCNK) / (math.pow((1000.0 / value), ROCP))) - ZEROCNK);
		});
		var xvals = [];
		var yvals = [];
		thetas.forEach(function(value, key) {
			var loop_presvals = presvals.toArray()[key];
			xvals.push(originx + tmpc_to_pix(value, loop_presvals) / scale);
			yvals.push(originy + pres_to_pix(loop_presvals) / scale);
		});
		var loop_range = math.range(1, thetas.length);
		var return_structure = [];
		loop_range.forEach(function(value, key) {
			return_structure.push(new Array());
			return_structure[key].push(xvals[key]);
			return_structure[key].push(yvals[key]);
		});
		return return_structure;
	}

	function draw_isotherm(t) {
		var x1 = originx + tmpc_to_pix(t, pmax) / scale;
		var x2 = originx + tmpc_to_pix(t, pmin) / scale;
		var y1 = originy + bry / scale;
		var y2 = originy + tpad / scale;
		var results = [];
		if (parseInt(t) == 0 || parseInt(t) == -20) {
			results.push("#0000FF");
		}
		else {
			results.push("#555555");
		}
		results.push(x1, y1, x2, y2);
		return results;
	}

	function draw_isotherm_labels(t) {
		var x1 = originx + tmpc_to_pix(t, pmax) / scale;
		var results = [];
		if (x1 >= lpad && x1 <= wid) {
			results.push(x1 - 10);
			results.push(bry + 2);
		}
		return results;
	}

	function draw_isobar(p, flag) {
		var y1 = originy + pres_to_pix(p) / scale;
		var results = [];
		if (y1 >= tpad && y1 <= hgt) {
			var offset = 5;
			if (flag) {
				results.push(y1);
			}
		}
		return results;
	}
	
	function draw_mixing_ratios(w, pmin) {
		var t = temp_at_mixrat(w, pmax);
		var x1 = originx + tmpc_to_pix(t, pmax) / scale;
		var y1 = originy + pres_to_pix(pmax) / scale;
		t = temp_at_mixrat(w, pmin);
		var x2 = originx + tmpc_to_pix(t, pmin) / scale;
		var y2 = originy + pres_to_pix(pmin) / scale;
		var ratios = [];
		ratios["line"] = [x1, y1, x2, y2];
		ratios["text"] = [x2 - 5, y2 - 10, w];
		return ratios;
	}

	function temp_at_mixrat(w, p) {
		var x = math.log10(w * p / (622.0 + w));
		return (math.pow(10.0, ((c1 * x) + c2)) - c3 + (c4 * math.pow((math.pow(10, (c5 * x)) - c6), 2))) - ZEROCNK;
	}

	function pres_to_pix(p) {
		var scl1 = log_pmax - log_pmin;
		var scl2 = log_pmax - math.log(p);
		return bry - (scl2 / scl1) * (bry - tpad);
	}

	function tmpc_to_pix(t, p) {
		var scl1 = brtmpc - (((bry - pres_to_pix(p)) / (bry - tpad)) * yrange);
		return brx - (((scl1 - t) / xrange) * (brx - lpad));
	}
	return draw_dry_adiabat(1);
};