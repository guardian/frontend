package controllers

import common.{ExecutionContexts, Logging}
import model.Cached.RevalidatableResult
import model._
import play.api.Environment
import play.api.mvc.{Action, Controller}
import services._

class TagIndexController (implicit env: Environment) extends Controller with ExecutionContexts with Logging {
  private val TagIndexCacheTime = 600

  private def forTagType(keywordType: String, title: String, page: String, metadata: MetaData) = Action { implicit request =>
    TagIndexesS3.getIndex(keywordType, page) match {
      case Left(TagIndexNotFound) =>
        log.error(s"404 error serving tag index page for $keywordType $page")
        NotFound

      case Left(TagIndexReadError(error)) =>
        log.error(s"JSON parse error serving tag index page for $keywordType $page: $error")
        InternalServerError

      case Right(tagPage) =>
        Cached(TagIndexCacheTime) {
          RevalidatableResult.Ok(views.html.tagIndexPage(
            metadata,
            tagPage,
            title
          ))
        }
    }
  }

  def keywords() = Action { implicit request =>
    (for {
      alphaListing <- KeywordAlphaIndexAutoRefresh.get
      sectionListing <- KeywordSectionIndexAutoRefresh.get
    } yield {
      Cached(TagIndexCacheTime) {
        RevalidatableResult.Ok(views.html.subjectsIndexListing(SubjectsListing(), alphaListing))
      }
    }) getOrElse InternalServerError("Not yet loaded alpha and section index for keywords")
  }

  def contributors() = Action { implicit request =>
    (for {
      alphaListing <- ContributorAlphaIndexAutoRefresh.get
    } yield {
      Cached(TagIndexCacheTime) {
        RevalidatableResult.Ok(views.html.contributorsIndexListing(ContributorsListing(), alphaListing))
      }
    }) getOrElse InternalServerError("Not yet loaded contributor index listing")
  }

  def keyword(page: String) = forTagType("keywords", "subjects", page, SubjectIndexPageMetaData.make(page))

  def contributor(page: String) = forTagType("contributors", "contributors", page, ContributorsIndexPageMetaData.make(page))
}

