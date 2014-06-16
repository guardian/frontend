package com.gu.fronts.integration.test.util;

import static java.util.Calendar.DAY_OF_MONTH;
import static java.util.Calendar.MONTH;
import static java.util.Calendar.YEAR;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

public class CalendarUtil {

    public static String todayDayOfWeek() {
        return new SimpleDateFormat("EEEE").format(new Date());
    }

    /**
     * Returns a Date object with todays date with all fields reset, except year, month and day
     */
    public static Date todayYearMonthDay() {
        Calendar todayReset = today();
        Calendar todayCal = today();
        todayReset.clear();
        todayReset.set(DAY_OF_MONTH, todayCal.get(DAY_OF_MONTH));
        todayReset.set(MONTH, todayCal.get(MONTH));
        todayReset.set(YEAR, todayCal.get(YEAR));

        return todayReset.getTime();
    }

    private static Calendar today() {
        return Calendar.getInstance();
    }
}
