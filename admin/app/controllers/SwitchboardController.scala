package controllers

import common._
import common.AdminMetrics.{ SwitchesUpdateCounter, SwitchesUpdateErrorCounter }
import conf.{ Switches, Configuration }
import play.api.mvc._
import scala.concurrent.Future
import services.{ Notification, Audit }
import tools.Store

object SwitchboardController extends Controller with AuthLogging with Logging with ExecutionContexts {

  val SwitchPattern = """([a-z\d-]+)=(on|off)""".r

  def renderSwitchboard() = Authenticated.async { request =>
    log("loaded Switchboard", request)

    Future { Store.getSwitches } map { configuration =>
      val nextStateLookup = Properties(configuration getOrElse "")

      Switches.all foreach { switch =>
        nextStateLookup.get(switch.name) foreach {
          case "on" => switch.switchOn()
          case _ => switch.switchOff()
        }
      }

      Ok(views.html.switchboard(Configuration.environment.stage))
    }
  }

  def save() = Authenticated.async { request =>
    log("saving switchboard", request)

    val requester = Identity(request).get.fullName
    val updates = request.body.asFormUrlEncoded.map { params =>
      Switches.all map { switch =>
        switch.name + "=" + params.get(switch.name).map(v => "on").getOrElse("off")
      }
    }.get

    Future { saveSwitchesOrError(requester, updates) }
  }

  private def saveSwitchesOrError(requester: String, updates: List[String]) = try {
    val current =  Switches.all map { switch =>
      switch.name + "=" + (if (switch.isSwitchedOn) "on" else "off")
    }

    Store.putSwitches(updates mkString "\n")
    SwitchesUpdateCounter.recordCount(1)

    log.info("switches successfully updated")

    val changes = updates filterNot { current contains _ }
    Notification.onSwitchChanges(requester, Configuration.environment.stage, changes)
    changes foreach { change =>
      Audit(s"Switch change by ${requester}: ${change}")
    }

    Redirect(routes.SwitchboardController.renderSwitchboard())
  } catch { case e: Throwable =>
    log.error("exception saving switches", e)
    SwitchesUpdateErrorCounter.recordCount(1)

    Redirect(routes.SwitchboardController.renderSwitchboard()).flashing(
      "error" -> ("Error saving switches '%s'" format e.getMessage)
    )
  }
}