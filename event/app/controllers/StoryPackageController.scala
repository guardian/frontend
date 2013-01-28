package controllers

import common._
import play.api.mvc.{ Action, Controller }
import model._

object StoryPackageController extends Controller with Logging {

  def render() = Action { implicit request =>
    Ok("Ok")

    // val articleId = request.queryString("id").headOption

    // articleId.map { id =>

    //val html = views.html.fragments.storyPackage()
    // val foo = "bar"
    // request.getQueryString("callback").map { callback =>
    //   JsonComponent(foo)
    // } getOrElse {
    //   Cached(60) {
    //     Ok(Compressed(foo))
    //   }
    // }

    //} getOrElse (BadRequest("need a article id"))

  }
}
