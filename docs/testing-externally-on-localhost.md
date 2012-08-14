
Testing externally on your localhost 
====================================

Install _proxylocal_,

    gem install proxylocal

In one terminal run the _core-navigation_ server on a given port,

    ./sbt001
    > project core-navigation
    > run 9001

The expose it to the world with proxylocal,

    proxylocal 9001

Edit your article conf (ie. _article/conf/env/DEV.properties_) with the name of the proxylocal server you've been assigned,

    guardian.page.coreNavigationUrl=http://kj56.t.proxylocal.com

Then run your article server on some other port,

    > project article 
    > run 9002

Visit the proxylocal server you've been assigned,

    open http://f601.t.proxylocal.com/

