// @flow
import fastdom from 'lib/fastdom-promise';
import $ from 'lib/$';

export const addUpdatingState = (buttonEl: HTMLButtonElement) =>
    fastdom.mutate(() => {
        buttonEl.disabled = true;
        $(buttonEl).addClass('is-updating is-updating-subscriptions');
    });

export const removeUpdatingState = (buttonEl: HTMLButtonElement) =>
    fastdom.mutate(() => {
        buttonEl.disabled = false;
        $(buttonEl).removeClass('is-updating is-updating-subscriptions');
    });
