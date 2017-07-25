// @flow

import NavItem from './navigation-item';

export default () =>
    <nav>
        <ul role="navigation">
            <NavItem path="/">home</NavItem>
            <NavItem zone="news" path="/uk">
                UK
            </NavItem>
            <NavItem zone="news" path="/world">
                world
            </NavItem>
            <NavItem zone="sport" path="/sport">
                sport
            </NavItem>
            <NavItem zone="sport" path="/football">
                football
            </NavItem>
            <NavItem zone="comment" path="/commentisfree">
                comment
            </NavItem>
            <NavItem zone="culture" path="/culture">
                culture
            </NavItem>
            <NavItem zone="business" path="/business">
                economy
            </NavItem>
            <NavItem zone="lifeandstyle" path="/lifeandstyle">
                life
            </NavItem>
            <NavItem zone="lifeandstyle" path="/fashion">
                fashion
            </NavItem>
            <NavItem zone="environment" path="/environment">
                environment
            </NavItem>
            <NavItem path="/technology">tech</NavItem>
            <NavItem path="/money">money</NavItem>
            <NavItem path="/travel">travel</NavItem>
            <NavItem path="https://soulmates.guardian.co.uk/">
                soulmates
            </NavItem>
            <NavItem path="http://m.jobs.guardian.co.uk/" newWindow>
                jobs
            </NavItem>
            <NavItem path="/guardian-masterclasses" newWindow>
                masterclasses
            </NavItem>
        </ul>
    </nav>;
