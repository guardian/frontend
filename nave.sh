#!/bin/bash

# This program contains parts of narwhal's "sea" program,
# as well as bits borrowed from Tim Caswell's "nvm"

# nave install <version>
# Fetch the version of node and install it in nave's folder.

# nave use <version>
# Install the <version> if it isn't already, and then start
# a subshell with that version's folder at the start of the
# $PATH

# nave use <version> program.js
# Like "nave use", but have the subshell start the program.js
# immediately.

# When told to use a version:
# Ensure that the version exists, install it, and
# then add its prefix to the PATH, and start a subshell.

if [ "$NAVE_DEBUG" != "" ]; then
  set -x
fi

if [ -z "$BASH" ]; then
  cat >&2 <<MSG
Nave is a bash program, and must be run with bash.
MSG
  exit 1
fi

shell=`basename "$SHELL"`
case "$shell" in
  bash) ;;
  zsh) ;;
  *)
    echo "Nave only supports zsh and bash shells." >&2
    exit 1
    ;;
esac

# Use fancy pants globs
shopt -s extglob

# Try to figure out the os and arch for binary fetching
uname="$(uname -a)"
os=
arch=x86
case "$uname" in
  Linux\ *) os=linux ;;
  Darwin\ *) os=darwin ;;
  SunOS\ *) os=sunos ;;
esac
case "$uname" in
  *x86_64*) arch=x64 ;;
esac

tar=${TAR-tar}

main () {
  local SELF_PATH DIR SYM
  # get the absolute path of the executable
  SELF_PATH="$0"
  if [ "${SELF_PATH:0:1}" != "." ] && [ "${SELF_PATH:0:1}" != "/" ]; then
    SELF_PATH=./"$SELF_PATH"
  fi
  SELF_PATH=$( cd -P -- "$(dirname -- "$SELF_PATH")" \
            && pwd -P \
            ) && SELF_PATH=$SELF_PATH/$(basename -- "$0")

  # resolve symlinks
  while [ -h "$SELF_PATH" ]; do
    DIR=$(dirname -- "$SELF_PATH")
    SYM=$(readlink -- "$SELF_PATH")
    SELF_PATH=$( cd -- "$DIR" \
              && cd -- $(dirname -- "$SYM") \
              && pwd \
              )/$(basename -- "$SYM")
  done

  if ! [ -d "$NAVE_DIR" ]; then
    if [ -d "$HOME" ]; then
      NAVE_DIR="$HOME"/.nave
    else
      NAVE_DIR=/usr/local/lib/nave
    fi
  fi
  if ! [ -d "$NAVE_DIR" ] && ! mkdir -p -- "$NAVE_DIR"; then
    NAVE_DIR="$(dirname -- "$SELF_PATH")"
  fi

  # set up the naverc init file.
  # For zsh compatibility, we name this file ".zshenv" instead of
  # the more reasonable "naverc" name.
  # Important! Update this number any time the init content is changed.
  local rcversion="#3"
  local rcfile="$NAVE_DIR/.zshenv"
  if ! [ -f "$rcfile" ] \
      || [ "$(head -n1 "$rcfile")" != "$rcversion" ]; then

    cat > "$rcfile" <<RC
$rcversion
[ "\$NAVE_DEBUG" != "" ] && set -x || true
if [ "\$BASH" != "" ]; then
  if [ "\$NAVE_LOGIN" != "" ]; then
    [ -f ~/.bash_profile ] && . ~/.bash_profile || true
    [ -f ~/.bash_login ] && .  ~/.bash_login || true
    [ -f ~/.profile ] && . ~/.profile || true
  else
    [ -f ~/.bashrc ] && . ~/.bashrc || true
  fi
else
  [ -f ~/.zshenv ] && . ~/.zshenv || true
  export DISABLE_AUTO_UPDATE=true
  if [ "\$NAVE_LOGIN" != "" ]; then
    [ -f ~/.zprofile ] && . ~/.zprofile || true
    [ -f ~/.zshrc ] && . ~/.zshrc || true
    [ -f ~/.zlogin ] && . ~/.zlogin || true
  else
    [ -f ~/.zshrc ] && . ~/.zshrc || true
  fi
fi
unset ZDOTDIR
export PATH=\$NAVEPATH:\$PATH
[ -f ~/.naverc ] && . ~/.naverc || true
RC

    cat > "$NAVE_DIR/.zlogout" <<RC
[ -f ~/.zlogout ] && . ~/.zlogout || true
RC

  fi

  # couldn't write file
  if ! [ -f "$rcfile" ] || [ "$(head -n1 "$rcfile")" != "$rcversion" ]; then
    fail "Nave dir $NAVE_DIR is not writable."
  fi

  export NAVE_DIR
  export NAVE_SRC="$NAVE_DIR/src"
  export NAVE_ROOT="$NAVE_DIR/installed"
  ensure_dir "$NAVE_SRC"
  ensure_dir "$NAVE_ROOT"

  local cmd="$1"
  shift
  case $cmd in
    ls-remote | ls-all)
      cmd="nave_${cmd/-/_}"
      ;;
