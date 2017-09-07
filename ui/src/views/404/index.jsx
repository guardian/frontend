// @flow
import { colour } from 'pasteup';
import Logo from 'assets/images/guardian-logo-320.svg';
import Navigation from './Navigation';
import Footer from './Footer';

import {
    heading,
    fluidWrap,
    topBar,
    topBarLink,
    subHeadingContainer,
    subHeading,
    para,
    logo,
} from './style.js.scss';

export default ({ beaconUrl }: Object) =>
    <div style={fluidWrap}>
        <div style={topBar}>
            <a href="/" style={topBarLink}>
                Home
            </a>
        </div>
        <div>
            <Logo style={logo} />
        </div>
        <h1 style={heading}>
            Sorry - we haven’t been able to serve the page you asked for.
        </h1>
        <div style={{ marginTop: '20px' }}>
            <div style={subHeadingContainer}>
                <h2 style={subHeading}>404</h2>
            </div>
            <p style={para}>
                You may have followed a broken or outdated link, or there may be
                an error on our site.
            </p>
            <p style={para}>
                Please follow one of the links below to continue exploring.
            </p>
            <Navigation />
        </div>
        <Footer />
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
