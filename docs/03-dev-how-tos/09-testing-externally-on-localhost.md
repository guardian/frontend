Testing externally on your localhost 
====================================

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
./sbt001
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
