package controllers

import common.{ ExecutionContexts, Properties, Logging }
import common.AdminMetrics.{SwitchesUpdateCounter, SwitchesUpdateErrorCounter}
import conf.{ Switches, AdminConfiguration }
import play.api.mvc._
import play.api.Play.current
import play.api.libs.concurrent.Akka
import tools.S3

object SwitchboardController extends Controller with AuthLogging with Logging with ExecutionContexts {

  val SwitchPattern = """([a-z\d-]+)=(on|off)""".r

  def render() = AuthAction{ request =>
    log("loaded Switchboard", request)

    val promiseOfSwitches = Akka future { S3.getSwitches }

    Async{
      promiseOfSwitches map { configuration =>
        val nextStateLookup = Properties(configuration getOrElse "")

        Switches.all foreach { switch =>
          nextStateLookup.get(switch.name) foreach {
            case "on" => switch.switchOn()
            case _ => switch.switchOff()
          }
        }

        Ok(views.html.switchboard(AdminConfiguration.environment.stage))
      }
    }
  }

  def save() = AuthAction { request =>
    log("saved switchboard", request)

    val switchValues = request.body.asFormUrlEncoded.map{ params =>
      Switches.all map { switch =>
        switch.name + "=" + params.get(switch.name).map(v => "on").getOrElse("off")
      }
    }.get

    val promiseOfSavedSwitches = Akka.future(saveSwitchesOrError(switchValues.mkString("\n")))

    Async {
      promiseOfSavedSwitches map { result =>
        result
      }
    }
  }

  private def saveSwitchesOrError(switches: String) = try {
    // TODO: Diff from current and notify/audit

    S3.putSwitches(switches)
    SwitchesUpdateCounter.recordCount(1)

    log.info("switches successfully updated")

    Redirect(routes.SwitchboardController.render())
  } catch { case e: Throwable =>
    log.error("exception saving switches", e)
    SwitchesUpdateErrorCounter.recordCount(1)

    Redirect(routes.SwitchboardController.render()).flashing(
      "error" -> ("Error saving switches '%s'" format e.getMessage)
    )
  }
}