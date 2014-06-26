package com.gu.fronts.integration.test.page.util;

import static java.util.Calendar.DAY_OF_MONTH;
import static java.util.Calendar.DAY_OF_WEEK;
import static java.util.Calendar.MONTH;
import static java.util.Calendar.YEAR;
import static org.junit.Assert.assertEquals;

import java.util.Calendar;

import org.junit.Test;

public class NetworkFrontDateTest {

    @Test
    public void shouldParseToDateAndDayOfWeek() throws Exception {
        Calendar expectedCalendarDate = today();
        expectedCalendarDate.clear();
        expectedCalendarDate.set(DAY_OF_WEEK, 1);
        expectedCalendarDate.set(DAY_OF_MONTH, 1);
        expectedCalendarDate.set(MONTH, 0);
        expectedCalendarDate.set(YEAR, 2014);

        assertEquals(expectedCalendarDate.getTime(), new NetworkFrontDate("Sunday \n1 January 2014").parseToDate());
        assertEquals("Sunday", new NetworkFrontDate("Sunday \n1 January 2014").getDayOfWeek());
    }

    private Calendar today() {
        return Calendar.getInstance();
    }
}
