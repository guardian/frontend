package controllers

import java.net.URI

import actions.AuthenticatedActions
import client.Error
import com.gu.identity.model.SavedArticles
import common._
import conf.LiveContentApi
import model.{Content => ApiContent, _}
import org.joda.time.DateTime
import org.joda.time.format.ISODateTimeFormat

import com.google.inject.Inject
import common.ExecutionContexts
import conf.LiveContentApi.getResponse
import idapiclient.IdApiClient
import implicits.Articles._
import play.api.data.{Form, Forms}
import play.api.mvc._
import services._
import utils.SafeLogging

import scala.concurrent.Future

class SaveContentController @Inject() ( api: IdApiClient,
                                        identityRequestParser: IdRequestParser,
                                        authenticatedActions: AuthenticatedActions,
                                        returnUrlVerifier: ReturnUrlVerifier,
                                        savedArticleService: PlaySavedArticlesService,
                                        idUrlBuilder: IdentityUrlBuilder,
                                        pageDataBuilder: SaveForLaterDataBuilder
                                        )
  extends Controller with ExecutionContexts with SafeLogging {

  import SavedArticleData._

  implicit val dateOrdering: Ordering[DateTime] = Ordering[Long] on { _.getMillis }


  val page = IdentityPage("/saved-for-later", "Saved for later", "saved-for-later")

  def emptyArticles(): SavedArticles = {
    val fmt = ISODateTimeFormat.dateTimeNoMillis()
    new SavedArticles(fmt.print(new DateTime()), List.empty)

  }

  protected def formActionUrl(idUrlBuilder: IdentityUrlBuilder, idRequest: IdentityRequest, path: String): String = idUrlBuilder.buildUrl(path, idRequest)

  def saveContentItem = authenticatedActions.authAction.apply { implicit request =>

    val idRequest = identityRequestParser(request)
    val userId = request.user.getId()

    (for {
      returnUrl <- idRequest.returnUrl
      shortUrl <- idRequest.shortUrl
      platform <- idRequest.platform
    } yield {
        savedArticleService.getOrCreateArticlesList(request.user.auth).map {
          case Right(prefs) =>
            if (!prefs.contains(shortUrl)) {
              val articleId = idRequest.articleId match {
                case Some(id) => id
                case _ => new URI(returnUrl).getPath.drop(1)
              }
              val savedArticles = prefs.addArticle(articleId, shortUrl, platform)
              api.updateSavedArticles(request.user.auth, savedArticles)
            }
          case Left(errors) => logger.error(errors.toString)
        }
        SeeOther(returnUrl)
    }) getOrElse SeeOther(returnUrlVerifier.defaultReturnUrl)
  }

  def listSavedContentPage() = authenticatedActions.authAction.async { implicit request =>

    val idRequest = identityRequestParser(request)
    val pageNum = idRequest.page.getOrElse(1)

    savedArticleService.getOrCreateArticlesList(request.user.auth).flatMap {
      case Right(savedArticles) =>
        fillFormWithApiDataForPageAndGetResult(idRequest, savedArticles, pageNum)
      case Left(errors) =>
        val formWithErrors = errors.foldLeft(savedArticlesForm) {
          case (formWithErrors, Error(message, decription, _, context)) =>
            formWithErrors.withError(context.getOrElse(""), message)
        }
        pageDataBuilder(emptyArticles(), idRequest, pageNum).map { pageData =>
          NoCache(Ok(views.html.profile.savedForLaterPage(page, formWithErrors, pageData)))
        }
    }
  }

  def deleteSavedContentItemFromPage() =
    authenticatedActions.authAction.async { implicit request =>
      val idRequest = identityRequestParser(request)
      val boundForm = savedArticlesForm.bindFromRequest
      val pageNum = idRequest.page.getOrElse(1)

      def buildFormFromErrors(errors: List[Error]): Form[SavedArticleData] = {
        val formWithErrors = errors.foldLeft(savedArticlesForm) {
          case (formWithErrors, Error(message, decription, _, context)) =>
            formWithErrors.withError(context.getOrElse(""), message)
        }
        formWithErrors
      }

      def onError(formWithErrors: Form[SavedArticleData]): Future[Result] = {
        savedArticleService.getOrCreateArticlesList(request.user.auth).flatMap {
          case Right(savedArticles) =>
            fillFormWithApiDataForPageAndGetResult(idRequest, savedArticles, pageNum)
          case Left(errors) =>
            val formWithApiErrors = buildFormFromErrors(errors)
            pageDataBuilder(emptyArticles(), idRequest, pageNum).map { pageData =>
              NoCache(Ok(views.html.profile.savedForLaterPage(page, formWithErrors, pageData)))
            }
        }
      }

      def onSuccess(data: SavedArticleData): Future[Result] = {
        val response: Future[Result] = savedArticleService.getOrCreateArticlesList(request.user.auth).flatMap {
          case Right(savedArticles) =>
            val form = savedArticlesForm.fill(SavedArticleData(savedArticles.articles.map(_.shortUrl)))

            val updatedArticlesViow: Option[Future[Result]] = data.deleteArticle.map {
              shortUrlOfDeletedArticle =>
                val updatedArticles = savedArticles.removeArticle(shortUrlOfDeletedArticle)
                val updatedResult = api.updateSavedArticles(request.user.auth, updatedArticles).flatMap {
                  case Right(updatedArticles) =>
                    fillFormWithApiDataForPageAndGetResult(idRequest, updatedArticles, pageNum)

                  case Left(errors) =>
                    val formWithApiErrors = buildFormFromErrors(errors)
                    pageDataBuilder(emptyArticles(), idRequest, pageNum).map { pageData =>
                      NoCache(Ok(views.html.profile.savedForLaterPage(page, formWithApiErrors, pageData)))
                    }
                }
                updatedResult
            }

            updatedArticlesViow.getOrElse {
              val formWithError = form.withError("Error", "There was a problem with your request")
              pageDataBuilder(emptyArticles(), idRequest, pageNum).map { pageData =>
                NoCache(Ok(views.html.profile.savedForLaterPage(page, formWithError, pageData)))
              }
            }

          case Left(errors) =>
            val formWithErrors = buildFormFromErrors(errors)
            pageDataBuilder(emptyArticles(), idRequest, pageNum).map { pageData =>
              NoCache(Ok(views.html.profile.savedForLaterPage(page, formWithErrors, pageData)))
            }
        }
        response
      }
      boundForm.fold[Future[Result]](onError, onSuccess)
    }

  private def fillFormWithApiDataForPageAndGetResult(idRequest: IdentityRequest, updatedArticles: SavedArticles, pageNum: Int)
                                                    (implicit request: RequestHeader): Future[Result] = {

    //Deal with case where one item on last page has been deleted
    if ( pageNum > updatedArticles.numPages && pageNum > 1) {
      Future.successful(NoCache(SeeOther( s"/saved-for-later-page?page=%d".format(pageNum - 1))))
    } else {
      pageDataBuilder(updatedArticles, idRequest, pageNum).map { pageData =>
        val form = savedArticlesForm.fill(SavedArticleData(pageData.shortUrls))
        NoCache(Ok(views.html.profile.savedForLaterPage(page, form, pageData)))
      }
    }
  }
}

case class SavedArticleData(shortUrls: List[String], deleteArticle: Option[String] = None)
object SavedArticleData {
  val savedArticlesForm = Form (
       Forms.mapping(
         "article" -> Forms.list(Forms.text),
         "deleteArticle" -> Forms.optional(Forms.text)
       )(SavedArticleData.apply)(SavedArticleData.unapply)
  )
}

