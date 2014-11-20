package layout

import org.joda.time.LocalDate
import org.scalatest.{OptionValues, Matchers, FlatSpec}

class DayHeadlineTest extends FlatSpec with Matchers with OptionValues {
  "urlFragmentFormatString" should "produce url paths that work with all urls" in {
    DayHeadline(new LocalDate(1987, 2, 5)).urlFragment.value shouldEqual "1987/feb/05"
  }
}
