// @follow
import Logo from 'assets/images/guardian-logo-320.svg';
import FourOhFour from 'assets/images/404.svg';
import CTA from 'components/CTA';

import {
    body,
    wrapper,
    logo,
    contentBlock,
    heading,
    bodyCopy,
    link,
} from './style.js.scss';

export default ({ beaconUrl }: { beaconUrl: string }) =>
<div style={body}>
    <div style={wrapper}>
        <a
            href="https://www.theguardian.com/"
            style={logo}
        >
            <Logo/>
        </a>
        <FourOhFour/>
        <div style={contentBlock}>
            <h1 style={heading}>
                Sorry — the page you have requested does not exist
            </h1>
            <p style={bodyCopy}>
                You may have followed an outdated link, or have mistyped a URL. If you believe this to be an error, please <a href="" style={link}>report it</a>.
            </p>
            <CTA
                href="https://www.theguardian.com/"
                color="brightBlue"
                icon="./assets/images/arrow-right.svg"
            >
                Go to the Guardian home page
            </CTA>
        </div>
    </div>
    <script
        dangerouslySetInnerHTML={{
            __html: `
                (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
                ga('create', 'UA-78705427-1', 'auto');
                ga('set', 'dimension3', 'theguardian.com');
                ga('set', 'dimension14', '404');
                ga('send', 'pageview');
            `,
        }}
    />

    <script src="https://pasteup.guim.co.uk/js/lib/requirejs/2.1.5/require.min.js" />

    <script
        dangerouslySetInnerHTML={{
            __html: `
                require.config({
                    paths: {
                        'ophan/http-status' : '//j.ophan.co.uk/ophan.http-status',
                    }
                });
                require(['ophan/http-status'], function(reporter) {
                reporter.reportStatus('next-gen', 404);
                });
            `,
        }}
    />
    <img
        src={`${beaconUrl}/count/40x.gif`}
        alt=""
        style={{ display: 'none' }}
        rel="nofollow"
    />
</div>;
