package common

import org.scalatest.{Matchers, FlatSpec}
import model._
import org.joda.time.DateTime


class IsoDateTest extends FlatSpec with Matchers {

  "Iso Date Parser" should "parse" in {
    "2013-11-11T23:02:18.311Z".parseISODateTime should be (new DateTime(2013, 11, 11, 23, 2, 18, 311))
    "2013-11-11T22:50:17Z".parseISODateTime should be (new DateTime(2013, 11, 11, 22, 50, 17, 0))
    "2013-06-26T16:36:35.731+01:00".parseISODateTime should be (new DateTime(2013, 6, 26, 16, 36, 35, 731))
  }

}
