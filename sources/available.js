var cache_len = new Date(new Date().getTime() - 30000).getTime();

var spc_base_url = "http://www.spc.noaa.gov/exper/soundings/";
var spc_text = "";
var spc_time = null;

function _download_spc() {
	var now = new Date().getTime();
	if (spc_time == null || spc_time < now - cache_len) {
		$.ajax({
			url: spc_base_url
		}).success(function(data) {
			var spc_text = data;
			spc_time = new Date().getTime();
		});
	}
}