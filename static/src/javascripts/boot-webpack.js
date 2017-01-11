import domready from 'domready';
import boot from 'bootstraps/standard/main';

domready(() => {
    boot();

    require(['bootstraps/stub'], (commercial) => {
        commercial.init();
    });
});
