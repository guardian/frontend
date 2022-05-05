package common

import org.joda.time.DateTime
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class IsoDateTest extends AnyFlatSpec with Matchers with implicits.Dates {

  "Iso Date Parser" should "parse" in {
    "2013-11-11T23:02:18.311Z".parseISODateTime should be(
      new DateTime(2013, 11, 11, 23, 2, 18, 311, Edition.defaultEdition.timezone),
    )
    "2013-11-11T22:50:17Z".parseISODateTime should be(
      new DateTime(2013, 11, 11, 22, 50, 17, 0, Edition.defaultEdition.timezone),
    )
    "2013-06-26T16:36:35.731+01:00".parseISODateTime should be(
      new DateTime(2013, 6, 26, 16, 36, 35, 731, Edition.defaultEdition.timezone),
    )
  }

}
