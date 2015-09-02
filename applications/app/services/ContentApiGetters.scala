package services

import com.gu.contentapi.client.model.{Content => ApiContent, Crossword}
import common.{Logging, Edition}
import conf.LiveContentApi
import controllers.WebAppController._
import play.api.mvc.{RequestHeader, Result}

import scala.concurrent.Future

object ContentApiGetters extends Logging {
  def withCrossword(crosswordType: String, id: Int)(f: (Crossword, ApiContent) => Result)(implicit request: RequestHeader): Future[Result] = {
    LiveContentApi.getResponse(LiveContentApi.item(s"crosswords/$crosswordType/$id", Edition(request)).showFields("all")).map { response =>
      val maybeCrossword = for {
        content <- response.content
        crossword <- content.crossword }
        yield f(crossword, content)
      maybeCrossword getOrElse InternalServerError("Crossword response from Content API invalid.")
    } recover { case e =>
      log.error("Content API query returned an error.", e)
      InternalServerError("Content API query returned an error.")
    }
  }
}
