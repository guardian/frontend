Updating Social Media Overlay Images
====================================

We use the [overlay capability of Fastly IO](https://docs.fastly.com/api/imageopto/overlay) to generate images for social
media - [here](https://i.guim.co.uk/img/media/a16462a73520e333b6b0f84cc487dc5c1cde68a3/0_173_5184_3110/master/5184.jpg?width=1200&height=630&quality=85&auto=format&fit=crop&overlay-align=bottom%2Cleft&overlay-width=100p&overlay-base64=L2ltZy9zdGF0aWMvb3ZlcmxheXMvdGctb3BpbmlvbnMucG5n&s=63e3b63a91b42000daefd4811f513ada)
is an example with the guardian logo overlayed on it. The code that generates the urls for these images exists in 
`ImageProfile.scala`.

Overlay images are currently all hosted from the frontend static S3 bucket, so to update the images you'll need access to
S3. It's recommended you add any new overlay images under `overlays/`. You can check that your new image has been properly
uploaded it by hitting it at `https://static.guim.co.uk/<key of your image in s3>`.

e.g. to add a new `logo.png` image the following command should work:
`aws s3 cp logo.png s3://<frontend static bucket>/overlays/logo.png --profile frontend`

If you've updated an image you'll need to clear the cache for that image using the 
[image cache clearing tool](https://frontend.gutools.co.uk/images/clear) - you'll need the direct `i.guim` url of the overlay
image, for example `https://i.guim.co.uk/img/static/overlays/tg-default.png` - note that this URL isn't signed so will return
a 403, but will still work in the cache clearing tool.

You can then reference the image in a url either by using the existing logic in `ImageProfile.scala` or like this:
`https://i.guim.co.uk/img/media/abc123/master/1234.jpg?overlay-base64=<base64encode(/img/static/overlays/logo.png)`

See the fastly docs referenced above, or if you're feeling brave the [fastly image service vcl](https://github.com/guardian/fastly-image-service)
for further details.
