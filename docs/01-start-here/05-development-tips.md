# Development tips

## Client-side development

### watch/reload
There is a `make watch` task available to build and watch for development
changes. View it on port `3000` - it uses [Browsersync](https://www.browsersync.io/) under the hood.

If you use `m.thegulocal.com` it will try port `3000` and fall back to `9000` if unavailable.

```bash
make watch
```

### Testing your JavaScript
You can run the Jasmine unit test suite with

```
make test
```

### Things to do before you commit
```
make fix
make validate
```
These will fix up the linting issues and check all the flow types to make sure you won't have any issue
trying to push or with the simple parts of the build.

If you have already committed you can use `make fix-commits` to verify & fix your commited code. It's 
faster than `make fix` but you will need to amend your previous commits to get a clean history.

If you are wondering what other options make has, you can simply type `make` at the comment line.

## Server-side development

### Clean all projects

It is often necessary to clean the `root` project when 3rd-party libs have been updated for instance.
Developers can use the `cleanAll` sbt task to clean all sbt projects, rather than only cleaning the current project.


### Debugging Play application
You can debug your local Frontend application, by attaching a debugger.

* Start Simple Build Tool in debug mode by typing `./sbt --debug`.
* Build and run your application. See "Running" for steps.
* Use a debugger to attach to the remote Java process, on localhost:1044.

Any IDE debugger should be compatible. In IntelliJ, add a new Debug Configuration,
based on the Remote default.
Ensure the Transport is Socket, the Debugger mode is Attach, and the port is set to 1044.
Start a new Debug session, and your breakpoints should be active.

### Developing in IntelliJ
 
To use the sbt shell, you should use the same configuration for the JVM as in the [custom sbt script](../../sbt).
As an example of how to achieve this, the picture below demonstrates increasing the maximum heap size to 8000 and 
providing the `APP_SECRET` as a Java system property.

![sbt_options](https://user-images.githubusercontent.com/4085817/67011346-4ce99980-f0e7-11e9-81fd-f1208e672800.png)

Being able to use sbt shell has a number of advantages:
- IntelliJ can be [configured to use sbt shell for build and import](https://intellij-support.jetbrains.com/hc/en-us/community/posts/115000117230-Sbt-shell-for-build-an-import);
- and (perhaps more pertinently), by clicking on the debug icon (pictured below) you can debug the Scala application(s) 
without having to configure the debugger yourself:

  ![debug_icon](https://user-images.githubusercontent.com/4085817/67011976-7bb43f80-f0e8-11e9-93fd-052ede190e34.png)

### Viewing AMP Pages

[Use DCR](https://github.com/guardian/dotcom-rendering/blob/main/docs/architecture/amp/000-structure-for-initial-milestone.md)
