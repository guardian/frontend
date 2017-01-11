import boot from 'bootstraps/standard/main';

boot();

require(['bootstraps/stub'], (commercial) => {
    commercial.init();
});
