DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
nginxHome=`nginx -V 2>&1 | grep "configure arguments:" | sed 's/[^*]*conf-path=\([^ ]*\)\/nginx\.conf.*/\1/g'`

sudo mkdir -p $nginxHome/sites-enabled
sudo ln -fs $DIR/frontend.conf $nginxHome/sites-enabled/frontend.conf
sudo ln -fs $DIR/frontend.crt $nginxHome/frontend.crt
sudo ln -fs $DIR/frontend.key $nginxHome/frontend.key
sudo nginx -s stop
sudo nginx
