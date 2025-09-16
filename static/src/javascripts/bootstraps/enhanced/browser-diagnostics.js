import React, { Component, render } from 'preact/compat';

class DiagnosticsCookies extends Component {
    constructor() {
        super();
    }

    render() {
		const cookiesAsObject = Object.fromEntries(
			document.cookie
				.split(';')
				.map(s => s.trim().split('='))
		);

		const userBenefitsCookies = [
			'GU_AF1', // Ad free
			'gu_hide_support_messaging',
			'gu_allow_reject_all',
			'gu_user_benefits_expiry',
		];

        return (
			<ul>
				{userBenefitsCookies.map((cookieName) => (
					<li key={cookieName}>
						{`${cookieName}: ${cookiesAsObject[cookieName] || 'unset'}`}
					</li>
				))}
			</ul>
		);
    }
}

const init = () => {
    const element = document.getElementById(
        'diagnostics-cookies'
    );

    if (element) {
        render(<DiagnosticsCookies />, element);
    }
};

export { init };
