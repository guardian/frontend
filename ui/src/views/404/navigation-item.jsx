// @flow
import styles from './style.scss';

export default ({ zone = 'news', path, newWindow = false, children }: Object) =>
    <li style={styles.nav_item}>
        <a
            href={path}
            style={styles[`zone_${zone}`]}
            target={newWindow ? '_blank' : '_self'}
        >
            {children}
        </a>
    </li>;
