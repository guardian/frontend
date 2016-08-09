# Web Font Rendering Test (2013)

## Background

The site loads a number of web fonts on a user's first page view, which are then cached (via `localStorage`) for future page views. While the font is downloading, a fallback font is shown so that the news can be read by the user as soon as possible. This test is to determine the impact of showing vs not showing the fallback font on certain key metrics.

* Homepage bounce rate
* Article bounce rate
* Page views per visit

## Method

If a user already has the font cached, they are not part of the test. Users that do not have the fonts cached are put into one of two groups. A proportion are put into a control group and will experience the fallback font as normal. The remainder go into a 'nofallback' group and will have all fonts hidden for a set period of time. We then compare the metrics we are interested in for those two groups.

[View the code](https://github.com/guardian/frontend/blob/84cfb8da0cf921f08cbc6184102342e563c65b0b/common/app/views/fragments/commonJavaScriptSetup.scala.html#L75)

## Problems

Test results are not sent back to our tracking server until the window's `load` event. This means that if the user gives up waiting before that time then no results are recorded for that page view. However, the test itself does not effect the delay of the tracking call. The extent of this problem might be able to be partially determined by comparing the instances in each test bucket with the expected proportions.

## Results

### Test 1 - WebFontFallback

* 10th-13th May (72 hours)
* 3 second font delay when uncached

| Test group | Instances |  Proportion | Homepage bounce | Article bounce | Pages per visit | 
| ---------- | --------- | ----------  | --------------- | -------------- | --------------- |
| Control    | 1,962,023 | 90%         | 30.4%           | 86.1%          | 1.40            |
| No fallback| 218,364   | 10%         | 30.1%           | 86.6%          | 1.38            |

### Test 2 - WebFontFallbackAllUsers

* 13th-15th May (43 hours)
* 3 second font delay when uncached
* NB: All font caches were cleared before this test

| Test group | Instances | Proportion | Homepage bounce | Article bounce | Pages per visit | 
| ---------- | --------- | ---------- | --------------- | -------------- | --------------- |
| Control    | 788,727   | 50%        | 30.4%           | 82.5%          | 1.36            |
| No fallback| 794,449   | 50%        | 30.6%           | 82.0%          | 1.36            |


### Initial conclusion

Showing the fallback font for first page view had no significant impact on any of the tested metrics. Tests over a longer time frame are required to measure longer term engagement metrics.

## Further tests

Delay font rendering for all page views, even when the fonts are cached.

### Test 3 - DelayFontAllPages

* 15th May
* 3 second font delay for all page views

| Test group | Instances   | Proportion | Homepage bounce | Article bounce | Pages per visit | 
| ---------- | ----------- | ---------- | --------------- | -------------- | --------------- |
| Control    | 30,150,460  | 99%        | 27.5%           | 83.7%          | 1.76            |
| Delay      | 301,207     | 1%         | 27.9%           | 82.7%          | 1.74            |
