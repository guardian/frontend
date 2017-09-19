// @flow
import styles from './style.js.css';

const NavigationItem = ({
    zone = 'default',
    path,
    newWindow = false,
    children,
}: Object) =>
    <li style={styles.nav_item}>
        <a
            href={path}
            style={styles[`zone--${zone}`]}
            target={newWindow ? '_blank' : '_self'}>
            {children}
        </a>
    </li>;

export default NavigationItem;
