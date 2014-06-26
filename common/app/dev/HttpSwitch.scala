package dev

import play.api.mvc.RequestHeader

case class HttpSwitch(switch :conf.Switch)(implicit val request: RequestHeader) {
  import HttpSwitch._

  def isSwitchedOn: Boolean = {
    if(onSwitches.split(",").contains(switch.name)) true
    else if(offSwitches.split(",").contains(switch.name)) false
    else switch.isSwitchedOn
  }

  def isSwitchedOff: Boolean = !isSwitchedOn
}

object HttpSwitch {
  private val switchesOn = "switchesOn"
  private val switchesOff = "switchesOff"

  def queryString(implicit request: RequestHeader) = {
    lazy val on = onSwitches
    lazy val off = offSwitches
    if(on.nonEmpty || off.nonEmpty)
      "?"+List(
        if(on.nonEmpty){switchesOn+"="+on}else{""},
        if(off.nonEmpty){switchesOff+"switchesOff="+off}else{""}
      ).filter(_.nonEmpty).mkString("&")
    else ""
  }

  def onSwitches(implicit request: RequestHeader) = queryParameter(switchesOn)

  def offSwitches(implicit request: RequestHeader) = queryParameter(switchesOff)

  private def queryParameter(name: String)(implicit request: RequestHeader): String = request.queryString.getOrElse(name, List()).mkString(",")
}