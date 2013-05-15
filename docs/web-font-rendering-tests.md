# Web Font Rendering Test

## Background

The site loads a number of web fonts on a user's first page view, which are then cached (via `localStorage`) for future page views. While the font is downloading, a fallback font is shown so that the news can be read by the user as soon as possible. This test is to determine the impact of showing vs not showing the fallback font on certain key metrics.

* Homepage bounce rate
* Article bounce rate
* Page views per visit

## Method

If a user already has the font cached, they are not part of the test. Users that do not have the fonts cached are put into one of two groups. A proportion are put into a control group and will experience the fallback font as normal. The remainder go into a 'nofallback' group and will have all fonts hidden for a set period of time. We then compare the metrics we are interested in for those two groups.

[View the code](https://github.com/guardian/frontend/blob/84cfb8da0cf921f08cbc6184102342e563c65b0b/common/app/views/fragments/commonJavaScriptSetup.scala.html#L75)

## Problems

Test results are not sent back to our tracking server until the window's `load` event. This means that if the user gives up waiting before that time then no results are recorded for that page view. The extent of this problem might be able to be partially determined by comparing the instances in each test bucket with the expected proportions.

## Results

### Test 1

* 10th-13th May (72 hours)
* 3 second font delay when uncached

| Test group | Instances |  Proportion | Homepage bounce | Article bounce | Pages per visit | 
| ---------- | ----- | ---------- | --------------- | -------------- | --------------- |
| Control    | 1,962,023 | 90% | 30.4% | 86.1% | Help |
| No fallback| 218,364 | 10% | 30.1% | 86.6% | Help |

### Test 2

* 13th-14th May
* 3 second font delay when uncached
* NB: All font caches were cleared before this test

| Test group | Instances | Proportion | Homepage bounce | Article bounce | Pages per visit | 
| ---------- | --------- | ---------- | --------------- | -------------- | --------------- |
| Control    |  | 50% |  |  |  |
| No fallback|  | 50% |  |  |  |


### Conclusion

Showing the fallback font has no significant impact on any of the relevant metrics. Oh.

## Further tests

Delay font rendering for all page views, even when the fonts are cached. Presumably we still hypothesise that the content rendering time impacts our metrics. This test will prove or disprove that.

### Test 3

* Not yet run
* 3 second font delay for all page views
* NB: All font caches were cleared before this test

| Test group | Instances | Proportion | Homepage bounce | Article bounce | Pages per visit | 
| ---------- | --------- | ---------- | --------------- | -------------- | --------------- |
| Control    |  | 50% |  |  |  |
| No fallback|  | 50% |  |  |  |