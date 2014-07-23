package controllers

import common.{Logging, ExecutionContexts}
import model.TagIndexPageMetaData
import play.api.mvc.{Action, Controller}
import services.{TagIndexReadError, TagIndexNotFound, TagIndexesS3}

object TagIndexController extends Controller with ExecutionContexts with Logging {
  private def keyword(keywordType: String, page: String) = Action {
    val indexCharacter = page.charAt(0)

    TagIndexesS3.getIndex("subject", indexCharacter) match {
      case Left(TagIndexNotFound) =>
        log.error(s"404 error serving tag index page for $keywordType $page")
        NotFound

      case Left(TagIndexReadError(error)) =>
        log.error(s"JSON parse error serving tag index page for $keywordType $page: $error")
        InternalServerError(s"Error reading $page")

      case Right(tagPage) =>
        Ok(views.html.tagIndexPage(new TagIndexPageMetaData(keywordType, indexCharacter), tagPage))
    }
  }

  def subject(page: String) = keyword("subject", page)

  def contributor(page: String) = keyword("contributor", page)
}
