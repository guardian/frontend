package controllers.admin

import com.gu.googleauth.UserIdentity
import common._
import conf.switches.Switches
import conf.Configuration
import play.api.mvc._
import services.SwitchNotification
import tools.Store
import model.{ApplicationContext, NoCache}

class SwitchboardPlistaController(akkaAsync: AkkaAsync, val controllerComponents: ControllerComponents)(implicit context: ApplicationContext) extends BaseController with Logging with ImplicitControllerExecutionContext {

  def renderSwitchboard(): Action[AnyContent] = Action { implicit request =>
    log.info("loaded plista Switchboard")

    val switchesWithLastModified = Store.getSwitchesWithLastModified
    val switchStates = Properties(switchesWithLastModified map {_._1} getOrElse "")
    val lastModified = switchesWithLastModified map {_._2} map {_.getMillis} getOrElse System.currentTimeMillis

    switchStates.get(Switches.PlistaAU.name) foreach {
      case "on" => Switches.PlistaAU.switchOn()
      case _ => Switches.PlistaAU.switchOff()
    }

    NoCache(Ok(views.html.switchboardPlista(Switches.PlistaAU, lastModified)))
  }

  def save(): Action[AnyContent] = Action { implicit request =>

    def saveSwitchesOrError(updates: Seq[String], newState: String) = try {

      val requester = UserIdentity.fromRequest(request).get.fullName
      Store.putSwitches(updates mkString "\n")

      log.info("plista switches successfully updated")

      val alterationMade = if (Switches.PlistaAU.isSwitchedOn) newState == "off" else newState == "on"

      if (alterationMade) {
        val update = Switches.PlistaAU.name + "=" + newState

        SwitchNotification.onSwitchChanges(akkaAsync)(requester, Configuration.environment.stage, List() :+ update)
        log.info(s"Switch change by $requester: $update")
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
      log.info("saving plista switchboard")
      val plistaSetting = form.get(Switches.PlistaAU.name).head

      // for switches not present on this page, we need to persist their current values
      val currentState = Properties(remoteSwitches.map(_._1) getOrElse "")
      val currentConfig = Switches.all.filterNot(_ == Switches.PlistaAU).map{ switch => switch.name + "=" + currentState.getOrElse(switch.name, "off")}
      val plistaConfig = Switches.PlistaAU.name + "=" + plistaSetting

      saveSwitchesOrError(currentConfig :+ plistaConfig, plistaSetting)
    }
  }
}