#    use)
#      cmd="nave_named"
#      ;;
    install | fetch | use | clean | test | named | \
    ls |  uninstall | usemain | latest | stable | has | installed )
      cmd="nave_$cmd"
      ;;
    * )
      cmd="nave_help"
      ;;
  esac
  $cmd "$@"
  local ret=$?
  if [ $ret -eq 0 ]; then
    exit 0
  else
    echo "failed with code=$ret" >&2
    exit $ret
  fi
}

function enquote_all () {
  local ARG ARGS
  ARGS=""
  for ARG in "$@"; do
    [ -n "$ARGS" ] && ARGS="$ARGS "
    ARGS="$ARGS'""$( echo " $ARG" \
                   | cut -c 2- \
                   | sed 's/'"'"'/'"'"'"'"'"'"'"'"'/g' \
                   )""'"
  done
  echo "$ARGS"
}

ensure_dir () {
  if ! [ -d "$1" ]; then
    mkdir -p -- "$1" || fail "couldn't create $1"
  fi
}

remove_dir () {
  if [ -d "$1" ]; then
    rm -rf -- "$1" || fail "Could not remove $1"
  fi
}

fail () {
  echo "$@" >&2
  exit 1
}

nave_fetch () {
  local version=$(ver "$1")
  if nave_has "$version"; then
    echo "already fetched $version" >&2
    return 0
  fi

  local src="$NAVE_SRC/$version"
  remove_dir "$src"
  ensure_dir "$src"

  local url
  local urls=(
    "http://nodejs.org/dist/v$version/node-v$version.tar.gz"
    "http://nodejs.org/dist/node-v$version.tar.gz"
    "http://nodejs.org/dist/node-$version.tar.gz"
  )
  for url in "${urls[@]}"; do
    get -#Lf "$url" > "$src".tgz
    if [ $? -eq 0 ]; then
      $tar xzf "$src".tgz -C "$src" --strip-components=1
      if [ $? -eq 0 ]; then
        echo "fetched from $url" >&2
        return 0
      fi
    fi
  done

  rm "$src".tgz
  remove_dir "$src"
  echo "Couldn't fetch $version" >&2
  return 1
}

get () {
  curl -H "user-agent:nave/$(curl --version | head -n1)" "$@"
  return $?
}

