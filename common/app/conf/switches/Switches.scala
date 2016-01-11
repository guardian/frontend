package conf.switches

import java.util.concurrent.TimeoutException

import common._
import conf.Configuration.environment
import org.joda.time.{DateTime, Days, Interval, LocalDate}
import play.api.Play

import scala.concurrent.duration._
import scala.concurrent.{Future, Promise}

sealed trait SwitchState
case object On extends SwitchState
case object Off extends SwitchState

trait Initializable[T] extends ExecutionContexts with Logging {

  private val initialized = Promise[T]()

  protected val initializationTimeout: FiniteDuration = 2.minutes

  if (Play.maybeApplication.isDefined) {
    AkkaAsync.after(initializationTimeout) {
      initialized.tryFailure {
        new TimeoutException(s"Initialization timed out after $initializationTimeout")
      }
    }
  }

  def initialized(t: T): Unit = initialized.trySuccess(t)

  def onInitialized: Future[T] = initialized.future
}


sealed trait SwitchTrait extends Switchable with Initializable[SwitchTrait] {
  val group: String
  val name: String
  val description: String
  val safeState: SwitchState
  val sellByDate: LocalDate
  val exposeClientSide: Boolean

  val delegate = DefaultSwitch(name, description, initiallyOn = safeState == On)

  def isSwitchedOn: Boolean = delegate.isSwitchedOn && new LocalDate().isBefore(sellByDate)

  /*
   * If the switchboard hasn't been read yet, the "safe state" is returned instead of the real switch value.
   * This makes sure the switchboard has been read before returning the switch state.
   */
  def isGuaranteedSwitchedOn: Future[Boolean] = onInitialized map { _ => isSwitchedOn }

  def switchOn() {
    if (isSwitchedOff) {
      delegate.switchOn()
    }
    initialized(this)
  }
  def switchOff() {
    if (isSwitchedOn) {
      delegate.switchOff()
    }
    initialized(this)
  }

  def daysToExpiry = Days.daysBetween(new DateTime(), sellByDate.toDateTimeAtStartOfDay).getDays

  def expiresSoon = daysToExpiry < 7

  def hasExpired = daysToExpiry == 0

  Switch.switches.send(this :: _)
}

case class Switch(
  group: String,
  name: String,
  description: String,
  safeState: SwitchState,
  sellByDate: LocalDate,
  exposeClientSide: Boolean
) extends SwitchTrait

object Switch {
  val switches = AkkaAgent[List[SwitchTrait]](Nil)
  def allSwitches: Seq[SwitchTrait] = switches.get()
}

object Expiry {

  lazy val never = new LocalDate(2100, 1, 1)

}

// Switch names can be letters numbers and hyphens only
object Switches extends FeatureSwitches
with ServerSideABTestSwitches
with FaciaSwitches
with ABTestSwitches
with CommercialSwitches
with PerformanceSwitches
with MonitoringSwitches {

  def all: Seq[SwitchTrait] = Switch.allSwitches

  def grouped: List[(String, Seq[SwitchTrait])] = {
    val sortedSwitches = all.groupBy(_.group).map { case (key, value) => (key, value.sortBy(_.name)) }
    sortedSwitches.toList.sortBy(_._1)
  }

}
