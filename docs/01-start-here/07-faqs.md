# FAQs

## I can see mark-up in my response, but it's not in the application anywhere. Where is it coming from?

If you can't find your element in views, cleaners or JS, it is likely your markup is coming from CAPI and used as-is. You can use Teleporter (ask your neighbour if you don't know what that is) to view the response from CAPI on the page you're seeing the mark-up.

For example: you're trying to style a class, but can't find it in the Frontend codebase and want to make sure it's only used in the HTML where you're looking.

In this case, you can check in the `content-api` repo and your class will probably appear in some text fixtures and then you can look in the `flexible-content` repo (composer) where you'll probably see the view that adds the class you're styling.

If your class only appears on the component you expected, you can be fairly confident that it won't appear anywhere else.

## What are the make commands on Frontend?

Run `make` without any arguments or look in the [makefile](https://github.com/guardian/frontend/blob/master/makefile)

## How do I run JS, bundled and hashed, as I would see it on the live site?

To see hashed JS bundles locally you can set assets.useHashedBundles=true in your frontend.conf and run make compile.

## How do I run identity and access profile pages locally?

You'll need to [setup nginx](https://github.com/guardian/frontend/blob/2e00099b6509024fd5a9f04aa7daea03e08281ac/nginx/README.md) and then set-up the [identity frontend](https://github.com/guardian/identity-frontend)

## How do I link a badge to a secret tag?

Sometimes we want to create a badge for a story, but don't want the world to know what that story is until it is released. We therefore need to encrypt the tag name that the badge is being applied to. This all happens in [Badges.scala](https://github.com/guardian/frontend/blob/master/common/app/model/Badges.scala).

To link a badge to a secret tag:

1. Install `pwgen`, a random string generator. Mac users can install this using Homebrew: `brew install pwgen`
2. Generate a bunch of random strings: `pwgen -n -y 20`. Copy one of them to the clipboard. This will be the salt.
3. From the command line, run `sbt`. Inside `sbt` run `console`
4. From the console run: `import java.security.MessageDigest`
5. From the console run: `import java.math.BigInteger`
6. From the console run: `val input = "[salt from the clipboard]" + "your/secret/tag"`
7. From the console run: `val digest = MessageDigest.getInstance("MD5")`
8. From the console run: `digest.update(input.getBytes(), 0, input.length)`
9. From the console run: `new BigInteger(1, digest.digest()).toString(16)`
10. The result of the last step is your encrypted tag
11. In the `Badges` object, add a new val: `val specialReport = SpecialBadge("[salt]", "[encrypted tag]", Static("path/to/Badge.svg"))`
12. In CODE create an article with your new tag and ensure the badge is applied correctly
