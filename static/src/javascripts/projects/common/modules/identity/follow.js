import React, { render } from 'preact-compat';
import fastdom from 'lib/fastdom-promise';
import { FollowButtonWrap } from './upsell/button/FollowButtonWrap';
import loadEnhancers from './modules/loadEnhancers';

const bindFollow = (el) => {
    fastdom
        .measure(() => el.querySelector('.identity-follow__button-target'))
        .then((wrapperEl) => {
            fastdom.mutate(() => {
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

const enhanceFollow = () => {
    loadEnhancers([['.identity-follow', bindFollow]]);
};

export { enhanceFollow };
