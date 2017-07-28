// @flow

import NavigationItem from '../NavigationItem';
import navItems from './nav-items.json';

export default () =>
    <nav>
        <ul role="navigation">
            {navItems.map(({ link, ...props }) =>
                <NavigationItem {...props}>
                    {link}
                </NavigationItem>
            )}
        </ul>
    </nav>;
