// @flow
import Logo from 'assets/images/guardian-logo-320.svg';

import Navigation from './Navigation';
import Footer from './Footer';

import styles from './style.css';

export default ({ beaconUrl }: Object) => (
    <div style={styles.fluidWrap}>
        <div style={styles.topBar}>
            <a href="/" style={styles.topBarLink}>
                Home
            </a>
        </div>
        <Logo style={styles.logo} />
        <h1 style={styles.heading}>
            Sorry - we haven’t been able to serve the page you asked for.
        </h1>
        <div {...{ marginTop: '20px' }}>
            <div style={styles.subHeadingContainer}>
                <h2 style={styles.subHeading}>404</h2>
            </div>
            <p style={styles.para}>
                You may have followed a broken or outdated link, or there may be
                an error on our site.
            </p>
            <p style={styles.para}>
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
    </div>
);
