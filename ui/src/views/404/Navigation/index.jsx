// @flow

import NavigationItem from '../NavigationItem';

export default () =>
    <nav>
        <ul role="navigation">
            <NavigationItem path="/">home</NavigationItem>
            <NavigationItem zone="news" path="/uk">
                UK
            </NavigationItem>
            <NavigationItem zone="news" path="/world">
                world
            </NavigationItem>
            <NavigationItem zone="sport" path="/sport">
                sport
            </NavigationItem>
            <NavigationItem zone="sport" path="/football">
                football
            </NavigationItem>
            <NavigationItem zone="comment" path="/commentisfree">
                comment
            </NavigationItem>
            <NavigationItem zone="culture" path="/culture">
                culture
            </NavigationItem>
            <NavigationItem zone="business" path="/business">
                economy
            </NavigationItem>
            <NavigationItem zone="lifeandstyle" path="/lifeandstyle">
                life
            </NavigationItem>
            <NavigationItem zone="lifeandstyle" path="/fashion">
                fashion
            </NavigationItem>
            <NavigationItem zone="environment" path="/environment">
                environment
            </NavigationItem>
            <NavigationItem path="/technology">tech</NavigationItem>
            <NavigationItem path="/money">money</NavigationItem>
            <NavigationItem path="/travel">travel</NavigationItem>
            <NavigationItem path="https://soulmates.guardian.co.uk/">
                soulmates
            </NavigationItem>
            <NavigationItem path="http://m.jobs.guardian.co.uk/" newWindow>
                jobs
            </NavigationItem>
            <NavigationItem path="/guardian-masterclasses" newWindow>
                masterclasses
            </NavigationItem>
        </ul>
    </nav>;
