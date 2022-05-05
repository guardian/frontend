package layout

import org.scalatest.flatspec.AnyFlatSpec

import java.time.LocalDate
import org.scalatest.OptionValues
import org.scalatest.matchers.should.Matchers

class DayHeadlineTest extends AnyFlatSpec with Matchers with OptionValues {
  "urlFragmentFormatString" should "produce url paths that work with all urls" in {
    DayHeadline(LocalDate.of(1987, 2, 5)).urlFragment.value shouldEqual "1987/feb/05"
  }
}
