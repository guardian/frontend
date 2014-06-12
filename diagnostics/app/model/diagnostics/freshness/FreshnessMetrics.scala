package model.diagnostics.freshness

import common.SimpleCountMetric

object FreshnessMetrics {

  lazy val lessThanZeroSeconds: SimpleCountMetric = SimpleCountMetric("freshness", "less-than-0-seconds", "Less than 0 seconds")
  lazy val lessThanAMinute: SimpleCountMetric = SimpleCountMetric("freshness", "less-than-1-minute", "Less than 1 minute")
  lazy val lessThanFifteenMinutes: SimpleCountMetric = SimpleCountMetric("freshness", "less-than-15-minute", "Less than 15 minutes")

  lazy val lessThanAnHour: SimpleCountMetric = SimpleCountMetric("freshness", "less-than-1-hour", "Less than 1 hour")
  lazy val lessThanTwoHours: SimpleCountMetric = SimpleCountMetric("freshness", "less-than-2-hours", "Less than 2 hours")
  lazy val lessThanADay: SimpleCountMetric = SimpleCountMetric("freshness", "less-than-1-day", "Less than 1 day")
  lazy val moreThanADay: SimpleCountMetric = SimpleCountMetric("freshness", "more-than-a-day", "more than a day")

  lazy val all: Seq[SimpleCountMetric] = lessThanZeroSeconds :: lessThanAMinute :: lessThanFifteenMinutes ::
    lessThanAnHour :: lessThanTwoHours :: lessThanADay :: moreThanADay :: Nil

  // these are handled separately, they are not included in all
  lazy val frontFreshnessCount: SimpleCountMetric = SimpleCountMetric("freshness", "front-freshness-count", "Front freshness count")
  lazy val frontFreshnessTotal: SimpleCountMetric = SimpleCountMetric("freshness", "front-freshness-total", "Front freshness total")
}