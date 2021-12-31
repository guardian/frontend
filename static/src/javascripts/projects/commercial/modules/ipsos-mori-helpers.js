// This is third party code and so should not be converted to typescript
// See documentation here: https://git.io/Jy5w8

export const stub = () => {
	window.dm = window.dm || { AjaxData: [] };
	window.dm.AjaxEvent = (et, d, ssid, ad) => {
		dm.AjaxData.push({ et, d, ssid, ad });
		if (window.DotMetricsObj) {
			DotMetricsObj.onAjaxDataUpdate();
		}
	};
};
