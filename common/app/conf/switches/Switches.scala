package conf.switches

import java.util.concurrent.TimeoutException

import common._
import org.joda.time.{DateTime, Days, LocalDate}
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

case class Switch(
  group: String,
  name: String,
  description: String,
  safeState: SwitchState,
  sellByDate: LocalDate,
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
    initialized(this)
  }
  def switchOff(): Unit = {
    if (isSwitchedOn) {
      delegate.switchOff()
    }
    initialized(this)
  }

  def daysToExpiry = Days.daysBetween(new DateTime(), sellByDate.toDateTimeAtStartOfDay).getDays

  def expiresSoon = daysToExpiry < 7

  def hasExpired = daysToExpiry <= 0

  Switch.switches.send(this :: _)
}

object Switch {
  val switches = AkkaAgent[List[Switch]](Nil)
  def allSwitches: Seq[Switch] = switches.get()

  // the agent won't immediately return its switches
  def eventuallyAllSwitches: Future[List[Switch]] = switches.future()
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

  def all: Seq[Switch] = Switch.allSwitches

  def eventuallyAll: Future[List[Switch]] = Switch.eventuallyAllSwitches

  def grouped: List[(String, Seq[Switch])] = {
    val sortedSwitches = all.groupBy(_.group).map { case (key, value) => (key, value.sortBy(_.name)) }
    sortedSwitches.toList.sortBy(_._1)
  }

}
