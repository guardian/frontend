#!/usr/bin/env bash

# Display deprecation notice
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  NOTICE: Using the \`./sbt\` wrapper is no longer necessary."
echo ""
echo "   You can now run 'sbt' directly instead of './sbt'"
echo "   JVM options are configured in the .jvmopts file"
echo "   See: https://github.com/guardian/frontend/pull/28599"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# sleep for a few seconds to ensure the user sees the message
sleep 10

# Forward all arguments to sbt
exec sbt "$@"

