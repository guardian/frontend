package common

import org.joda.time.{DateTime, Period}

object JodaTime {
  implicit class RichPeriod(period: Period) {
    /**
     * From the Joda Time documentation (http://www.joda.org/joda-time/apidocs/org/joda/time/Period.html):
     *
     * The definition of a period also affects the equals method. A period of 1 day is not equal to a period of 24
     * hours, nor 1 hour equal to 60 minutes. This is because periods represent an abstracted definition of a time
     * period (eg. a day may not actually be 24 hours, it might be 23 or 25 at daylight savings boundary). To compare
     * the actual duration of two periods, convert both to durations using toDuration, an operation that emphasises
     * that the result may differ according to the date you choose.
     */
    def <(period2: Period): Boolean =
      period.toStandardDuration.isShorterThan(period2.toStandardDuration)
  }

  implicit val dateTimeOrdering: Ordering[DateTime] = new Ordering[DateTime] {
    override def compare(x: DateTime, y: DateTime): Int = x.compareTo(y)
  }
}
