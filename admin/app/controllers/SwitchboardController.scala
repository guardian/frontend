package controllers

import common._
import common.AdminMetrics.{ SwitchesUpdateCounter, SwitchesUpdateErrorCounter }
import conf.{ Switches, Configuration }
import play.api.mvc._
import play.api.Play.current
import play.api.libs.concurrent.Akka
import services.{Notification, Audit}
import tools.Store

object SwitchboardController extends Controller with AuthLogging with Logging with ExecutionContexts {

  val SwitchPattern = """([a-z\d-]+)=(on|off)""".r

  def render() = AuthAction { implicit request =>
    log("loaded Switchboard", request)

    val promiseOfSwitches = Akka future { Store.getSwitchesWithLastModified }

    Async {
      promiseOfSwitches map { switchesWithLastModified =>
          val configuration = switchesWithLastModified.map(_._1)
          val nextStateLookup = Properties(configuration getOrElse "")

          Switches.all foreach {
            switch =>
              nextStateLookup.get(switch.name) foreach {
                case "on" => switch.switchOn()
                case _ => switch.switchOff()
              }
          }

          val lastModified = switchesWithLastModified.map(_._2).map(_.getMillis).getOrElse(System.currentTimeMillis)
          Ok(views.html.switchboard(Configuration.environment.stage, lastModified))
      }
    }
  }

  def save() = AuthAction { implicit request =>

      val form = request.body.asFormUrlEncoded

      val localLastModified = form.get("lastModified").head.toLong
      val remoteLastModified = Store.getSwitchesLastModified

      if (remoteLastModified.exists(_.getMillis > localLastModified)) {
        Redirect(routes.SwitchboardController.render()).flashing("error" -> "Stomp! Try Again.")
      } else {

        log("saving switchboard", request)

        val requester = Identity(request).get.fullName
        val updates = request.body.asFormUrlEncoded.map { params =>
            Switches.all map { switch =>
                switch.name + "=" + params.get(switch.name).map(v => "on").getOrElse("off")
            }
        }.get

        val promiseOfSavedSwitches = Akka.future {
          saveSwitchesOrError(requester, updates)
        }

        Async {
          promiseOfSavedSwitches
        }
      }
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

    Redirect(routes.SwitchboardController.render())
  } catch { case e: Throwable =>
    log.error("exception saving switches", e)
    SwitchesUpdateErrorCounter.recordCount(1)

    Redirect(routes.SwitchboardController.render()).flashing(
      "error" -> ("Error saving switches '%s'" format e.getMessage)
    )
  }
}