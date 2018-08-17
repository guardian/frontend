// @flow
import loadEnhancers from './modules/loadEnhancers';
import fastdom from 'lib/fastdom-promise';
import {FollowButtonWrap} from "./follow/FollowButtonWrap";
import React, { Component, render } from 'preact-compat';


const bindFollow = (el): void => {

    fastdom
        .read(() => el.querySelector('.identity-follow__button-target'))
        .then((wrapperEl: HTMLElement) => {
            fastdom.write(() => {
                render(
                    <FollowButtonWrap
                        initiallyFollowing={true}
                        onFollow={()=>{console.log('following')}}
                        onUnfollow={()=>{console.log('not following')}}
                    />,
                    wrapperEl
                );
            });
        });
};

const enhanceFollow = (): void => {
    loadEnhancers([
        ['.identity-follow', bindFollow],
    ]);
};

export { enhanceFollow };
