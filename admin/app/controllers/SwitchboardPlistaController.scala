package controllers.admin

import com.gu.googleauth.UserIdentity
import common._
import conf.switches.{SwitchState, Switches}
import controllers.AuthLogging
import conf.Configuration
import play.api.mvc._
import services.Notification
import tools.Store
import model.NoCache

class SwitchboardPlistaController extends Controller with AuthLogging with Logging with ExecutionContexts {

  def renderSwitchboard() = AuthActions.AuthActionTest { implicit request =>
    log("loaded plista Switchboard", request)

    val switchesWithLastModified = Store.getSwitchesWithLastModified
    val switchStates = Properties(switchesWithLastModified map {_._1} getOrElse "")
    val lastModified = switchesWithLastModified map {_._2} map {_.getMillis} getOrElse(System.currentTimeMillis)

    switchStates.get(Switches.PlistaForOutbrainAU.name) foreach {
      case "on" => Switches.PlistaForOutbrainAU.switchOn()
      case _ => Switches.PlistaForOutbrainAU.switchOff()
    }

    NoCache(Ok(views.html.switchboardPlista(Configuration.environment.stage, Switches.PlistaForOutbrainAU, lastModified)))
  }

  def save() = AuthActions.AuthActionTest { implicit request =>

    def saveSwitchesOrError(updates: Seq[String], newState: String) = try {

      val requester = UserIdentity.fromRequest(request).get.fullName
      Store.putSwitches(updates mkString "\n")

      log.info("plista switches successfully updated")

      val alterationMade = if (Switches.PlistaForOutbrainAU.isSwitchedOn) newState == "off" else newState == "on"

      if (alterationMade) {
        val update = Switches.PlistaForOutbrainAU.name + "=" + newState

        Notification.onSwitchChanges(requester, Configuration.environment.stage, List() :+ update)
        log.info(s"Switch change by ${requester}: ${update}")
      }

      Redirect("/dev/switchboard-plista")
      } catch { case e: Throwable =>
        log.error("exception saving plista switches", e)

        Redirect("/dev/switchboard-plista").flashing(
          "error" -> ("Error saving switches '%s'" format e.getMessage)
        )
      }

    val form = request.body.asFormUrlEncoded

    val localLastModified = form.get("lastModified").head.toLong
    val remoteSwitches = Store.getSwitchesWithLastModified

    // if any of the switches have a later modified date then redirect
    if (remoteSwitches.map(_._2).exists(_.getMillis > localLastModified)) {
        NoCache(Redirect("/dev/switchboard-plista").flashing("error" -> "A more recent change to the switch has been found, please refresh and try again."))
    } else {
      log("saving plista switchboard", request)
      val plistaSetting = form.get(Switches.PlistaForOutbrainAU.name).head

      // for switches not present on this page, we need to persist their current values
      val currentState = Properties(remoteSwitches.map(_._1) getOrElse "")
      val currentConfig = Switches.all.filterNot(_ == Switches.PlistaForOutbrainAU).map{switch => switch.name + "=" + currentState.get(switch.name).getOrElse("off")}
      val plistaConfig = Switches.PlistaForOutbrainAU.name + "=" + plistaSetting

      saveSwitchesOrError(currentConfig :+ plistaConfig, plistaSetting)
    }
  }
}
