package conf.switches

import java.util.concurrent.TimeoutException

import common._
import org.joda.time.{DateTime, DateTimeZone, Days, LocalDate}

import scala.concurrent.duration._
import scala.concurrent.{Future, Promise}

sealed trait SwitchState
case object On extends SwitchState
case object Off extends SwitchState

case class SwitchGroup(name: String, description: Option[String] = None)
object SwitchGroup {
  val ABTests = SwitchGroup("A/B Tests",
                            Some("The expiry date of these switches does NOT affect the expiry of the AB tests; " +
                                 "these switches serve only to quickly enable/disable said tests."))
  val Commercial = SwitchGroup("Commercial")
  val CommercialFeeds = SwitchGroup("Commercial: Feeds",
                            Some("These switches enable the fetching and parsing of the commercial merchandising components."))
  val CommercialLabs = SwitchGroup(
    name = "Commercial: Labs",
    description = Some("Features of, and experiments with, branded content.")
  )
  val Discussion = SwitchGroup("Discussion")
  val Facia = SwitchGroup("Facia")
  val Feature = SwitchGroup("Feature")
  val Identity = SwitchGroup("Identity")
  val Monitoring = SwitchGroup("Monitoring")
  val Performance = SwitchGroup("Performance")
  val ServerSideABTests = SwitchGroup("Server-side A/B Tests")
  val Membership = SwitchGroup("Membership")
}


trait Initializable[T] extends ExecutionContexts with Logging {

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
  def apply(name: String, github: String) = new Owner(Some(name), Some(github), None)
  def withGithub(githubAccount: String) = new Owner(None, Some(githubAccount), None)
  def withName(name: String) = new Owner(Some(name), None, None)
  def withEmail(email: String) = new Owner(None, None, Some(email))
  def group(switchGroup: SwitchGroup): Seq[Owner] = Seq(withName(switchGroup.name))
}

case class Switch(
  group: SwitchGroup,
  name: String,
  description: String,
  owners: Seq[Owner],
  safeState: SwitchState,
  sellByDate: Option[LocalDate],
  exposeClientSide: Boolean
) extends Switchable with Initializable[Switch] {

  val delegate = DefaultSwitch(name, description, initiallyOn = safeState == On)

  def isSwitchedOn: Boolean = delegate.isSwitchedOn

  /*
   * If the switchboard hasn't been read yet, the "safe state" is returned instead of the real switch value.
   * This makes sure the switchboard has been read before returning the switch state.
   */
  def isGuaranteedSwitchedOn: Future[Boolean] = onInitialized map { _ => isSwitchedOn }

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
    exposeClientSide: Boolean
  ): Switch = Switch(
    group,
    name,
    description,
    owners,
    safeState,
    Some(sellByDate),
    exposeClientSide
  )

  val switches = AkkaAgent[List[Switch]](Nil)
  def allSwitches: Seq[Switch] = switches.get()

  // the agent won't immediately return its switches
  def eventuallyAllSwitches: Future[List[Switch]] = switches.future()

  case class Expiry(daysToExpiry: Option[Int], expiresSoon: Boolean, hasExpired: Boolean)

  def expiry(switch: Switch, today: LocalDate = new DateTime(DateTimeZone.forID("Europe/London")).toLocalDate): Expiry = { // We assume expiration datetime is set to London time
    val daysToExpiry = switch.sellByDate.map {
      Days.daysBetween(today, _).getDays
    }

    val expiresSoon = daysToExpiry.exists(_ < 8)

    val hasExpired = daysToExpiry.exists(_ < 0)

    Expiry(daysToExpiry, expiresSoon, hasExpired)
  }

}

object Expiry {

  lazy val never = None

}

// Switch names can be letters numbers and hyphens only
object Switches extends FeatureSwitches
with ServerSideABTestSwitches
with FaciaSwitches
with ABTestSwitches
with CommercialSwitches
with DiscussionSwitches
with PerformanceSwitches
with MonitoringSwitches {

  def all: Seq[Switch] = Switch.allSwitches

  def eventuallyAll: Future[List[Switch]] = Switch.eventuallyAllSwitches

  def grouped: List[(SwitchGroup, Seq[Switch])] = {
    val sortedSwitches = all.groupBy(_.group).map { case (key, value) => (key, value.sortBy(_.name)) }
    sortedSwitches.toList.sortBy(_._1.name)
  }

}
