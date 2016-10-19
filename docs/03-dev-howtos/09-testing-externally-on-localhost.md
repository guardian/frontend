# Testing externally on your localhost
====================================

There are two options for this. Proxylocal and ngrok. Proxy local has the advantage of being able to set a
constant url for your personal use, however ngrok is a useful backup for times when the proxylocal service is down
(See https://github.com/proxylocal/proxylocal-gem/issues/16). In fact many developers use it by default.

#To use Proxylocal:

Prerequisites: [Ruby](https://www.ruby-lang.org/en/) & [RubyGems](http://rubygems.org/)

Install _proxylocal_:
```bash
gem install proxylocal
```
If you're running Ubuntu you might need to add the RubyGem bin path to your PATH environment variable:
```bash
-- in .bashrc --
export PATH=$PATH:/var/lib/gems/1.8/bin
```
In one terminal run the _core-navigation_ server on a given port:
```bash
./sbt
> project core-navigation
> run 9001
```
Then expose it to the world with proxylocal:
```bash
proxylocal 9001
```
Edit your article conf (ie. _article/conf/env/DEV.properties_) with the name of the proxylocal server you've been assigned:
```
guardian.page.coreNavigationUrl=http://kj56.t.proxylocal.com
```
Then run your article server on some other port:
```bash
> project article
> run 9002
```
Visit the proxylocal server you've been assigned:
```bash
open http://f601.t.proxylocal.com/
```



#To use ngrok:

Install ngrok via their website: https://ngrok.com/download or use homebrew :
```bash
brew cask install ngrok
```
In sbt run your article server or dev-build server:
```bash
./sbt
> project article
> run
```
In a seperate terminal, run ngrok, assigning the port number you are using for frontend (default is 9000):
```bash
ngrok http 9000
```
Copy the Forwarding url - ie "https://eb65c38f.ngrok.io"
To end the tunnel use CTRL-C to kill it.
