
Average
-------

- In July we frequently served over 10k request p/min, which is around 166 request p/sec.
- UK lunch time is the busiest period of the day.
- During a busy lunchtime hour we average about 600k p/hour, approx 10k p/min.

The top 10 requests p/min 

```
2012-07-31T12:12, 10523
2012-07-31T12:13, 10537
2012-07-30T15:01, 10541
2012-07-31T12:07, 10569
2012-07-31T12:11, 10612
2012-07-31T12:05, 10646
2012-07-31T12:09, 10713
2012-07-31T12:08, 10819
2012-07-30T14:59, 10843
2012-07-02T12:41, 11470
2012-07-16T15:42, 12578
```

Burst
-----

- Peak in July was 12.5k
- There was no ramp up for this peak (the previous and subsequent ppm were 5.4k and 7.8k) so it would be wise to accomodate that.

Breadth
-------

The breadth of API requests is a more significant number that above as the same URL requested within a short period of will hit a cache.
 
- At 12:05 on 16 July 2012 there were ~10k request p/min of which 5.7k were *unique to the second* - Eg. if we had a caching proxy for 1 second.
- If we assume a cache time of *60 seconds* then the number halves again to about ~45 request p/second on a busy lunch hour.

Ratio
-----

Approximately the ~570k requests during 16 July 2012 lunch hour break down in to these three areas :-

```
133k were for the network front (23%)
318k were for articles (55%)
61k were for sections (9%)
```

The other areas all received less than 10k requests and make up the remaining 10%.
