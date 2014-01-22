DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
nginxHome=`nginx -V 2>&1 | grep "configure arguments:" | sed 's/[^*]*conf-path=\([^ ]*\)\/nginx\.conf.*/\1/g'`

echo "nginxHome=$nginxHome"

sudo mkdir -p $nginxHome/sites-enabled
sudo ln -fs $DIR/frontend.conf $nginxHome/sites-enabled/frontend.conf
sudo ln -fs $DIR/frontend-test.crt $nginxHome/frontend-test.crt
sudo ln -fs $DIR/frontend-test.key $nginxHome/frontend-test.key
sudo nginx -s stop
sudo nginx
