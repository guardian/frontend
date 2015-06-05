package controllers

import java.net.URL

import conf.LiveContentApi
import common._
import implicits.Dates
import model.{Content => ApiContent}
import model._

import actions.AuthenticatedActions
import actions.AuthenticatedActions.AuthRequest
import client.Error
import com.google.inject.Inject
import com.gu.identity.model.{SavedArticles, SavedArticle}
import common.ExecutionContexts
import org.joda.time.DateTime
import org.joda.time.format.ISODateTimeFormat

import scala.util.{Failure, Success}

//import controllers.SavedArticleData
import idapiclient.IdApiClient
import play.api.data.{Forms, Form}
import com.google.inject.Inject
import common.ExecutionContexts
import idapiclient.IdApiClient
import play.api.mvc._
import play.filters.csrf.CSRFCheck
import services._
import utils.SafeLogging

import scala.concurrent.Future
import implicits.Articles._
import implicits.Requests
import LiveContentApi.getResponse
import implicits.Dates

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

  implicit val dateOrdering: Ordering[DateTime] = Ordering[Long] on {
    _.getMillis
  }

  val page = IdentityPage("/saved-for-later", "Saved for later", "saved-for-later")

  def emptyArticles(): SavedArticles = {
    val fmt = ISODateTimeFormat.dateTimeNoMillis()
    new SavedArticles(fmt.print(new DateTime()), List.empty)

  }

  protected def formActionUrl(idUrlBuilder: IdentityUrlBuilder, idRequest: IdentityRequest, path: String): String = idUrlBuilder.buildUrl(path, idRequest)


  def saveContentItem = authenticatedActions.authAction.apply { implicit request =>

    val idRequest = identityRequestParser(request)
    val userId = request.user.getId()

    (idRequest.returnUrl, idRequest.shortUrl) match {
      case (Some(returnUrl), Some(shortUrl)) => {
        savedArticleService.getOrCreateArticlesList(request.user.auth).map {
          case Right(prefs) =>
            if (!prefs.contains(shortUrl)) {
              val articleId = idRequest.articleId match {
                case Some(id) => id
                case _ => new URL(returnUrl).getPath.drop(1)
              }
              val savedArticles = prefs.addArticle(articleId, shortUrl)
              api.updateSavedArticles(request.user.auth, savedArticles)
            }
          case Left(errors) => logger.error(errors.toString)
        }
        SeeOther(returnUrl)
      }
      case _ =>
        SeeOther(returnUrlVerifier.defaultReturnUrl)
    }
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
        val pageData = pageDataBuilder.apply(List.empty, emptyArticles, idRequest, pageNum)
        Future.successful(NoCache(Ok(views.html.profile.savedForLaterPage(page, formWithErrors, pageData))))
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
            val pageData = pageDataBuilder.apply(List.empty, emptyArticles, idRequest, pageNum)
            Future.successful(NoCache(Ok(views.html.profile.savedForLaterPage(page, formWithErrors, pageData))))
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
                    val pageData = pageDataBuilder.apply(List.empty, emptyArticles, idRequest, pageNum)
                    Future.successful(NoCache(Ok(views.html.profile.savedForLaterPage(page, formWithApiErrors, pageData))))
                }
                updatedResult
            }

            updatedArticlesViow.getOrElse {
              val formWithError = form.withError("Error", "There was a problem with your request")
              val pageData = pageDataBuilder.apply(List.empty, emptyArticles, idRequest, pageNum)
              Future.successful(NoCache(Ok(views.html.profile.savedForLaterPage(page, formWithError, pageData))))
            }

          case Left(errors) =>
            val formWithErrors = buildFormFromErrors(errors)
            val pageData = pageDataBuilder.apply(List.empty, emptyArticles, idRequest, pageNum)
            Future.successful(NoCache(Ok(views.html.profile.savedForLaterPage(page, formWithErrors, pageData))))
        }
        response
      }
      boundForm.fold[Future[Result]](onError, onSuccess)
    }

  private def fillFormWithApiDataForPageAndGetResult(idRequest: IdentityRequest, updatedArticles: SavedArticles, pageNum: Int)
                                                    (implicit request: RequestHeader): Future[Result] = {

    //Deal with case where one item on last page has` been deleted
    if ( pageNum > updatedArticles.numPages && pageNum > 1) {
      Future.successful(NoCache(SeeOther( s"/saved-for-later-page?page=%d".format(pageNum - 1))))
    } else {

      val articles = updatedArticles.getPage(pageNum)
      val shortUrls = articles.map(_.shortUrl)
      val form = savedArticlesForm.fill(SavedArticleData(shortUrls))

      val futureContentList: Future[List[ApiContent]] = getResponse(LiveContentApi.search(Edition.defaultEdition)
        .ids(shortUrls.map(_.drop(1)).mkString(","))
        .showFields("all")
        .showElements ("all")
      ).map(r => r.results.map(ApiContent(_)))

      futureContentList.map { contentList =>
        val pageData = pageDataBuilder(contentList, updatedArticles, idRequest, pageNum)
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

