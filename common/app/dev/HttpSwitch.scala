package dev

import play.api.mvc.RequestHeader
import conf.Configuration

/*
  Switch wrapper that enables it to be turned on/off in non production environments based on query string parameters
  Example
  Having the following demo switch:
    val DemoSwitch = Switch("Feature Switches", "demo-switch", "What the switch is for", safeState = Off, sellByDate = never)
  If, in the query string we have "switchesOn=demo-switch", then
    HttpSwitch(DemoSwitch).isSwitchedOn // will yield true
    DemoSwitch.isSwitchedOn // will yield false
 */
case class HttpSwitch(switch :conf.Switch)(implicit val request: RequestHeader) {
  import HttpSwitch._

  def isSwitchedOn: Boolean =
    if(Configuration.environment.isNonProd)
      if(onSwitches.split(",").contains(switch.name)) true
      else if(offSwitches.split(",").contains(switch.name)) false
      else switch.isSwitchedOn
    else switch.isSwitchedOn

  def isSwitchedOff: Boolean = !isSwitchedOn
}

object HttpSwitch {
  private val switchesOn = "switchesOn"
  private val switchesOff = "switchesOff"

  def queryString(url: String)(implicit request: RequestHeader) =
    if(Configuration.environment.isNonProd) url
    else {
      lazy val on = onSwitches
      lazy val off = offSwitches
      url +
        (if(on.nonEmpty || off.nonEmpty)
          (if(url.contains("?")) "&" else "?") +
            List(
              if(on.nonEmpty){switchesOn + "=" + on} else {""},
              if(off.nonEmpty){switchesOff + "=" + off} else {""}
            ).filter(_.nonEmpty).mkString("&")
        else "")
    }

  def onSwitches(implicit request: RequestHeader) = queryParameter(switchesOn)

  def offSwitches(implicit request: RequestHeader) = queryParameter(switchesOff)

  private def queryParameter(name: String)(implicit request: RequestHeader): String = request.queryString.getOrElse(name, List()).mkString(",")
}