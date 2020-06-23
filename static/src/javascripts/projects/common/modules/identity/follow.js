// @flow
import React, { render } from 'preact/compat';
import fastdom from 'lib/fastdom-promise';
import { FollowButtonWrap } from './upsell/button/FollowButtonWrap';
import loadEnhancers from './modules/loadEnhancers';

const bindFollow = (el): void => {
    fastdom
        .read(() => el.querySelector('.identity-follow__button-target'))
        .then((wrapperEl: HTMLElement) => {
            fastdom.write(() => {
                render(
                    <FollowButtonWrap
                        following
                        onFollow={() => {
                            console.log('following');
                        }}
                        onUnfollow={() => {
                            console.log('not following');
                        }}
                    />,
                    wrapperEl
                );
            });
        });
};

const enhanceFollow = (): void => {
    loadEnhancers([['.identity-follow', bindFollow]]);
};

export { enhanceFollow };
