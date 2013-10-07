
The _responsive image server_ project is a simple Play application that transforms images (JPGs, PNGs etc.) on demand.

This is useful for responsive websites given the variation of device size, resolutions and network speeds we have to design for.

It it also designed to abstract away the presentation of the images (formats, dimensions etc.) from the production processes (image selection, cropping etc.).

# Architecture

Each request for a PNG and JPG travels through this route. 

```
Client -> i.guim.co.uk (CDN) -> Image Server ELB (AWS) -> Play app -> static.guim.co.uk (source JPG) 
```

The source JPG or PNG is currently uploaded to S3 by R2.

# Design decisions

This explains the rationale for some of the implementation details of the image server.

- The [im4java](im4java.sourceforge.net) library (ImageMagick for Java) produces slightly better results, albeit a few percent
  larger, than the pure Java library we used ([Scalr](https://github.com/thebuzzmedia/imgscalr)).
- im4java also provides better support for modern web formats like progressive JPG encoding and WebP (presently, WebP is unsupported by ImageMagick on ubuntu 12.04, 1/10/13).
- GraphicsMagick is better supported by CentOS, so we used that over ImageMagick which didn't install cleanly from the standard EPEL repo.
- The im4java library pipes out to the (blocking) GraphicsMagick command line tool (called 'gm').
- We do not write to disk during the image transform. The origin image is represented in the response body of a Play request and piped
  in to GraphicsMagick via STDIN. Likewise, post-transform, GraphicsMagick sends the output to STDOUT, which is read by im4java and sent back by Play
  to the CDN in the response body. This, we assume, is better than lots of disk I/O.
- Image processing is slightly more processor and memory intensive than a standard web GET request so we use large EC2 instances.
- GraphicsMagick strips out all the meta-data (EXIF, IPTC) from the source images. If someone wants to view this meta-data it's still available on the
  static host. (Legal do have some need for this).

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
- GraphicsMagick has no support for WebP, so we need to graft the scala/java implementation on to the image server.

