package controllers.admin

import common._
import conf.Configuration
import conf.switches.Switches
import http.GuardianAuthWithExemptions
import model.{ApplicationContext, NoCache}
import play.api.mvc._
import tools.Store

import scala.concurrent.Future

class SwitchboardController(
    pekkoAsync: PekkoAsync,
    auth: GuardianAuthWithExemptions,
    val controllerComponents: ControllerComponents,
)(implicit
    context: ApplicationContext,
) extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  val SwitchPattern = """([a-z\d-]+)=(on|off)""".r

  def renderSwitchboard(): Action[AnyContent] =
    Action.async { implicit request =>
      logDebugWithRequestId("loaded Switchboard")

      Future { Store.getSwitchesWithLastModified } map { switchesWithLastModified =>
        val configuration = switchesWithLastModified.map(_._1)
        val switchStates = Properties(configuration getOrElse "")

        Switches.updateStates(switchStates)

        val lastModified = switchesWithLastModified.map(_._2).map(_.getMillis).getOrElse(System.currentTimeMillis)
        NoCache(Ok(views.html.switchboard(lastModified)))
      }
    }

  def save(): Action[AnyContent] =
    Action.async { implicit request =>
      val form = request.body.asFormUrlEncoded

      val localLastModified = form.get("lastModified").head.toLong
      val switchesWithLastModified = Store.getSwitchesWithLastModified

      // Ensure the current state of the switches are up-to-date
      val configuration = switchesWithLastModified.map(_._1)
      val switchStates = Properties(configuration getOrElse "")
      Switches.updateStates(switchStates)

      if (switchesWithLastModified.exists(_._2.getMillis > localLastModified)) {
        Future {
          NoCache(
            Redirect(routes.SwitchboardController.renderSwitchboard())
              .flashing("error" -> "A more recent change to the switch has been found, please refresh and try again."),
          )
        }
      } else {
        logDebugWithRequestId("saving switchboard")

        val requester: String =
          auth.readAuthenticatedUser(request) map (authed =>
            s"${authed.user.firstName} ${authed.user.lastName}"
          ) getOrElse "unknown user (dev-build?)"
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

  private def saveSwitchesOrError(requester: String, updates: Seq[String])(implicit request: RequestHeader): Result =
    try {
      val current = Switches.all map { switch =>
        switch.name + "=" + (if (switch.isSwitchedOn) "on" else "off")
      }

      Store.putSwitches(updates mkString "\n")

      logDebugWithRequestId("switches successfully updated")

      val changes = updates filterNot { current contains _ }
      changes foreach { change =>
        logDebugWithRequestId(s"Switch change by $requester: $change")
      }

      Redirect(routes.SwitchboardController.renderSwitchboard()).flashing(
        "success" -> changes.mkString("; "),
      )
    } catch {
      case e: Throwable =>
        logErrorWithRequestId("exception saving switches", e)

        Redirect(routes.SwitchboardController.renderSwitchboard()).flashing(
          "error" -> ("Error saving switches '%s'" format e.getMessage),
        )
    }
}
