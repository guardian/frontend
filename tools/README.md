# Dev tasks

This directory contains its own checked in `node_modules`:

- `check-yarn` uses the `semver` package to make sure we have a recent-enough version of `yarn` available. But `yarn` _installs_ `node_modules`, therefore we cannot rely on them being available, so this one is checked in.
