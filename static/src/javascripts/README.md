JavaScript
==========

## Library dependencies


We use [Bower](https://github.com/twitter/bower) to handle our JS dependencies. It uses github tags for versioning.

### Installation
------------ 

    $ npm install -g bower bower-installer
    
### Usage

 * Installing the dependencies

    $ bower-installer
    
 * Listing the dependencies and their versions
 
    $ bower list

NOTE: We're locking down Qwery to the last 3.x version, as 4 doesn't support <= IE8, i.e. DO NOT UPGRADE QWERY PAST
VERSION 3
