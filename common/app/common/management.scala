package common

import java.util.concurrent.atomic.AtomicBoolean

import scala.io.Source

trait Switchable {
  def switchOn(): Unit
  def switchOff(): Unit
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

case class DefaultSwitch(name: String, description: String, initiallyOn: Boolean = true) extends Switchable {
  private val isOn = new AtomicBoolean(initiallyOn)

  def isSwitchedOn: Boolean = isOn.get

  def switchOn(): Unit = isOn set true

  def switchOff(): Unit = isOn set false

}

object ManifestFile {

  lazy val asStringOpt =
    Option(getClass.getResourceAsStream("/version.txt")) map (Source.fromInputStream(_).mkString)
  lazy val asString = asStringOpt getOrElse ""
  lazy val asList = asStringOpt map { _.split("\n").toList } getOrElse Nil
  lazy val asKeyValuePairs = (asList map { _.split(":") } collect { case Array(k, v) => k -> v }).toMap
}
