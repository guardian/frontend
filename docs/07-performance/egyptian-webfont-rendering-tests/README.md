# Egyptian Webfont Rendering Test

## Testing Environments
- Android Samsung Galaxy SIII (4.1)
- iOS iPhone 4S (6.0)
- OSX 10.8 Chrome 26.0
- OSX 10.8 Firefox 23.0 aurora
- OSX 10.8 Opera 12.15
- OSX 10.8 Safari 6.0
- Win 7 Chrome 28.0
- Win 7 Firefox 24.0 aurora
- Win 7 IE 9.0
- Win 7 IE 10.0
- Win 7 IE 11.0
- Win 7 Opera 12.16
- Win 8 Chrome 28.0
- Win 8 Firefox 24.0 aurora
- Win 8 IE 10.0 Desktop
- Win 8 Opera 12.16
- Win XP Chrome_28.0
- Win XP Firefox 24.0 aurora
- Win XP Opera 12.16

Note: on Windows, [Cleartype](http://en.wikipedia.org/wiki/ClearType "ClearType - Wikipedia, the free encyclopedia") is on. Rendering may vary depending on the display settings of the user.


## Fonts

### Headline Light
- [Hinting OFF](http://www.kaelig.fr/gu/fonts/hint-off/EgyptianHeadline-Light/Guardian%20Egyp%20Web-Light.html)
- [Hinting ON](http://www.kaelig.fr/gu/fonts/hint-on/EgyptianHeadline-Light/Guardian%20Egyp%20Web-Light.html)

### Headline Medium
- [Hinting OFF](http://www.kaelig.fr/gu/fonts/hint-off/EgyptianHeadline-Medium/Guardian%20Egyp%20Web-Medium.html)
- [Hinting ON](http://www.kaelig.fr/gu/fonts/hint-on/EgyptianHeadline-Medium/Guardian%20Egyp%20Web-Medium.html)

### Headline Semibold
- [Hinting OFF](http://www.kaelig.fr/gu/fonts/hint-off/EgyptianHeadline-Semibold/Guardian%20Egyp%20Web-Semibold.html)
- [Hinting ON](http://www.kaelig.fr/gu/fonts/hint-on/EgyptianHeadline-Semibold/Guardian%20Egyp%20Web-Semibold.html)

### Headline Bold
- [Hinting OFF](http://www.kaelig.fr/gu/fonts/hint-off/EgyptianHeadline-Bold/Guardian%20Egyp%20Web-Bold.html)
- [Hinting ON](http://www.kaelig.fr/gu/fonts/hint-on/EgyptianHeadline-Bold/Guardian%20Egyp%20Web-Bold.html)

### Text Regular
- [Hinting OFF](http://www.kaelig.fr/gu/fonts/hint-off/EgyptianText-Regular/Guardian%20Text%20Egyp%20Web-Reg.html)
- [Hinting ON](http://www.kaelig.fr/gu/fonts/hint-on/EgyptianText-Regular/Guardian%20Text%20Egyp%20Web-Reg.html)

### Text Regular Italic
- [Hinting OFF](http://www.kaelig.fr/gu/fonts/hint-off/EgyptianText-RegularItalic/Guardian%20Text%20Egyp%20Web-Reg%20It.html)
- [Hinting ON](http://www.kaelig.fr/gu/fonts/hint-on/EgyptianText-RegularItalic/Guardian%20Text%20Egyp%20Web-Reg%20It.html)

### Text Medium
- [Hinting OFF](http://www.kaelig.fr/gu/fonts/hint-off/EgyptianText-Medium/Guardian%20Text%20Egyp%20Web-Med.html)
- [Hinting ON](http://www.kaelig.fr/gu/fonts/hint-on/EgyptianText-Medium/Guardian%20Text%20Egyp%20Web-Med.html)


## Analysis

### Findings

**On mobile** (especially on iOS and Android), hinting has little to no incidence on rendering quality sizes.

**On Desktop**, hinting makes a big difference for browsers with an important market share, like Chrome.

Rendering is quite bad on XP, especially since cleartype is often turned off by default.

IE8 font rendering engine is quite good (not part of this test) at rendering Egyptian (text and headlines).

Agate Sans Hinted (not part of the test) rendered well everywhere at all sizes in other tests.

Hinted fonts files weigh 50% more than non-hinted font files.

XP has a very different font rendering engine from the other windows but its usage is decreasing.

Windows 7 and 8 do a good job at rendering fonts and text looks very similar between the two.

Georgia and Egyptian have very different x-heights. It means that the georgia fallbacks are never going to be as legible and good looking as the webfont.

### Recommendations

We should keep using non-hinted fonts on iOS and Android (smaller file size and good rendering)
On other platforms, we should use hinted fonts (bigger file size but no rendering issues)

#### Actions

- Serve .eot webfonts to IE8?
- Serve non-hinted webfonts only to iOS 5+ and Android 2.3+?
- Serve fonts the normal way to all other platforms (instead of using LocalStorage)
    - Generate different font formats: EOT, SVG
    - Make sure SVG and EOT are served gzipped
    - Serve fonts using the bulletproof fontspring CSS snippet

```css
    @font-face {
        font-family: 'MyFontFamily';
        src: url('myfont-webfont.eot?#iefix') format('embedded-opentype'),
             url('myfont-webfont.woff') format('woff'),
             url('myfont-webfont.ttf')  format('truetype'),
             url('myfont-webfont.svg#svgFontName') format('svg');
        }
```

- Monitor impact on load performance for first loads and repeat views
- Filter out XP users (Windows NT 5.1) from getting any webfonts?