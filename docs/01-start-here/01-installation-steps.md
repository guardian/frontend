# **Quick start guide**

1. [Ensure your disk is encrypted] (#security)
2. [Obtain AWS credentials] (#obtain-aws-credentials)
3. [Local Test Server setup](#local-test-server-setup)
4. [IDE Setup](#ide-setup)
5. [Optional steps](#optional-steps)

# Security
All development laptops must be encrypted. If you are not 100% sure, please ask for help.
###Check your Mac:
- Choose Apple menu > System Preferences
- Security & Privacy.
- Click the FileVault tab.
- ensure that FileVault is enabled for your disk

### Checking Linux (including desktop machines):
Follow [this link](https://www.google.co.uk) and enter the relevant search string for your system.

# Obtain AWS credentials
1. Fork [Janus](https://github.com/guardian/janus) and follow the readme (**Note:** you will need permission to access the Janus repo to do this, and 2FA set up on your Google account)
2. Make your change and push to a new branch (you can review the closed PRs for help)
3. Submit a PR
4. You may need to `pip install awscli` and add `/Library/Frameworks/Python.framework/Versions/Current/bin` to your `$PATH` to run the commands Janus gives you.

# Local Test Server setup

You can either set up the frontend through a [local install](#local-machine) on your machine or using [Docker](#docker). Before checking out the repository you may need to add your guardian email address to your github account and [add an SSH key to your GitHub account](https://help.github.com/articles/generating-ssh-keys/). Before pushing changes you may need to [create an access token](https://help.github.com/articles/creating-an-access-token-for-command-line-use/). Make sure your dev manager has added you to the necessary teams, in case you have need write access.

## Local machine
You need a Mac or Linux PC (Ubuntu).

**Note:** If using Homebrew to install nvm, it may throw up a message about nvm support; the instructions in this message may be necessary to make nvm work correctly.

### Automatic
1. Check out the repository:

    ```
    git clone git@github.com:guardian/frontend.git
    cd frontend
    ```

2. Get AWS Credentials using [Janus](https://janus.gutools.co.uk/) for *frontend* and *CMS fronts* (you will need access to Janus)

3. Run ```./setup.sh``` to install dependencies and compile assets. *[EACCES error?](docs/01-start-here/04-troubleshooting.md#npm-eacces)*

1. [Setup local Nginx](https://github.com/guardian/frontend/blob/master/nginx/README.md) to be able to access via `https://m.thegulocal.com`

4. All being well, you should be able to [run the app](#run-the-app) (make sure you have the latest version of java)

### Manual
Install each of the things listed below:

#### Configuration

You need one file on your machine.

* `~/.aws/config`

```
[profile frontend]
region = eu-west-1
```

#### [Homebrew](http://brew.sh/)

This is needed on Mac only:
```bash
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```
### A JDK

Ubuntu: Java 8 is required, but only OpenJDK 7 is available in the official Ubuntu repo. Install Java 8 as below.

```bash
sudo apt-get purge openjdk*
sudo add-apt-repository -y ppa:webupd8team/java
sudo apt-get update
echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | sudo /usr/bin/debconf-set-selections
sudo apt-get -y install oracle-java8-installer
```

Mac: Install from [Oracle web site](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)

#### [Node.js](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)

The frontend uses an `.nvmrc` which specifies Node 6.x as a requirement. If you use [NVM](https://github.com/creationix/nvm#install-script) to manage multiple versions of Node on your machine, you can just `nvm use` (or `nvm install` if you don't have 6 installed yet).

To install nvm:

```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash
```

You may find it useful to add [this script](https://gist.github.com/sndrs/5940e9e8a3f506b287233ed65365befb) to your `.bash_profile` – or wherever else is appropriate for your setup – to automatically switch Node versions if an `.nvmrc` is present.

If you just want to use your system Node, you'll need to install v6:

Ubuntu:
```bash
curl -sL https://deb.nodesource.com/setup_6.x | sudo bash -
sudo apt-get install -y nodejs
```
Mac:
```bash
brew install node@6
```

#### Xcode (if on a Mac, one of the Node modules requires it)

This is needed on Mac only:
https://itunes.apple.com/gb/app/xcode/id497799835

Xcode installs an old version of git `1.9.3`. If you need a newer version, you can run
```
brew install git
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.bash_profile
```
Quit Terminal, relaunch it and check that `git --version` outputs `2.1.3` or newer.


#### The frontend code
Note: Remember to see [Troubleshooting](#troubleshooting) below if you have any issues.

```
git clone git@github.com:guardian/frontend.git

cd frontend
```

Install additional dependencies:
```
make install
```

After this, you can compile the assets:
```
make compile
```

## Docker

Warning: Docker for Mac is suffering performance issues for directories mounted via osxfs, making the Guardian frontend setup on Mac painfully slow. We'll recommand that Mac users follow the instructions above to install and run frontend on their local machine.

Prerequisites:
- Docker. See [Install documentation](https://docs.docker.com/engine/installation/)
- AWS CLI. See [documentation](https://aws.amazon.com/cli/)

1. Clone repository
    - `git clone git@github.com:guardian/frontend.git && cd frontend`
2. Get AWS Credentials using [Janus](https://janus.gutools.co.uk/) for *frontend* and *CMS fronts* (you will need access to Janus)
4. Run the container (dev service). The first time you do so the container image would be pulled from the EC2 Container Registry
    - ./dev.sh
5. Build and run the app within the container
    - `make reinstall compile && ./sbt`
    - See [Run the app section](#run-the-app) for more info


*Notes:*
- *Your local machine (host) `~/.gu/` and `~/.aws/` directories are exposed to the container via mounted volumes, so they have access to the properties and aws credentials files*
- *The `dev` container will be deleted when exited*
- *Node packages are bound to your machine architecture, so you cannot switch between MacOS and Docker(Linux) in the same local git repo. To avoid this problem, you can run `make reinstall` which will install the correct node binaries for your system*

### Docker FAQ

#### Removing containers

Containers can be thrown away very easily. To do so:
- `docker ps -a` to get the ID of the container you want to remove
- `docker rm ID`. Use `-f` option to force deletion when the container is still in used.


## Run the app
In another console, run the supplied bash script [sbt]. The dot and slash are important in this command.
```
./sbt
```
Wait for SBT to be up and running. This may take 15 mins or so to start the first time - you'll know
it's done when you get a prompt. If it is your first time, compile the project.
```
compile
```
Switch project by typing
```
project dev-build
```
Then run the project locally by typing
```
run
```
This also can take a while the first time.

Now check that you are up and running by hitting the following URLs:

* [http://localhost:9000/media](http://localhost:9000/media)
* [http://localhost:9000/media/2012/dec/05/newspaper-editors-sign-up-leveson](http://localhost:9000/media/2012/dec/05/newspaper-editors-sign-up-leveson)
* [http://localhost:9000/news/gallery/2012/dec/04/24-hours-in-pictures-gallery](http://localhost:9000/news/gallery/2012/dec/04/24-hours-in-pictures-gallery)

If you have [setup local Nginx](https://github.com/guardian/frontend/blob/master/nginx/README.md) then try hitting [https://m.thegulocal.com](https://m.thegulocal.com)

Congratulations, you have a local instance running!  Now continue on to set up your IDE.

## IDE setup
You need a copy of the source code from above. If not, run this command:
```
git clone git@github.com:guardian/frontend.git
```

### EditorConfig plugin

Install to your IDE from http://editorconfig.org/#download

### IntelliJ metadata
To create project files for use in IntelliJ, you need to make sure you install the Scala plugin from Preferences->Plugins. It supports SBT and Play.
Then load IntelliJ, then click Import project and import the directory as an SBT project. Default settings are fine, except you need to make sure you choose JDK 1.8 (under JVM - Custom) otherwise it won't import correctly - You can find the location by pasting `/usr/libexec/java_home` into your terminal.

Congratulations, you are now set up to edit frontend code!  See the [Optional steps](#optional-steps) below for other things to do.


## Optional steps

###NVM
Some packages (imagemin) are not working with newest Node.js. So if you want to run multiple Node.js versions on your system you may want to use [nvm](https://github.com/creationix/nvm)

###Nginx

If you are working on Identity or Discussion, Nginx must be installed and
configured to correctly serve the application, please refer to
[`/nginx/README.md`](https://github.com/guardian/frontend/blob/master/nginx/README.md) in this project.
