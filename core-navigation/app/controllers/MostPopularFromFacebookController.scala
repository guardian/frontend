package controllers

import common._
import model._
import play.api.mvc.{ Controller, Action }
import feed.MostPopularFromFacebookAgent

import concurrent.Future
import scala.util.Random

object MostPopularFromFacebookController extends Controller with Logging with ExecutionContexts {

  val page = new Page(
    "most-read",
    "most-read",
    "Most read",
    "GFE:Most Read"
  )

  def render(path: String) = Action { implicit request =>
    val globalPopular = MostPopular("The Guardian", "", MostPopularFromFacebookAgent.mostPopular)
    val promiseOfSectionPopular = Future(Nil)
    Async {
      promiseOfSectionPopular.map {
        sectionPopular =>
          sectionPopular :+ globalPopular match {
            case Nil => NotFound
            case popular => {
              Cached(900){
                if (request.isJson)
                  JsonComponent(
                    "html" -> views.html.fragments.mostPopular(popular, 5),
                    "trails" -> popular.headOption.map(_.trails).getOrElse(Nil).map(_.url)
                  )
                else
                  Ok(views.html.mostPopular(page, popular))
              }
            }
          }
      }
    }
  }

  def renderExpandable(path: String) = Action { implicit request =>
    val globalPopular = MostPopular("The Guardian", "", MostPopularFromFacebookAgent.mostPopular)
    val promiseOfSectionPopular = Future(Nil)
    Async {
      promiseOfSectionPopular.map {
        sectionPopular =>
          sectionPopular :+ globalPopular match {
            case Nil => NotFound
            case popular => {
              Cached(900){
                if (request.isJson)
                  JsonComponent(
                    "html" -> views.html.fragments.mostPopularExpandable(popular, 5),
                    "trails" -> popular.headOption.map(_.trails).getOrElse(Nil).map(_.url)
                  )
                else
                  Ok(views.html.mostPopular(page, popular))
              }
            }
          }
      }
    }
  }

  def renderCard() = Action { implicit request =>
    val trails = Random.shuffle(MostPopularFromFacebookAgent.mostPopular)
    if(trails.nonEmpty) {
      val jsonResponse = () => views.html.fragments.cards.card(trails.head, "right", "Most read", "Story pack card | most read")
      renderFormat(jsonResponse, 60)
    } else {
      NotFound
    }
  }
}
