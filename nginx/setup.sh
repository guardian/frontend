DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

case `uname` in
	Linux)
		nginxHome=/etc/nginx
		;;

	Darwin)
		nginxHome=~/Developer/etc/nginx
		;;

	*)
		echo "Error: Operating system not recognised!"
		exit 1
esac

sudo ln -fs $DIR/frontend.conf $nginxHome/sites-enabled/frontend.conf
sudo ln -fs $DIR/frontend.crt $nginxHome/frontend.crt
sudo ln -fs $DIR/frontend.key $nginxHome/frontend.key
sudo nginx -s stop
sudo nginx
