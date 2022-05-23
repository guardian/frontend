package views.support

import common.editions
import model.GUDateTimeFormatNew
import org.joda.time.DateTime
import org.scalatest.freespec.AnyFreeSpec
import org.scalatest.matchers.should.Matchers

class GUDateTimeFormatNewTest extends AnyFreeSpec with Matchers {
  val date = DateTime.parse("2019-05-08T10:26:11.000+10:00")
  "formatDateTimeForDisplayGivenEdition" - {
    "correctly handles Australian to US timezone conversion" in {
      GUDateTimeFormatNew.formatDateTimeForDisplayGivenEdition(date, editions.Us) shouldEqual "Tue 7 May 2019 20.26 EDT"
    }
    "correctly handles Australian to UK timezone conversion" in {
      GUDateTimeFormatNew.formatDateTimeForDisplayGivenEdition(date, editions.Uk) shouldEqual "Wed 8 May 2019 01.26 BST"
    }

  }
}
