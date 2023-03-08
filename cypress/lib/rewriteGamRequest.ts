const overrideGamRequest = (
	matchRequestParam: string,
	rewriteUrl: (reqUrl: string) => string,
) =>
	cy.intercept(
		'https://securepubads.g.doubleclick.net/gampad/ads**',
		(req) => {
			if (req.url.includes(matchRequestParam)) {
				req.url = rewriteUrl(req.url);
			}
		},
	);

/**
 * GAM intermitently renders a 320x250 MPU ad in the top-above-nav slot when in a Cypress test
 * For now we hardcode size targeting
 */
const rewriteGamRequestForTopAboveNav = (reqUrl: string) => {
	console.log('URL before rewrite:', reqUrl);
	const iframeDimensionParams = new RegExp(/&isw=([0-9]+)&ish=([0-9]+)/).exec(
		reqUrl,
	);
	const browserDimensionParams = new RegExp(
		/&biw=([0-9]+)&bih=([0-9]+)/,
	).exec(reqUrl);
	const psz = new RegExp(/&psz=([0-9]+x[0-9]+)/).exec(reqUrl);
	const prevIuSzs = new RegExp(/&prev_iu_szs=(.*?)&/).exec(reqUrl);

	let newReqUrl = reqUrl;
	if (iframeDimensionParams && browserDimensionParams && psz && prevIuSzs) {
		console.log('iframeDimensionParams:', iframeDimensionParams);
		console.log('browserDimensionParams:', browserDimensionParams);
		console.log('psz:', psz);
		console.log('preVszs:', prevIuSzs);
		newReqUrl = newReqUrl.replace(iframeDimensionParams[0], '');
		newReqUrl = newReqUrl.replace(
			browserDimensionParams[0],
			'&biw=1000&bih=660',
		);
		newReqUrl = newReqUrl.replace(psz[0], '&psz=1000x293');
		newReqUrl = newReqUrl.replace(
			prevIuSzs[1],
			encodeURIComponent('728x90|940x230|900x250|970x250'),
		);
	}
	console.log('URL after rewrite:', newReqUrl);
	return newReqUrl;
};

export { overrideGamRequest, rewriteGamRequestForTopAboveNav };
