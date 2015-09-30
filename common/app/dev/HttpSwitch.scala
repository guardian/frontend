package dev

import conf.switches.Switch
import play.api.mvc.RequestHeader
import conf.Configuration

trait EnvConfig {
  protected def isNonProd = Configuration.environment.isNonProd
}

/*
  Switch wrapper that enables it to be turned on/off in non production environments based on query string parameters
  Example
  Having the following demo switch:
    val DemoSwitch = Switch("Feature Switches", "demo-switch", "What the switch is for", safeState = Off, sellByDate = never)
  If, in the query string we have "switchesOn=demo-switch", then
    HttpSwitch(DemoSwitch).isSwitchedOn // will yield true
    DemoSwitch.isSwitchedOn // will yield false
 */
case class HttpSwitch(switch: Switch) extends EnvConfig {
  import HttpSwitch._

  def isSwitchedOn(implicit request: RequestHeader): Boolean =
    if(isNonProd)
      onSwitches.map(_.split(",").contains(switch.name))
        .orElse {offSwitches.map( ! _.split(",").contains(switch.name))}
        .getOrElse(switch.isSwitchedOn)
    else switch.isSwitchedOn

  def isSwitchedOff(implicit request: RequestHeader): Boolean = !isSwitchedOn
}

trait HttpSwitchParameters extends EnvConfig{
  private val switchesOn = "switchesOn"
  private val switchesOff = "switchesOff"

  def queryString(url: String)(implicit request: RequestHeader) =
    if(isNonProd) {
      val on = onSwitches.map{switchesOn + "=" + _}
      val off = offSwitches.map{switchesOff + "=" + _}
      val separator = if(url.contains("?")) "&" else "?"
      url + (List(on, off).flatten match {
        case Nil => ""
        case ss => ss.mkString(separator, "&", "")
      })
    } else url

  def onSwitches(implicit request: RequestHeader) = queryParameter(switchesOn)

  def offSwitches(implicit request: RequestHeader) = queryParameter(switchesOff)

  private def queryParameter(name: String)(implicit request: RequestHeader): Option[String] =
    request.queryString.get(name).map{_.mkString(",")}
}

object HttpSwitch extends HttpSwitchParameters
