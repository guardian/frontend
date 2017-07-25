// @flow

import styles from './style.scss';

export default () =>
    <div style={styles.footer}>
        <ul className="inline with-separators">
            <li><a href="/help">Help</a></li>
            <li><a href="/help/contact-us">Contact us</a></li>
            <li><a target="_blank" href="https://www.surveymonkey.com/s/theguardian-beta-feedback">Feedback</a></li>
            <li><a href="/help/terms-of-service">Terms &amp; conditions</a></li>
            <li><a href="/help/privacy-policy">Privacy policy</a></li>
        </ul>
        <p><small>&copy; Guardian News and Media Limited or its affiliated companies. All rights reserved. Registered in England and Wales. No. 908396. Registered office: PO Box 68164, Kings Place, 90 York Way, London N1P 2AP</small></p>
    </div>;
