package com.gu.fronts.integration.test.page.util;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.StringTokenizer;

public class NetworkFrontDate {

    private static final String DATE_FORMAT = "yyyyMMMMdd";
    private String dayOfWeek;
    private String dayOfMonth;
    private String month;
    private String year;

    public NetworkFrontDate(String networkFrontDateBoxText) {
        StringTokenizer stokenizer = new StringTokenizer(networkFrontDateBoxText);
        if (stokenizer.countTokens() < 4) {
            throw new RuntimeException("Could not parse date: " + networkFrontDateBoxText
                    + " due to expecting 4 elements but found: " + stokenizer.countTokens());
        }
        dayOfWeek = stokenizer.nextToken();
        dayOfMonth = stokenizer.nextToken();
        month = stokenizer.nextToken();
        year = stokenizer.nextToken();
    }

    public Date parseToDate() {
        try {
            return new SimpleDateFormat(DATE_FORMAT).parse(year + month + dayOfMonth);
        } catch (ParseException e) {
            throw new RuntimeException("Could not parse date " + this.toString());
        }
    }

    public String getDayOfWeek() {
        return dayOfWeek;
    }

}
