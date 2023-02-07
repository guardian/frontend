package conf.audio
import conf.switches.Switches.FlagshipFrontContainerSwitch
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.{DayOfWeek, ZonedDateTime}
import java.time.format.DateTimeFormatter
import org.scalatest.{BeforeAndAfterAll}

class FlagshipFrontContainerSpec extends AnyFlatSpec with Matchers with BeforeAndAfterAll {
  private val formatter =
    DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm").withZone(FlagshipFrontContainer.londonTimezone)

  override def beforeAll(): Unit = {
    FlagshipFrontContainerSwitch.switchOn()
  }

  it should "return true if Tuesday" in {
    val dateTime = ZonedDateTime.parse("2018/11/06 00:00", formatter)
    dateTime.getDayOfWeek should be(DayOfWeek.TUESDAY)
    FlagshipFrontContainer.displayFlagshipContainer(dateTime) should be(true)
  }

  it should "return false if Saturday and after 03:15" in {
    val dateTime = ZonedDateTime.parse("2018/11/10 04:00", formatter)
    dateTime.getDayOfWeek should be(DayOfWeek.SATURDAY)
    FlagshipFrontContainer.displayFlagshipContainer(dateTime) should be(false)
  }

  it should "return true if Saturday and before 03:15" in {
    val dateTime = ZonedDateTime.parse("2018/11/10 03:14", formatter)
    dateTime.getDayOfWeek should be(DayOfWeek.SATURDAY)
    FlagshipFrontContainer.displayFlagshipContainer(dateTime) should be(true)
  }

  it should "return false if Saturday at 03:15" in {
    val dateTime = ZonedDateTime.parse("2018/11/10 03:15", formatter)
    dateTime.getDayOfWeek should be(DayOfWeek.SATURDAY)
    FlagshipFrontContainer.displayFlagshipContainer(dateTime) should be(false)
  }

  it should "return true if Monday and after 03:15" in {
    val dateTime = ZonedDateTime.parse("2018/11/05 04:00", formatter)
    dateTime.getDayOfWeek should be(DayOfWeek.MONDAY)
    FlagshipFrontContainer.displayFlagshipContainer(dateTime) should be(true)
  }

  it should "return false if Monday and before 03:15" in {
    val dateTime = ZonedDateTime.parse("2018/11/05 02:14", formatter)
    dateTime.getDayOfWeek should be(DayOfWeek.MONDAY)
    FlagshipFrontContainer.displayFlagshipContainer(dateTime) should be(false)
  }

  it should "return true if Monday at 03:15" in {
    val dateTime = ZonedDateTime.parse("2018/11/05 03:15", formatter)
    dateTime.getDayOfWeek should be(DayOfWeek.MONDAY)
    FlagshipFrontContainer.displayFlagshipContainer(dateTime) should be(true)
  }
}
