package controllers.admin

import com.gu.googleauth.UserIdentity
import common._
import common.AdminMetrics.{ SwitchesUpdateCounter, SwitchesUpdateErrorCounter }
import conf.switches.Switches
import controllers.AuthLogging
import conf.Configuration
import play.api.mvc._
import scala.concurrent.Future
import services.Notification
import tools.Store
import model.NoCache

object SwitchboardController extends Controller with AuthLogging with Logging with ExecutionContexts {

  val SwitchPattern = """([a-z\d-]+)=(on|off)""".r

  def renderSwitchboard() = AuthActions.AuthActionTest.async { implicit request =>
    log("loaded Switchboard", request)

    Future { Store.getSwitchesWithLastModified } map { switchesWithLastModified =>
      val configuration = switchesWithLastModified.map(_._1)
      val nextStateLookup = Properties(configuration getOrElse "")

      Switches.all foreach { switch =>
        nextStateLookup.get(switch.name) foreach {
          case "on" => switch.switchOn()
          case _ => switch.switchOff()
        }
      }

      val lastModified = switchesWithLastModified.map(_._2).map(_.getMillis).getOrElse(System.currentTimeMillis)
      NoCache(Ok(views.html.switchboard(Configuration.environment.stage, lastModified)))
    }
  }

  def save() = AuthActions.AuthActionTest.async { implicit request =>
    val form = request.body.asFormUrlEncoded

    val localLastModified = form.get("lastModified").head.toLong
    val remoteLastModified = Store.getSwitchesLastModified

    if (remoteLastModified.exists(_.getMillis > localLastModified)) {
      Future {
        NoCache(Redirect(routes.SwitchboardController.renderSwitchboard()).flashing("error" -> "A more recent change to the switch has been found, please refresh and try again."))
      }
    } else {
      log("saving switchboard", request)

      val requester = UserIdentity.fromRequest(request).get.fullName
      val updates = request.body.asFormUrlEncoded.map { params =>
          Switches.all map { switch =>
              switch.name + "=" + params.get(switch.name).map(v => "on").getOrElse("off")
          }
      }.get

      Future {
        saveSwitchesOrError(requester, updates)
      }
    }
  }

  private def saveSwitchesOrError(requester: String, updates: Seq[String]) = try {
    val current =  Switches.all map { switch =>
      switch.name + "=" + (if (switch.isSwitchedOn) "on" else "off")
    }

    Store.putSwitches(updates mkString "\n")
    SwitchesUpdateCounter.increment()

    log.info("switches successfully updated")

    val changes = updates filterNot { current contains _ }
    Notification.onSwitchChanges(requester, Configuration.environment.stage, changes)
    changes foreach { change =>
      log.info(s"Switch change by ${requester}: ${change}")
    }

    Redirect(routes.SwitchboardController.renderSwitchboard())
  } catch { case e: Throwable =>
    log.error("exception saving switches", e)
    SwitchesUpdateErrorCounter.increment()

    Redirect(routes.SwitchboardController.renderSwitchboard()).flashing(
      "error" -> ("Error saving switches '%s'" format e.getMessage)
    )
  }
}
