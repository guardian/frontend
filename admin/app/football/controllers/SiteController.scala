package controllers.admin

import play.api._
import play.api.mvc._
import play.api.Play.current
import org.joda.time.LocalDate
import java.net.URLDecoder
import scala.concurrent.Future
import common.ExecutionContexts
import model.Cached


object SiteController extends Controller with ExecutionContexts {

  def index =AuthActions.AuthActionTest { implicit request =>
    Cached(60)(Ok(views.html.football.index()))
  }

}
