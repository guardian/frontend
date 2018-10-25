package conf.audio

import conf.switches.Switches.FlagshipEmailContainerSwitch
import org.joda.time.format.DateTimeFormat
import org.joda.time.DateTimeConstants._
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}

@DoNotDiscover class FlagshipEmailContainerSpec extends FlatSpec with Matchers with BeforeAndAfterAll {

  private val formatter = DateTimeFormat.forPattern("yyyy/MM/dd HH:mm")

  override def beforeAll {
    FlagshipEmailContainerSwitch.switchOn()
  }

  it should "return false if Tuesday but before 2018/11/01" in {
    val dateTime = formatter.parseDateTime("2018/10/02 00:00")
    dateTime.getDayOfWeek should be(TUESDAY)
    FlagshipEmailContainer.displayFlagshipContainer(dateTime) should be(false)
  }

  it should "return true if Tuesday" in {
    val dateTime = formatter.parseDateTime("2018/11/06 00:00")
    dateTime.getDayOfWeek should be(TUESDAY)
    FlagshipEmailContainer.displayFlagshipContainer(dateTime) should be(true)
  }

  it should "return false if Saturday and after 03:15" in {
    val dateTime = formatter.parseDateTime("2018/11/10 03:15")
    dateTime.getDayOfWeek should be(SATURDAY)
    FlagshipEmailContainer.displayFlagshipContainer(dateTime) should be(false)
  }

  it should "return true if Saturday and before 03:15" in {
    val dateTime = formatter.parseDateTime("2018/11/10 03:00")
    dateTime.getDayOfWeek should be(SATURDAY)
    FlagshipEmailContainer.displayFlagshipContainer(dateTime) should be(true)
  }

  it should "return true if Monday and after 03:15" in {
    val dateTime = formatter.parseDateTime("2018/11/05 03:15")
    dateTime.getDayOfWeek should be(MONDAY)
    FlagshipEmailContainer.displayFlagshipContainer(dateTime) should be(true)
  }

  it should "return false if Monday and before 03:15" in {
    val dateTime = formatter.parseDateTime("2018/11/05 03:00")
    dateTime.getDayOfWeek should be(MONDAY)
    FlagshipEmailContainer.displayFlagshipContainer(dateTime) should be(false)
  }
}
