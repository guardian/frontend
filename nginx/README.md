# Frontend Nginx Dev Config

## Setup Mac

[Install Homebrew:](http://brew.sh/#install)

    ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"

Install nginx:

    brew install nginx

Add the following to your ```/etc/hosts```:

    127.0.0.1   profile.thegulocal.com
    127.0.0.1   m.thegulocal.com

## Setup Linux

Install nginx:

    sudo apt-get install nginx


Add the following to your ```/etc/hosts```:

    127.0.1.1   profile.thegulocal.com
    127.0.1.1   m.thegulocal.com

## Now run the setup script:

    nginx/setup.sh

## Setup Nginx

You will have to make sure the ```sites-enabled``` folder in included in your ```nginx.conf```:
    
    # ...
    http {
        include       mime.types;
        default_type  application/octet-stream;
        # THIS IS WHAT YOU MUST ADD
        include sites-enabled/*; 
    #...

## Note

Both [frontend-test.crt](frontend-test.crt) and [frontend-test.key](frontend-test.key) are test values that are not used in production or anywhere else across the Guardian so can be public.
