package common

import java.util.concurrent.atomic.{AtomicBoolean, AtomicLong}

import scala.io.Source

/**
 * TODO
 * Temporary holder for classes ported over while we get rid of the Guardian Management plugin
 */

trait Metric {
  def group: String
  def name: String
}

trait AbstractMetric[T] extends Metric {
  val `type`: String
  val group: String
  val name: String
  val title: String
  val description: String
  val master: Option[Metric] = None

  val getValue: () => T

}
trait Switchable {
  def switchOn()
  def switchOff()
  def isSwitchedOn: Boolean
  def isSwitchedOff: Boolean = !isSwitchedOn

  /**
   * @return a single url-safe word that can be used to construct urls
   * for this switch.
   */
  def name: String

  /**
   * @return a sentence that describes, in websys understandable terms, the
   * effect of switching this switch
   */
  def description: String
}

class TimingMetric(
                    val group: String, val name: String, val title: String, val description: String,
                    override val master: Option[Metric] = None) extends AbstractMetric[Long] {
  val `type` = "timer"

  private val _totalTimeInMillis = new AtomicLong()
  private val _count = new AtomicLong()

  def recordTimeSpent(durationInMillis: Long) {
    _totalTimeInMillis.addAndGet(durationInMillis)
    _count.incrementAndGet
  }

  def totalTimeInMillis = _totalTimeInMillis.get
  def count = _count.get
  val getValue = () => totalTimeInMillis


  // to use this class, you can write your own wrappers
  // and call recordTimeSpent, or you may use this one
  // if you want.
  // val t = TimingMetric("example")
  // ...
  // t measure {
  //   code here
  // }
  def measure[T](block: => T) = {
    val s = new StopWatch
    val result = block
    recordTimeSpent(s.elapsed)
    result
  }

  def run(r: Runnable) { measure { r.run() } }
}

object TimingMetric {
  def empty = new TimingMetric("application", "Empty", "Empty", "Empty")
}

class GaugeMetric[T](
                      val group: String, val name: String, val title: String, val description: String,
                      val getValue: () => T, override val master: Option[Metric] = None) extends AbstractMetric[T] {
  val `type`: String = "gauge"
}

class StopWatch {
  val startTime = System.currentTimeMillis
  def elapsed = System.currentTimeMillis - startTime
}

object StopWatch{
  def apply(): StopWatch = new StopWatch
}

object Timing {

  def time[T](activity: String,
              onSuccess: String => Unit,
              onFailure: (String, Throwable) => Unit,
              metric: Option[TimingMetric])(block: => T): T = {
    val stopWatch = new StopWatch
    try {
      val result = block
      metric foreach (_.recordTimeSpent(stopWatch.elapsed))
      onSuccess(activity + " completed in " + stopWatch.elapsed + " ms")
      result
    } catch {
      case t: Throwable =>
        onFailure(activity + " caused exception after " + stopWatch.elapsed + " ms", t)
        throw t
    }
  }
}

case class DefaultSwitch(name: String, description: String, initiallyOn: Boolean = true) extends Switchable {
  private val isOn = new AtomicBoolean(initiallyOn)

  def isSwitchedOn: Boolean = isOn.get

  def switchOn(): Unit = isOn set true


  def switchOff(): Unit = isOn set false

}

class CountMetric(
                   val group: String, val name: String, val title: String, val description: String,
                   override val master: Option[Metric] = None) extends AbstractMetric[Long] {
  val `type`: String = "counter"

  private val _count = new AtomicLong()
  def recordCount(count: Long): Long = _count.addAndGet(count)
  def increment(): Long = recordCount(1)

  def count = _count.get
  val getValue = () => count
}
object ManifestFile {

  lazy val asStringOpt =
    Option(getClass.getResourceAsStream("/version.txt")) map (Source.fromInputStream(_).mkString)
  lazy val asString = asStringOpt getOrElse ""
  lazy val asList = asStringOpt map { _.split("\n").toList } getOrElse Nil
  lazy val asKeyValuePairs = (asList map { _.split(":") } collect { case Array(k, v) => k -> v }).toMap
}
