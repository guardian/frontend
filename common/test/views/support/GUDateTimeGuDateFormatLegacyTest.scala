package views.support

import common.editions
import org.joda.time.DateTime
import org.scalatest.{FreeSpec, Matchers}

class GUDateTimeGuDateFormatLegacyTest extends FreeSpec with Matchers {
  val date = DateTime.parse("2019-05-08T10:26:11.000+10:00")
  "formatDateTimeForDisplayGivenEdition" - {
    "correctly handles Australian to US timezone conversion" in {
      GUDateTimeFormat.formatDateTimeForDisplayGivenEdition(date, editions.Us) shouldEqual "Tue 7 May 2019 20.26 EDT"
    }
    "correctly handles Australian to UK timezone conversion" in {
      GUDateTimeFormat.formatDateTimeForDisplayGivenEdition(date, editions.Uk) shouldEqual "Wed 8 May 2019 01.26 BST"
    }

  }
}
