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