#!/bin/bash

set -o errexit

grunt validate:sass validate:js test:unit

./sbt 'project root' test