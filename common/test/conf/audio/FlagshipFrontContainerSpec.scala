package conf.audio
import conf.switches.Switches.FlagshipFrontContainerSwitch
import java.time.{ZonedDateTime, DayOfWeek}
import java.time.format.DateTimeFormatter
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}

class FlagshipFrontContainerSpec extends FlatSpec with Matchers with BeforeAndAfterAll {
  private val formatter = DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm").withZone(FlagshipFrontContainer.londonTimezone)

  override def beforeAll {
    FlagshipFrontContainerSwitch.switchOn()
  }

  it should "return true if the team is on not holiday yet" in {
    val dateTime = ZonedDateTime.parse("2019/08/17 02:59", formatter)
    FlagshipFrontContainer.displayFlagshipContainer(dateTime) should be(true)
  }

  it should "return false if the team is on holiday" in {
    val dateTime = ZonedDateTime.parse("2019/08/17 03:00", formatter)
    FlagshipFrontContainer.displayFlagshipContainer(dateTime) should be(false)
  }

  it should "return false if the team is still on holiday" in {
    val dateTime = ZonedDateTime.parse("2019/09/02 02:00", formatter)
    FlagshipFrontContainer.displayFlagshipContainer(dateTime) should be(false)
  }

  it should "return true if the team is not on holiday anymore" in {
    val dateTime = ZonedDateTime.parse("2019/09/02 02:01", formatter)
    FlagshipFrontContainer.displayFlagshipContainer(dateTime) should be(true)
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

  it should "return true if Saturday and before 03:00" in {
    val dateTime = ZonedDateTime.parse("2018/11/10 02:59", formatter)
    dateTime.getDayOfWeek should be(DayOfWeek.SATURDAY)
    FlagshipFrontContainer.displayFlagshipContainer(dateTime) should be(true)
  }

  it should "return false if Saturday at 03:00" in {
    val dateTime = ZonedDateTime.parse("2018/11/10 03:00", formatter)
    dateTime.getDayOfWeek should be(DayOfWeek.SATURDAY)
    FlagshipFrontContainer.displayFlagshipContainer(dateTime) should be(false)
  }

  it should "return true if Monday and after 03:15" in {
    val dateTime = ZonedDateTime.parse("2018/11/05 04:00", formatter)
    dateTime.getDayOfWeek should be(DayOfWeek.MONDAY)
    FlagshipFrontContainer.displayFlagshipContainer(dateTime) should be(true)
  }

  it should "return false if Monday and before 02:00" in {
    val dateTime = ZonedDateTime.parse("2018/11/05 01:59", formatter)
    dateTime.getDayOfWeek should be(DayOfWeek.MONDAY)
    FlagshipFrontContainer.displayFlagshipContainer(dateTime) should be(false)
  }

  it should "return true if Monday at 02:00" in {
    val dateTime = ZonedDateTime.parse("2018/11/05 02:00", formatter)
    dateTime.getDayOfWeek should be(DayOfWeek.MONDAY)
    FlagshipFrontContainer.displayFlagshipContainer(dateTime) should be(true)
  }
}
