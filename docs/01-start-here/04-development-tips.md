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

You can run the unit test suite with

```
make test
```

### Things to do before you commit

```
make fix
make validate
```

These will fix the linting issues to make sure you won't have any issue trying to push or with the simple parts of the build.

If you have already committed you can use `make fix-commits` to verify & fix your committed code. It's
faster than `make fix` but you will need to amend your previous commits to get a clean history.

If you are wondering what other options make has, you can simply type `make` at the comment line.

## Server-side development

### Clean all projects

It is often necessary to clean the `root` project when 3rd-party libs have been updated for instance.
Developers can use the `cleanAll` sbt task to clean all sbt projects, rather than only cleaning the current project.

### Developing in IntelliJ

The integrated SBT shell should automatically pick the `.jvmopts` file, no more specific set-up is required.

Running the application through IntelliJ presents the benefit of being able to easily set debugging breakpoints.

### Debugging Play application

You can debug your local Frontend application, by attaching a debugger to the sbt shell.

-   In IntelliJ, settings -> sbt -> "Enable debbugging"
-   Then go to the sbt shell (Cmd+Shift+S), the "Attach debugger to shell" button should have appeared, click it.
-   You can now run your application and place breakpoints in your code.

    ![debug_icon](https://user-images.githubusercontent.com/4085817/67011976-7bb43f80-f0e8-11e9-93fd-052ede190e34.png)
