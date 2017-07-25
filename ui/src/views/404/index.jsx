// @flow
import Logo from 'assets/images/guardian-logo-320.svg';
import Navigation from './navigation';
import Footer from './footer';
import styles from './style.scss';

export default () =>
    <div style={styles.fluid_wrap}>
        <div style={styles.topbar}>
            <a href="/">Home</a>
        </div>
        <Logo styles={styles} />
        <h1 style={styles.heading}>
            Sorry - we haven’t been able to serve the page you asked for.
        </h1>
        <div>
            <div style={styles.sub_heading_container}>
                <h2 style={styles.sub_heading}>404</h2>
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
    </div>;
