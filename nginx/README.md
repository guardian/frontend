# Frontend Nginx Dev Config

## Setup Mac

Install Homebrew:

    ruby -e "$(curl -fsSL https://raw.github.com/mxcl/homebrew/go)"

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
