Updating Social Media Overlay Images
====================================

We use the [overlay capability of Fastly IO](https://docs.fastly.com/api/imageopto/overlay) to generate images for social
media - [here]() is an example with the guardian logo overlayed on it. The code that generates the urls for these images
exists in `Profile.scala`. 

Overlay images are currently all hosted from the frontend static S3 bucket, so to update the images you'll need access to
S3. It's recommended you add any new overlay images under `overlays/`. You can check that your new image has been properly
uploaded it by hitting it at `https://static.guim.co.uk/<key of your image in s3>`.

e.g. to add a new `logo.png` image the following command should work:
`aws s3 cp logo.png s3://<frontend static bucket>/overlays/logo.png --profile frontend`

You can then reference the image in a url either by using the existing logic in `Profile.scala` or like this:
`https://i.guim.co.uk/img/media/abc123/master/1234.jpg?overlay-base64=<base64encode(/img/static/overlays/logo.png)`

See the fastly docs referenced above, or if you're feeling brave the [fastly image service vcl](https://github.com/guardian/fastly-image-service)
for further details.
