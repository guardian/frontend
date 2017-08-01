// @flow
import styles from './style.js.scss';

const NavigationItem = ({
    zone = 'news',
    path,
    newWindow = false,
    children,
}: Object) =>
    <li style={styles.nav_item}>
        <a
            href={path}
            style={styles[`zone_${zone}`]}
            target={newWindow ? '_blank' : '_self'}>
            {children}
        </a>
    </li>;

export default NavigationItem;
