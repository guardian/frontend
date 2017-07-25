// @flow
import Logo from 'assets/images/guardian-logo-320.svg';
import styles from './style.scss';

export default () =>
    <div>
        <Logo styles={styles} />
        <h1>Sorry - we haven’t been able to serve the page you asked for.</h1>
        <p>
            You may have followed a broken or outdated link, or there may be an
            error on our site.
        </p>
        <p>Please follow one of the links below to continue exploring.</p>
    </div>;
