# Troubleshooting

## Frequent Issues

### The changes are not showing when running locally

To make sure your code is compiled try `make compile-dev` before running `./sbt`. This might save you lots of time debugging why your changes don't show.

### NPM "EACCES"

If you get errors like this on `npm install`
```
npm WARN locking Error: EACCES, open '/Users/jduffell/.npm/_locks/karma-requirejs-4becac899d6c8f35.lock'
```

Sometimes when you install npm, it ends up owned by root (but in your home
directory).

Check that you own your own `.npm` directory: `ls -ld ~/.npm`

If it is owned by root, then take ownership of it
`sudo chown -R $(whoami) ~/.npm`

### { Error: ENOENT: no such file or directory, scandir '../frontend/node_modules/node-sass/vendor'
Run `make reinstall` to resolve.

### Accidentally ran `npm install` or `yarn install`
Run `make reinstall` to resolve.

### Global install permissions errors
The script installs global npm packages without sudo. If you get npm permission errors, follow the guide to using npm without sudo [here](https://github.com/sindresorhus/guides/blob/master/npm-global-without-sudo.md).

### PhantomJS permissions errors (OSX)
If you get an error about not having permissions to execute PhantomJS during `make compile`, your machine is probably set up as managed and you'll need to ask IT to make it unmanaged.

### File handles - "Too many files open"

You may run into a "too many files open" error during compilation or reloading. You can find out how many file handles you are allowed per process by running `ulimit -n`. This can be quite low, e.g. 1024 on linux or 256 on Mac

### Linux

To increase the limit do the following (instructions from Ubuntu 12.10)...

In the file `/etc/security/limits.conf` add the following two lines
```
*  soft  nofile 20000
*  hard  nofile 65000
```

And in the file `/etc/pam.d/common-session` add the following line.
```
session required pam_limits.so
```

Restart the machine.

For more info see http://www.cyberciti.biz/faq/linux-increase-the-maximum-number-of-open-files/

### Mac

* Edit your `~/.bash-profile` file
* add the following line: `ulimit -n 1024`
* save and close the file
* back at the command prompt enter: `source .bash_profile` and hit return.

Now you should be able to compile and run. Yay.

### "No route to host" or "Unsupported major.minor version 52.0"

If you get no route to host, it means you are not using the 1.8 jre. Type `java -version` to check. You may need
to close and reopen your terminal if you installed 1.8 recently.

You may also see `java.lang.UnsupportedClassVersionError: play/runsupport/classloader/ApplicationClassLoaderProvider : Unsupported major.minor version 52.0` which is described in the [Play 2.4 migration guide](https://www.playframework.com/documentation/2.4.x/Migration24#Java-8-support).

Follow the [JDK install guide above.](#a-jdk)

