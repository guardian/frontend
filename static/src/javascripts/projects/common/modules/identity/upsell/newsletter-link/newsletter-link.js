// @flow
import React from 'preact-compat';

type NewsletterLinkProps = {
    text: String,
    href: String,
};

const NewsletterLink = ({ text, href }: NewsletterLinkProps) => (
    <a href={href}>{text}</a>
);

export { NewsletterLink };
