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
} from './style.js.scss';

export default () =>
    <div style={fluidWrap}>
        <div style={topBar}>
            <a href="/" style={topBarLink}>
                Home
            </a>
        </div>
        <Logo
            block-styles={{ guardian: { fill: colour.brandBlueDark } }}
            width={250}
        />
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
    </div>;
