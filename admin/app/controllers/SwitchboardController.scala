package controllers

import common.{Properties, Logging}
import conf._
import play.api.mvc._
import play.api.Play.current
import play.api.libs.concurrent.Akka
import tools.S3

case class SwitchState(name: String, isOn: Boolean, description: String)

object SwitchboardController extends Controller with AuthLogging with Logging with ExecutionContexts {

  val SwitchPattern = """([a-z\d-]+)=(on|off)""".r
  val switches = Switches.all.toList map { switch =>
    SwitchState(switch.name, switch.initiallyOn, switch.description)
  }

  def render() = AuthAction{ request =>
    log("loaded Switchboard", request)

    val promiseOfSwitches = Akka future { S3.getSwitches }

    Async{
      promiseOfSwitches map { configuration =>
        val switchStates = Properties(configuration getOrElse "") mapValues { _ == "on" }

        val updatedSwitches = switches map { switch =>
          val nextState = switchStates.get(switch.name) getOrElse switch.isOn
          switch.copy(isOn = nextState)
        }

        Ok(views.html.switchboard(updatedSwitches, AdminConfiguration.environment.stage))
      }
    }
  }

  def save() = AuthAction{ request =>
    log("saved switchboard", request)

    val switchValues = request.body.asFormUrlEncoded.map{ params =>
      switches.map{ switch => switch.name + "=" + params.get(switch.name).map(v => "on").getOrElse("off") }
    }.get

    val promiseOfSavedSwitches = Akka.future(saveSwitchesOrError(switchValues.mkString("\n")))

    Async {
      promiseOfSavedSwitches.map{ result =>
        result
      }
    }
  }

  private def saveSwitchesOrError(switches: String) = try {
    S3.putSwitches(switches)
    log.info("switches successfully updated")
    SwitchesUpdateCounter.recordCount(1)
    Redirect(routes.SwitchboardController.render())
  } catch { case e: Throwable =>
    log.error("exception saving switches", e)
    SwitchesUpdateErrorCounter.recordCount(1)
    Redirect(routes.SwitchboardController.render()).flashing("error" -> "Error saving switches '%s'".format(e.getMessage))
  }
}