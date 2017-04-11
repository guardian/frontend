# Website benchmark (July 2012)

Pig script :- https://gist.github.com/3415362

Average
-------

- In July we frequently served over 10k request p/min, which is around 166 request p/sec on average.
- UK lunch time on weekdays is the busiest period of the day.
- During a busy lunchtime hour we average about 600k p/hour, approx 10k p/min, peaking at around 225 p/sec.

The top five requests p/min from July,

```
2012-07-31T12:09, 10713
2012-07-31T12:08, 10819
2012-07-30T14:59, 10843
2012-07-02T12:41, 11470
2012-07-16T15:42, 12578
```

The top five requests p/sec during a busy lunch hour,

```
206, 2012-07-16T12:07:01
208, 2012-07-16T12:07:08
210, 2012-07-16T12:08:16
212, 2012-07-16T12:27:10
223, 2012-07-16T12:14:11
```

Burst
-----

- Peak in July was 12.5k.
- There was no ramp up for this peak (the previous and subsequent requests p/minute were 5.4k and 7.8k).

Breadth
-------

The breadth of API requests is a more significant number that above as the same URL requested within a short period of will hit a cache.
 
- At 12:05 on 16 July 2012 there were ~10k request p/min of which 5.7k were *unique to the second* - Ie. if we had a caching proxy in front of the application with a 1 second expiry on all requests.
- If we assume a cache time of *60 seconds* then the number halves again to about ~45 request p/second on a busy lunch hour.

Ratio
-----

Approximately the ~570k requests during 16 July 2012 lunch hour break down in to these three application areas :-

```
133k were for the network front (23%)
318k were for articles (55%)
61k were for sections (9%)
```

The other areas (gallery, video, tags etc.) all received less than 10k requests and make up the remaining 10%.

Further notes
-------------

- There is no data on XHR, JSONP or polling.
