package conf.switches

import java.util.concurrent.TimeoutException
import common._
import java.time.{LocalDate, ZoneId}
import java.time.Duration
import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future, Promise}
import java.text.SimpleDateFormat
import java.util.TimeZone

sealed trait SwitchState
case object On extends SwitchState
case object Off extends SwitchState

case class SwitchGroup(name: String, description: Option[String] = None)
object SwitchGroup {
  val ABTests = SwitchGroup(
    "A/B Tests",
    Some(
      "The expiry date of these switches does NOT affect the expiry of the AB tests; " +
        "these switches serve only to quickly enable/disable said tests.",
    ),
  )
  val Commercial = SwitchGroup("Commercial")
  val CommercialFeeds = SwitchGroup(
    "Commercial: Feeds",
    Some("These switches enable the fetching and parsing of the commercial merchandising components."),
  )
  val CommercialPrebid = SwitchGroup(
    name = "Commercial: Header Bidding",
    description = Some("Features of our Prebid & A9 auction configuration."),
  )
  val Discussion = SwitchGroup("Discussion")
  val Facia = SwitchGroup("Facia")
  val Feature = SwitchGroup("Feature")
  val Identity = SwitchGroup("Identity")
  val Monitoring = SwitchGroup("Monitoring")
  val Performance = SwitchGroup("Performance")
  val ServerSideExperiments = SwitchGroup("Server-side Experiments")
  val Membership = SwitchGroup("Membership")
  val Journalism = SwitchGroup("Journalism")
  val Privacy = SwitchGroup("Privacy")
  val TX = SwitchGroup("TX")
}

trait Initializable[T] extends GuLogging {

  private val initialized = Promise[T]()

  def initialize(t: T): Unit = initialized.trySuccess(t)
  def onInitialized: Future[T] = initialized.future
  def failInitializationAfter(initializationTimeout: FiniteDuration)(akkaAsync: AkkaAsync): Unit = {
    akkaAsync.after(initializationTimeout) {
      initialized.tryFailure {
        new TimeoutException(s"Initialization timed out after $initializationTimeout")
      }
    }
  }
}

case class Owner(name: Option[String], github: Option[String], email: Option[String])
object Owner {
  def apply(name: String, github: String): Owner = new Owner(Some(name), Some(github), None)
  def withGithub(githubAccount: String): Owner = new Owner(None, Some(githubAccount), None)
  def withName(name: String): Owner = new Owner(Some(name), None, None)
  def withEmail(email: String): Owner = new Owner(None, None, Some(email))
  def group(switchGroup: SwitchGroup): Seq[Owner] = Seq(withName(switchGroup.name))
}

case class Switch(
    group: SwitchGroup,
    name: String,
    description: String,
    owners: Seq[Owner],
    safeState: SwitchState,
    sellByDate: Option[LocalDate],
    exposeClientSide: Boolean,
) extends Switchable
    with Initializable[Switch] {

  val delegate = DefaultSwitch(name, description, initiallyOn = safeState == On)

  def isSwitchedOn: Boolean = delegate.isSwitchedOn

  /*
   * If the switchboard hasn't been read yet, the "safe state" is returned instead of the real switch value.
   * This makes sure the switchboard has been read before returning the switch state.
   */
  def isGuaranteedSwitchedOn(implicit executionContext: ExecutionContext): Future[Boolean] =
    onInitialized map { _ => isSwitchedOn }

  def switchOn(): Unit = {
    if (isSwitchedOff) {
      delegate.switchOn()
    }
    initialize(this)
  }
  def switchOff(): Unit = {
    if (isSwitchedOn) {
      delegate.switchOff()
    }
    initialize(this)
  }
  def switchToSafeState(): Unit = {
    if (safeState == On) {
      delegate.switchOn()
    } else {
      delegate.switchOff()
    }
    initialize(this)
  }

  Switch.switches.send(this :: _)
}

object Switch {

  def apply(
      group: SwitchGroup,
      name: String,
      description: String,
      owners: Seq[Owner],
      safeState: SwitchState,
      sellByDate: LocalDate,
      exposeClientSide: Boolean,
  ): Switch =
    Switch(
      group,
      name,
      description,
      owners,
      safeState,
      Some(sellByDate),
      exposeClientSide,
    )

  val switches = Box[List[Switch]](Nil)
  def allSwitches: Seq[Switch] = switches.get()

  case class Expiry(daysToExpiry: Option[Int], expiresSoon: Boolean, hasExpired: Boolean)

  def expiry(
      switch: Switch,
      today: LocalDate = LocalDate.now(ZoneId.of("Europe/London")),
  ): Expiry = { // We assume expiration datetime is set to London time
    val daysToExpiry = switch.sellByDate.map(d => Duration.between(today.atStartOfDay(), d.atStartOfDay()).toDays.toInt)
    val expiresSoon = daysToExpiry.exists(_ < 8)
    val hasExpired = daysToExpiry.exists(_ < 0)
    Expiry(daysToExpiry, expiresSoon, hasExpired)
  }

  def expiryAsUserFriendlyString(switch: Switch): String = {
    val timeFormatter = new SimpleDateFormat("E dd MMM")
    timeFormatter.setTimeZone(TimeZone.getTimeZone("Europe/London"))
    switch.sellByDate
      .map(d => s"expires ${timeFormatter.format(d)} at 23:59 (London time)")
      .getOrElse("expiry not specified")
  }
}

object Expiry {
  lazy val never = None
}

// Switch names can be letters numbers and hyphens only
object Switches
    extends FeatureSwitches
    with ServerSideExperimentSwitches
    with FaciaSwitches
    with ABTestSwitches
    with CommercialSwitches
    with PrivacySwitches
    with PrebidSwitches
    with DiscussionSwitches
    with PerformanceSwitches
    with MonitoringSwitches
    with IdentitySwitches
    with JournalismSwitches
    with TXSwitches {

  def all: Seq[Switch] = Switch.allSwitches

  def grouped: List[(SwitchGroup, Seq[Switch])] = {
    val sortedSwitches = all.groupBy(_.group).map { case (key, value) => (key, value.sortBy(_.name)) }
    sortedSwitches.toList.sortBy(_._1.name)
  }
}
