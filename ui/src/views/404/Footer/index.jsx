// @flow

// This is an example of styles that are defined inline
const style = {
    borderTopWidth: '3px',
    borderColor: '#0061A6',
    borderTopStyle: 'solid',
    paddingTop: '2px',
    fontSize: '11px',
    lineHeight: '14px',
    margin: '15px 0',
    clear: 'both'
};

export default () =>
    <div style={style}>
        <ul className="inline with-separators">
            <li><a href="/help">Help</a></li>
            <li><a href="/help/contact-us">Contact us</a></li>
            <li><a target="_blank" href="https://www.surveymonkey.com/s/theguardian-beta-feedback">Feedback</a></li>
            <li><a href="/help/terms-of-service">Terms &amp; conditions</a></li>
            <li><a href="/help/privacy-policy">Privacy policy</a></li>
        </ul>
        <p><small>&copy; Guardian News and Media Limited or its affiliated companies. All rights reserved. Registered in England and Wales. No. 908396. Registered office: PO Box 68164, Kings Place, 90 York Way, London N1P 2AP</small></p>
    </div>;
