Setup
-----

1. Follow the instructions to set up the main Frontend app.
2. Clone and follows the instructions to set up
   [dev-nginx](https://github.com/guardian/dev-nginx).
3. Use the mapping in the ```nginx``` folder to generate a host for
   nginx.
4. Include the following line in the `nginx` config, i.e. `/usr/local/etc/nginx/sites-enabled/fronts.conf`
   merge_slashes off;
5. Run the app in sbt.
6. It should now be available at [https://fronts.local.dev-gutools.co.uk](https://fronts.local.dev-gutools.co.uk).
