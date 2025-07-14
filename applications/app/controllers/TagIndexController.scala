package controllers

import common.{ImplicitControllerExecutionContext, GuLogging}
import model.Cached.RevalidatableResult
import model._
import pages.TagIndexHtmlPage
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import services._

class TagIndexController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext
    with GuLogging {

  private val TagIndexCacheTime = 600

  private def forTagType(keywordType: String, title: String, page: String, metadata: MetaData): Action[AnyContent] =
    Action { implicit request =>
      TagIndexesS3.getIndex(keywordType, page) match {
        case Left(TagIndexNotFound) =>
          logInfoWithRequestId(s"404 error serving tag index page for $keywordType $page")
          NotFound

        case Left(TagIndexReadError(error)) =>
          logErrorWithRequestId(s"JSON parse error serving tag index page for $keywordType $page: $error")
          InternalServerError

        case Right(tagIndex) =>
          Cached(TagIndexCacheTime) {
            RevalidatableResult.Ok(
              TagIndexHtmlPage.html(
                TagIndexPage(tagIndex, metadata, title),
              ),
            )
          }
      }
    }

  def keywords(): Action[AnyContent] =
    Action { implicit request =>
      (for {
        alphaListing <- KeywordAlphaIndexAutoRefresh.get
        sectionListing <- KeywordSectionIndexAutoRefresh.get
      } yield {
        Cached(TagIndexCacheTime) {
          RevalidatableResult.Ok(
            TagIndexHtmlPage.html(SubjectsListing(alphaListing)),
          )
        }
      }) getOrElse InternalServerError("Not yet loaded alpha and section index for keywords")
    }

  def contributors(): Action[AnyContent] =
    Action { implicit request =>
      (for {
        alphaListing <- ContributorAlphaIndexAutoRefresh.get
      } yield {
        Cached(TagIndexCacheTime) {
          RevalidatableResult.Ok(
            TagIndexHtmlPage.html(ContributorsListing(alphaListing)),
          )
        }
      }) getOrElse InternalServerError("Not yet loaded contributor index listing")
    }

  def keyword(page: String): Action[AnyContent] =
    forTagType("keywords", "subjects", page, SubjectIndexPageMetaData.make(page))

  def contributor(page: String): Action[AnyContent] =
    forTagType("contributors", "contributors", page, ContributorsIndexPageMetaData.make(page))
}
