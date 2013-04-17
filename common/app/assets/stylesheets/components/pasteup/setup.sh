echo "Installing GCC"
echo "==============================================="
sudo apt-get install gcc

echo "Installing nodejs"
echo "==============================================="
mkdir ~/node-install
cd ~/node-install
curl -O http://nodejs.org/dist/v0.8.16/node-v0.8.16.tar.gz

tar xvf node-v0.8.16.tar.gz
cd node-v0.8.16

./configure
sudo make install

echo "Installing npm"
echo "==============================================="
curl -L http://npmjs.org/install.sh | sudo sh

echo "Installing grunt"
echo "==============================================="
npm install -g grunt

echo "Installing bower"
echo "==============================================="
npm install -g bower
