Frontend Nginx Dev Config
=========================

To run nginx on your local dev machine you need to add the following lines to your /etc/hosts file:

127.0.1.1   profile.thegulocal.com
127.0.1.1   m.thegulocal.com

Make sure you have nginx installed:

sudo apt-get install nginx

And run the setup script:

nginx/setup.sh