build () {
  local version="$1"

  # shortcut - try the binary if possible.
  if [ -n "$os" ]; then
    local binavail
    # binaries started with node 0.8.6
    case "$version" in
      0.8.[012345]) binavail=0 ;;
      0.[1234567]) binavail=0 ;;
      *) binavail=1 ;;
    esac
    if [ $binavail -eq 1 ]; then
      local t="$version-$os-$arch"
      local url="http://nodejs.org/dist/v$version/node-v${t}.tar.gz"
      local tgz="$NAVE_SRC/$t.tgz"
      get -#Lf "$url" > "$tgz"
      if [ $? -ne 0 ]; then
        # binary download failed.  oh well.  cleanup, and proceed.
        rm "$tgz"
        echo "Binary download failed, trying source." >&2
      else
        # unpack straight into the build target.
        $tar xzf "$tgz" -C "$2" --strip-components 1
        if [ $? -ne 0 ]; then
          rm "$tgz"
          nave_uninstall "$version"
          echo "Binary unpack failed, trying source." >&2
        fi
        # it worked!
        echo "installed from binary" >&2
        return 0
      fi
    fi
  fi

  nave_fetch "$version"
  if [ $? != 0 ]; then
    # fetch failed, don't continue and try to build it.
    return 1
  fi

  local src="$NAVE_SRC/$version"
  local jobs=$NAVE_JOBS
  jobs=${jobs:-$JOBS}
  jobs=${jobs:-$(sysctl -n hw.ncpu)}
  jobs=${jobs:-2}

  ( cd -- "$src"
    [ -f ~/.naverc ] && . ~/.naverc || true
    if [ "$NAVE_CONFIG" == "" ]; then
      NAVE_CONFIG=()
    fi
    JOBS=$jobs ./configure "${NAVE_CONFIG[@]}" --prefix="$2" \
      || fail "Failed to configure $version"
    JOBS=$jobs make -j$jobs \
      || fail "Failed to make $version"
    make install || fail "Failed to install $version"
  ) || fail "fail"
  return $?
}

nave_usemain () {
  if [ ${NAVELVL-0} -gt 0 ]; then
    fail "Can't usemain inside a nave subshell. Exit to main shell."
  fi
  local version=$(ver "$1")
  local current=$(node -v || true)
  local wn=$(which node || true)
  local prefix="/usr/local"
  if [ "x$wn" != "x" ]; then
    prefix="${wn/\/bin\/node/}"
    if [ "x$prefix" == "x" ]; then
      prefix="/usr/local"
    fi
  fi
  current="${current/v/}"
  if [ "$current" == "$version" ]; then
    echo "$version already installed" >&2
    return 0
  fi

  build "$version" "$prefix"
}

nave_install () {
  local version=$(ver "$1")
  if [ -z "$version" ]; then
    fail "Must supply a version ('stable', 'latest' or numeric)"
  fi
  if nave_installed "$version"; then
    echo "Already installed: $version" >&2
    return 0
  fi
  local install="$NAVE_ROOT/$version"
  ensure_dir "$install"

  build "$version" "$install"
  local ret=$?
  if [ $ret -ne 0 ]; then
    remove_dir "$install"
    return $ret
  fi
}

nave_test () {
  local version=$(ver "$1")
  nave_fetch "$version"
  local src="$NAVE_SRC/$version"
  ( cd -- "$src"
    [ -f ~/.naverc ] && . ~/.naverc || true
    if [ "$NAVE_CONFIG" == "" ]; then
      NAVE_CONFIG=()
    fi
    ./configure "${NAVE_CONFIG[@]}" || fail "failed to ./configure"
    make test-all || fail "Failed tests"
  ) || fail "failed"
}

nave_ls () {
  ls -- $NAVE_SRC | version_list "src" \
    && ls -- $NAVE_ROOT | version_list "installed" \
    && nave_ls_named \
    || return 1
}

nave_ls_remote () {
  get -s http://nodejs.org/dist/ \
    | version_list "remote" \
    || return 1
}

nave_ls_named () {
  echo "named:"
  ls -- "$NAVE_ROOT" \
    | egrep -v '[0-9]+\.[0-9]+\.[0-9]+' \
    | sort \
    | while read name; do
      echo "$name: $(ver $($NAVE_ROOT/$name/bin/node -v 2>/dev/null))"
    done
}

nave_ls_all () {
  nave_ls \
    && (echo ""; nave_ls_remote) \
    || return 1
}

ver () {
  local version="$1"
  local nonames="$2"
  version="${version/v/}"
  case $version in
    latest | stable) nave_$version ;;
    +([0-9])\.+([0-9])) nave_version_family "$version" ;;
    +([0-9])\.+([0-9])\.+([0-9])) echo $version ;;
    *) [ "$nonames" = "" ] && echo $version ;;
  esac
}

