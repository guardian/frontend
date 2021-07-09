package controllers.admin

import com.gu.googleauth.UserIdentity
import common._
import conf.Configuration
import conf.switches.Switches
import model.{ApplicationContext, NoCache}
import play.api.mvc._
import services.SwitchNotification
import tools.Store

import scala.concurrent.Future

class SwitchboardController(akkaAsync: AkkaAsync, val controllerComponents: ControllerComponents)(implicit
    context: ApplicationContext,
) extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  val SwitchPattern = """([a-z\d-]+)=(on|off)""".r

  def renderSwitchboard(): Action[AnyContent] =
    Action.async { implicit request =>
      log.info("loaded Switchboard")

      Future { Store.getSwitchesWithLastModified } map { switchesWithLastModified =>
        val configuration = switchesWithLastModified.map(_._1)
        val nextStateLookup = Properties(configuration getOrElse "")

        Switches.all foreach { switch =>
          nextStateLookup.get(switch.name) foreach {
            case "on" => switch.switchOn()
            case _    => switch.switchOff()
          }
        }

        val lastModified = switchesWithLastModified.map(_._2).map(_.getMillis).getOrElse(System.currentTimeMillis)
        NoCache(Ok(views.html.switchboard(lastModified)))
      }
    }

  def save(): Action[AnyContent] =
    Action.async { implicit request =>
      val form = request.body.asFormUrlEncoded

      val localLastModified = form.get("lastModified").head.toLong
      val remoteLastModified = Store.getSwitchesLastModified

      if (remoteLastModified.exists(_.getMillis > localLastModified)) {
        Future {
          NoCache(
            Redirect(routes.SwitchboardController.renderSwitchboard())
              .flashing("error" -> "A more recent change to the switch has been found, please refresh and try again."),
          )
        }
      } else {
        log.info("saving switchboard")

        val requester: String = UserIdentity.fromRequest(request) map (_.fullName) getOrElse "unknown user (dev-build?)"
        val updates: Seq[String] = request.body.asFormUrlEncoded.map { params =>
          Switches.all map { switch =>
            switch.name + "=" + params.get(switch.name).map(v => "on").getOrElse("off")
          }
        } getOrElse Nil

        Future {
          saveSwitchesOrError(requester, updates)
        }
      }
    }

  private def saveSwitchesOrError(requester: String, updates: Seq[String]): Result =
    try {
      val current = Switches.all map { switch =>
        switch.name + "=" + (if (switch.isSwitchedOn) "on" else "off")
      }

      Store.putSwitches(updates mkString "\n")

      log.info("switches successfully updated")

      val changes = updates filterNot { current contains _ }
      SwitchNotification.onSwitchChanges(akkaAsync)(requester, Configuration.environment.stage, changes)
      changes foreach { change =>
        log.info(s"Switch change by $requester: $change")
      }

      Redirect(routes.SwitchboardController.renderSwitchboard())
    } catch {
      case e: Throwable =>
        log.error("exception saving switches", e)

        Redirect(routes.SwitchboardController.renderSwitchboard()).flashing(
          "error" -> ("Error saving switches '%s'" format e.getMessage),
        )
    }
}
