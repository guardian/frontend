// This is third party code and should not be converted to TypeScript
// See documentation here: https://github.com/guardian/dotcom-rendering/blob/150fc2d81e6a66d9c3336185e874fc8cd0288546/dotcom-rendering/docs/architecture/3rd%20party%20technical%20review/002-ipsos-mori.md

export const stub = () => {
	window.dm = window.dm || { AjaxData: [] };
	window.dm.AjaxEvent = (et, d, ssid, ad) => {
		dm.AjaxData.push({ et, d, ssid, ad });
		if (window.DotMetricsObj) {
			DotMetricsObj.onAjaxDataUpdate();
		}
	};
};