nave_version_family () {
  local family="$1"
  family="${family/v/}"
  get -s http://nodejs.org/dist/ \
    | egrep -o $family'\.[0-9]+' \
    | sort -u -k 1,1n -k 2,2n -k 3,3n -t . \
    | tail -n1
}

nave_latest () {
  get -s http://nodejs.org/dist/ \
    | egrep -o '[0-9]+\.[0-9]+\.[0-9]+' \
    | sort -u -k 1,1n -k 2,2n -k 3,3n -t . \
    | tail -n1
}

nave_stable () {
  get -s http://nodejs.org/dist/ \
    | egrep -o '[0-9]+\.[0-9]*[02468]\.[0-9]+' \
    | sort -u -k 1,1n -k 2,2n -k 3,3n -t . \
    | tail -n1
}

version_list_named () {
  egrep -v '[0-9]+\.[0-9]+\.[0-9]+' \
    | sort -u -k 1,1n -k 2,2n -k 3,3n -t . \
    | organize_version_list \
    || return 1
}

version_list () {
  echo "$1:"
  egrep -o '[0-9]+\.[0-9]+\.[0-9]+' \
    | sort -u -k 1,1n -k 2,2n -k 3,3n -t . \
    | organize_version_list \
    || return 1
}

organize_version_list () {
  local i=0
  local v
  while read v; do
    if [ $i -eq 8 ]; then
      i=0
      echo "$v"
    else
      let 'i = i + 1'
      echo -ne "$v\t"
    fi
  done
  echo ""
  [ $i -ne 0 ] && echo ""
  return 0
}

nave_has () {
  local version=$(ver "$1")
  [ -x "$NAVE_SRC/$version/configure" ] || return 1
}

nave_installed () {
  local version=$(ver "$1")
  [ -x "$NAVE_ROOT/$version/bin/node" ] || return 1
}

