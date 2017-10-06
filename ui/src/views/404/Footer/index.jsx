// @flow

// this component is an example of passing style rules inline

const footerLinks = [
    { href: '/help', text: 'Help' },
    { href: '/help/contact-us', text: 'Contact us' },
    {
        href: 'https://www.surveymonkey.com/s/theguardian-beta-feedback',
        text: 'Feedback',
        target: '_blank',
    },
    { href: '/help/terms-of-service', text: 'Terms &amp; conditions' },
    { href: '/help/privacy-policy', text: 'Privacy policy' },
];

const FooterLink = ({ text, ...props }) => (
    <li
        style={{
            display: 'inline',
            ':after': {
                content: '" | "',
            },
        }}>
        <a
            {...props}
            style={{
                color: '#005689',
                textDecoration: 'none',
            }}>
            {text}
        </a>
    </li>
);

const Footer = () => (
    <div
        style={{
            borderTopWidth: '3px',
            borderColor: '#0061A6',
            borderTopStyle: 'solid',
            paddingTop: '2px',
            fontSize: '11px',
            lineHeight: '14px',
            margin: '15px 0',
            clear: 'both',
        }}>
        <ul style={{ fontFamily: 'arial' }}>{footerLinks.map(FooterLink)}</ul>
        <p style={{ fontFamily: 'arial' }}>
            <small>
                &copy; Guardian News and Media Limited or its affiliated
                companies. All rights reserved. Registered in England and Wales.
                No. 908396. Registered office: PO Box 68164, Kings Place, 90
                York Way, London N1P 2AP
            </small>
        </p>
    </div>
);

export default Footer;
