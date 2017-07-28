// @flow

import NavigationItem from '../NavigationItem';
import navItems from './nav-items.json';

export default () =>
    <ul role="navigation">
        {navItems.map(({ link, ...props }) =>
            <NavigationItem {...props}>
                {link}
            </NavigationItem>
        )}
    </ul>;
