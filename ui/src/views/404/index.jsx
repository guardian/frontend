// @flow
import Logo from 'assets/images/the-guardian-logo.svg';
import ArrowRight from 'assets/images/arrow-right.svg';
import NotFoundSvg from 'assets/images/404.svg';
import Cta from './cta';

import {
    wrapper,
    mainContent,
    logoWrapper,
    logo,
    visuallyHidden,
    fourOhFour,
    contentText,
    heading,
    bodyCopy,
    link,
} from './style.css';

export default ({ config }: { config: Object }) => (
    <div style={wrapper}>
        <div style={mainContent}>
            <a href="https://www.theguardian.com/" style={logoWrapper}>
                <Logo style={logo} />
                <span style={visuallyHidden}>The Guardian</span>
            </a>
            <NotFoundSvg style={fourOhFour} />
            <div style={contentText}>
                <h1 style={heading}>
                    Sorry – the page you have requested does not exist
                </h1>
                <p style={bodyCopy}>
                    You may have followed an outdated link, or have mistyped a
                    URL. If you believe this to be an error, please&nbsp;
                    <a
                        href="https://www.theguardian.com/info/tech-feedback"
                        style={link}>
                        report it
                    </a>.
                </p>
                <Cta href="https://www.theguardian.com/" icon={ArrowRight}>
                    Go to The Guardian home page
                </Cta>
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
            src={`${config.beaconUrl}/count/40x.gif`}
            alt=""
            style={{ display: 'none' }}
            rel="nofollow"
        />
    </div>
);
