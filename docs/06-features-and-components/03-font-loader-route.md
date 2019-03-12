# theguardian.com/font-loader

The purpose of the `/font-loader` endpoint is to facilitate the sharing of the font styles from the main Guardian site with other Guardian sites.

## Why would you want to reuse these styles?

These font styles contain the base 64 encoded font files so user's don't have (re)download the font files, they also use the same fonts and styles as the main site meaning  you get consistency with the main site and finally if a user's visited the main site before they visit your site these styles will have already been downloaded and saved to `localStorage` so it's relatively quick to pull them from storage on subsequent visits!

Unfortunately subdomains of `theguardian.com` can't access the main sites `localStorage`, this is where the `/font-loader` page comes in...

Adding an iframe to your page that points to the `https://theguradian.com/font-loader` opens up a communication channel between your site and the font loader. Using the `postMessage` API your site can receive messages from the `/font-loader` endpoint, this message has a `name` property with the value `guardianFonts`. As soon as it's loaded the `/font-loader` endpoint retrieves the font styles and attempts to send them to your site.

Note, the endpoint currently returns font styles for the following 3 font families:

`Guardian Egyptian Web` which maps to the font `Guardian Headline`
`Guardian Text Egyptian Web` which maps to the font `Guardian Text Egyptian`
`Guardian Text Sans Web` which maps to the font `Guardian Text Sans`

Below is an example code snippet that can be included inline on you site, this manages the addition of the iframe and receiving the message from `/font-loader` with the styles:

```html
<script type="text/javascript">
   (function(window, document) {
     var head = document.getElementsByTagName('head')[0];

     var useFont = function(font) {
       if (font.css) {
         var style = document.createElement('style');

         style.innerHTML = font.css;

         head.appendChild(style);
       }
     };

     var loadFonts = function() {
       var iframe = document.createElement('iframe');

       iframe.src = 'https://www.theguardian.com/font-loader';
       iframe.style.display = 'none';

       // add iframe and wait for message
       window.addEventListener('message', function(e) {
         if (
           e &&
           e.data &&
           e.data.name &&
           e.data.name === 'guardianFonts' &&
           e.data.fonts &&
           e.source === iframe.contentWindow
         ) {
           e.data.fonts.forEach(useFont);
         }
       });

       document.body.appendChild(iframe);
     };

     document.addEventListener('DOMContentLoaded', loadFonts);
   })(window, document);
</script>
```

A version of this script is available on NPM at https://www.npmjs.com/package/@guardian/font-loader

