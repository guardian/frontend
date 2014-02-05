
The _responsive image server_ project is a simple Play application that transforms images (JPGs, PNGs etc.) on demand.

This is useful for responsive websites given the variation of device size, resolutions and network speeds we have to design for.

It it also designed to abstract away the presentation of the images (formats, dimensions etc.) from the production processes (image selection, cropping etc.).

# Architecture

Each request for a PNG and JPG travels through this route. 

```
Client -> i.guim.co.uk (CDN) -> Image Server ELB (AWS) -> Play app -> static.guim.co.uk (source JPG) 
```

The source JPG or PNG is currently uploaded to S3 by R2.

## Profiles

We made a decision not to include the dimensions of the images and other transform instructions in the URL, Eg.

```
http://i.guim.co.uk/:width/:height/:quality/path/to/image.jpg
```

Instead we use the idea of a named profile in the URL that maps to an image transform configuration, Eg. 

```
http://i.guim.co.uk/:profile/path/to/image.jpg
```

This is for several reasons,

- The configuration lives in the code, which is a simpler place for it to live than scattered around many places in the view templates, especially when complex
  transforms (perhaps involving crops, adjustments in hue etc.).
- We don't expose a _temporary_ design decisions about dimensions etc. to systems that value the persistance of our images (Eg, caches, Google images). For
  example, if we adjust the compression ratio of all our JPEGs by a few percent we don't want all our images to suddely 404. (In this regard,
  changing the profile or adding a new one should be done knowingly and with longevity in mind.)
- We don't expose ourselves to servicing any resize requests made to our image server. Transforms are limited to what we know the system can
  handle and we can scale accordingly, Eg. knowing we have one millions JPGs in six different dimensions/sizes is efficient for cost and capacity
  planning.
- Likewise, the benefit here is also that this prevents 3rd parties from doing the same to our servers.

# Future work

- Later in 2013 we expect an Image API describing the location of higher resolution image assets, meta-data, suggested crops etc., so this server will
  probably need hooking up to that.
- Probably the whole organisation would benefit from this service, so at some point this might be split out from the frontend project, or forked.
- With the move to Varnish (and greater control over our cache logic) we can experiment with different image formats via the Accept header.

