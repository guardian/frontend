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

object SwitchboardPlistaController extends Controller with AuthLogging with Logging with ExecutionContexts {

  val SwitchPattern = """([a-z\d-]+)=(on|off)""".r

  def renderSwitchboard() = AuthActions.AuthActionTest.async { implicit request =>
    log("loaded plista Switchboard", request)
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
      NoCache(Ok(views.html.switchboardPlista(Configuration.environment.stage, lastModified)))
    }
  }

  def save() = AuthActions.AuthActionTest.async { implicit request =>
    val form = request.body.asFormUrlEncoded

    val localLastModified = form.get("lastModified").head.toLong
    val remoteSwitches = Store.getSwitchesWithLastModified

    // if any of the switches have a later modified date than locally, redirect
    if (remoteSwitches.map(_._2).exists(_.getMillis > localLastModified)) {
      Future {
        NoCache(Redirect("/dev/switchboard-plista").flashing("error" -> "A more recent change to the switch has been found, please refresh and try again."))
      }
    } else {
      log("saving plista switchboard", request)
      val requester = UserIdentity.fromRequest(request).get.fullName
      // for switches not present on this page, we need to persist their current values
      val configuration = remoteSwitches.map(_._1)
      val currentState = Properties(configuration getOrElse "")
      val updates =
          request.body.asFormUrlEncoded.map { params =>
            Switches.all map { switch =>
              // if the switch has been set, then the returned value will be an array buffer, holding the "on"/"off", otherwise persist the value
              val switchSetting = params.get(switch.name)
              switch.name + "=" + (if (!switchSetting.isEmpty) switchSetting.get(0) else currentState.get(switch.name).getOrElse("off"))
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

    log.info("plista switches successfully updated")

    val changes = updates filterNot { current contains _ }
    Notification.onSwitchChanges(requester, Configuration.environment.stage, changes)
    changes foreach { change =>
      log.info(s"Switch change by ${requester}: ${change}")
    }

    Redirect("/dev/switchboard-plista")
  } catch { case e: Throwable =>
    log.error("exception saving plista switches", e)
    SwitchesUpdateErrorCounter.increment()

    Redirect("/dev/switchboard-plista").flashing(
      "error" -> ("Error saving switches '%s'" format e.getMessage)
    )
  }
}