nave_use () {
  local version=$(ver "$1")

  # if it's not a version number, then treat as a name.
  case "$version" in
    +([0-9])\.+([0-9])\.+([0-9])) ;;
    *)
      nave_named "$@"
      return $?
      ;;
  esac

  if [ -z "$version" ]; then
    fail "Must supply a version"
  fi

  if [ "$version" == "$NAVENAME" ]; then
    echo "already using $version" >&2
    if [ $# -gt 1 ]; then
      shift
      "$@"
    fi
    return $?
  fi

  nave_install "$version" || fail "failed to install $version"
  local prefix="$NAVE_ROOT/$version"
  local lvl=$[ ${NAVELVL-0} + 1 ]
  echo "using $version" >&2
  if [ $# -gt 1 ]; then
    shift
    nave_exec "$lvl" "$version" "$version" "$prefix" "$@"
    return $?
  else
    nave_login "$lvl" "$version" "$version" "$prefix"
    return $?
  fi
}

# internal
nave_exec () {
  nave_run "exec" "$@"
  return $?
}

nave_login () {
  nave_run "login" "$@"
  return $?
}

nave_run () {
  local exec="$1"
  shift
  local lvl="$1"
  shift
  local name="$1"
  shift
  local version="$1"
  shift
  local prefix="$1"
  shift

  local bin="$prefix/bin"
  local lib="$prefix/lib/node"
  local man="$prefix/share/man"
  ensure_dir "$bin"
  ensure_dir "$lib"
  ensure_dir "$man"

  # now $@ is the command to run, or empty if it's not an exec.
  local exit_code
  local args=()
  local isLogin

  if [ "$exec" == "exec" ]; then
    isLogin=""
    # source the nave env file, then run the command.
    args=("-c" ". $(enquote_all $NAVE_DIR/.zshenv); $(enquote_all "$@")")
  elif [ "$shell" == "zsh" ]; then
    isLogin="1"
    # no need to set rcfile, since ZDOTDIR is set.
    args=()
  else
    isLogin="1"
    # bash, use --rcfile argument
    args=("--rcfile" "$NAVE_DIR/.zshenv")
  fi

  local nave="$version"
  if [ "$version" != "$name" ]; then
    nave="$name"-"$version"
  fi

  NAVELVL=$lvl \
  NAVEPATH="$bin" \
  NAVEVERSION="$version" \
  NAVENAME="$name" \
  NAVE="$nave" \
  npm_config_binroot="$bin"\
  npm_config_root="$lib" \
  npm_config_manroot="$man" \
  npm_config_prefix="$prefix" \
  NODE_PATH="$lib" \
  NAVE_LOGIN="$isLogin" \
  NAVE_DIR="$NAVE_DIR" \
  ZDOTDIR="$NAVE_DIR" \
    "$SHELL" "${args[@]}"

  exit_code=$?
  hash -r
  return $exit_code
}

nave_named () {
  local name="$1"
  shift

  local version=$(ver "$1" NONAMES)
  if [ "$version" != "" ]; then
    shift
  fi

  add_named_env "$name" "$version" || fail "failed to create $name env"

  if [ "$name" == "$NAVENAME" ] && [ "$version" == "$NAVEVERSION" ]; then
    echo "already using $name" >&2
    if [ $# -gt 0 ]; then
      "$@"
    fi
    return $?
  fi

  if [ "$version" = "" ]; then
    version="$(ver "$("$NAVE_ROOT/$name/bin/node" -v 2>/dev/null)")"
  fi

  local prefix="$NAVE_ROOT/$name"

  local lvl=$[ ${NAVELVL-0} + 1 ]
  # get the version
  if [ $# -gt 0 ]; then
    nave_exec "$lvl" "$name" "$version" "$prefix" "$@"
    return $?
  else
    nave_login "$lvl" "$name" "$version" "$prefix"
    return $?
  fi
}

add_named_env () {
  local name="$1"
  local version="$2"
  local cur="$(ver "$($NAVE_ROOT/$name/bin/node -v 2>/dev/null)" "NONAMES")"

  if [ "$version" != "" ]; then
    version="$(ver "$version" "NONAMES")"
  else
    version="$cur"
  fi

  if [ "$version" = "" ]; then
    echo "What version of node?"
    read -p "stable, latest, x.y, or x.y.z > " version
    version=$(ver "$version")
  fi

  # if that version is already there, then nothing to do.
  if [ "$cur" = "$version" ]; then
    return 0
  fi

  echo "Creating new env named '$name' using node $version" >&2

  nave_install "$version" || fail "failed to install $version"
  ensure_dir "$NAVE_ROOT/$name/bin"
  ensure_dir "$NAVE_ROOT/$name/lib/node"
  ensure_dir "$NAVE_ROOT/$name/lib/node_modules"
  ensure_dir "$NAVE_ROOT/$name/share/man"

  ln -sf -- "$NAVE_ROOT/$version/bin/node" "$NAVE_ROOT/$name/bin/node"
  ln -sf -- "$NAVE_ROOT/$version/bin/node-waf" "$NAVE_ROOT/$name/bin/node-waf"
}

nave_clean () {
  rm -rf "$NAVE_SRC/$(ver "$1")" "$NAVE_SRC/$(ver "$1")".tgz "$NAVE_SRC/$(ver "$1")"-*.tgz
}

nave_uninstall () {
  remove_dir "$NAVE_ROOT/$(ver "$1")"
}

nave_help () {
  cat <<EOF

Usage: nave <cmd>

Commands:

install <version>    Install the version passed (ex: 0.1.103)
use <version>        Enter a subshell where <version> is being used
use <ver> <program>  Enter a subshell, and run "<program>", then exit
use <name> <ver>     Create a named env, using the specified version.
                     If the name already exists, but the version differs,
                     then it will update the link.
usemain <version>    Install in /usr/local/bin (ie, use as your main nodejs)
clean <version>      Delete the source code for <version>
uninstall <version>  Delete the install for <version>
ls                   List versions currently installed
ls-remote            List remote node versions
ls-all               List remote and local node versions
latest               Show the most recent dist version
help                 Output help information

<version> can be the string "latest" to get the latest distribution.
<version> can be the string "stable" to get the latest stable version.

EOF
}

main "$@"