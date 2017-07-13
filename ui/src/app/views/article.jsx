// @flow

import Button from 'components/button';
import styles from './article.scss';

export default (props: Object) =>
    <header style={styles['.header']}>
        <div style={styles['.content-labels']}>
            <a
                style={styles['.section-label']}
                data-link-name="article section"
                href="https://m.code.dev-theguardian.com/uk/ruralaffairs"
            >
                Rural affairs
            </a>
            <a
                style={styles['.series-label']}
                href="https://m.code.dev-theguardian.com/environment/series/country-diary"
            >
                Country diary
            </a>
            <Button {...props}>hi!</Button>
        </div>
        <h1 style={styles['.headline']} itemProp="headline">
            {props.page.headline}
        </h1>
    </header>;
