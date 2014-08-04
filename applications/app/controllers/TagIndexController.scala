package controllers

import common.{Logging, ExecutionContexts}
import model._
import play.api.mvc.{Action, Controller}
import services._

object TagIndexController extends Controller with ExecutionContexts with Logging {
  private def forTagType(keywordType: String, metaData: TagIndexPageMetaData) = Action { implicit request =>
    TagIndexesS3.getIndex(keywordType, metaData.page) match {
      case Left(TagIndexNotFound) =>
        log.error(s"404 error serving tag index page for $keywordType ${metaData.page}")
        NotFound

      case Left(TagIndexReadError(error)) =>
        log.error(s"JSON parse error serving tag index page for $keywordType ${metaData.page}: $error")
        InternalServerError

      case Right(tagPage) =>
        Ok(views.html.tagIndexPage(
          metaData,
          tagPage,
          keywordType
        ))
    }
  }

  def keywords() = Action { implicit request =>
    (for {
      alphaListing <- KeywordAlphaIndexAutoRefresh.get
      sectionListing <- KeywordSectionIndexAutoRefresh.get
    } yield {
      Ok(views.html.keywordsIndexListing(new KeywordsListingMetaData(), alphaListing))
    }) getOrElse InternalServerError("Not yet loaded alpha and section index for keywords")
  }

  def contributors() = Action { implicit request =>
    (for {
      alphaListing <- ContributorAlphaIndexAutoRefresh.get
    } yield {
      Ok(views.html.contributorsIndexListing(new ContributorsListingMetaData(), alphaListing))
    }) getOrElse InternalServerError("Not yet loaded contributor index listing")
  }

  def keyword(page: String) = forTagType("keywords", new KeywordIndexPageMetaData(page))

  def contributor(page: String) = forTagType("contributors", new ContributorsIndexPageMetaData(page))
}
