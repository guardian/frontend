// @flow

import NavigationItem from '../NavigationItem';
import navItems from './nav-items';

const NavigationItems = () =>
    <ul role="navigation">
        {navItems.map(({ link, ...props }) =>
            <NavigationItem {...props}>
                {link}
            </NavigationItem>
        )}
    </ul>;

export default NavigationItems;
