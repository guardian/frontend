package controllers

import java.net.URI

import actions.AuthenticatedActions
import client.Error
import com.gu.identity.model.SavedArticles
import model._
import org.joda.time.DateTime
import org.joda.time.format.ISODateTimeFormat

import com.google.inject.{Singleton, Inject}
import common.ExecutionContexts
import idapiclient.IdApiClient
import implicits.Articles._
import org.jsoup.nodes.Document
import play.api.data.{Form, Forms}
import play.api.mvc._
import services._
import utils.SafeLogging
import views.support.{HtmlCleaner, withJsoup}

import scala.collection.JavaConversions._
import scala.concurrent.Future
import scala.util.{Failure, Success}

@Singleton
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
        savedArticleService.getOrCreateArticlesList(request.user.auth).onComplete {
          case Success(prefs) =>
            if (!prefs.contains(shortUrl)) {
              val articleId = idRequest.articleId match {
                case Some(id) => id
                case _ => new URI(returnUrl).getPath.drop(1)
              }
              val savedArticles = prefs.addArticle(articleId, shortUrl, platform)
              api.updateSavedArticles(request.user.auth, savedArticles)
            }
          case Failure(t) => logger.error("Could not save article with id %s error: %s".format(shortUrl, t.getMessage))
        }
        SeeOther(returnUrl)
    }) getOrElse SeeOther(returnUrlVerifier.defaultReturnUrl)
  }

  def listSavedContentPage() = authenticatedActions.authAction.async { implicit request =>

    val idRequest = identityRequestParser(request)
    val pageNum = idRequest.page.getOrElse(1)

    savedArticleService.getOrCreateArticlesList(request.user.auth).flatMap { savedArticles =>
      renderSavedForLaterPage(idRequest, savedArticles, pageNum)
    }.recoverWith { case t: Throwable =>
      logger.error("Error retriving saved articles ")
      val formWithErrors = savedArticlesForm.withError("", "Could not get your saved articles")
      pageDataBuilder(emptyArticles(), idRequest, pageNum).map { pageData =>
        NoCache(Ok(views.html.profile.savedForLater(page, formWithErrors, pageData)))
      }
    }
  }
//            val formWithErrors = savedArticlesForm.withError("", "Error retrieving your saved articles")

  def deleteSavedContentItemFromPage() =
    authenticatedActions.authAction.async { implicit request =>
      val idRequest = identityRequestParser(request)
      val boundForm = savedArticlesForm.bindFromRequest
      val pageNum = idRequest.page.getOrElse(1)


      def onError(formWithErrors: Form[SavedArticleData]): Future[Result] = {
        savedArticleService.getOrCreateArticlesList(request.user.auth).flatMap { savedArticles =>
          renderSavedForLaterPage(idRequest, savedArticles, pageNum)
        }.recoverWith { case t: Throwable =>
          logger.error("Error retriving saved articles for deletion")
          val formWithErrors = savedArticlesForm.withError("", "Could not get your saved articles to delete from")
          pageDataBuilder(emptyArticles(), idRequest, pageNum).map { pageData =>
            NoCache(Ok(views.html.profile.savedForLater(page, formWithErrors, pageData)))
          }
        }
      }

      def onSuccess(data: SavedArticleData): Future[Result] = {
        val response: Future[Result] = savedArticleService.getOrCreateArticlesList(request.user.auth).flatMap {
          savedArticles =>
            val form = savedArticlesForm.fill(SavedArticleData(savedArticles.newestFirst.map(_.shortUrl)))
            val updatedArticlesViow: Option[Future[Result]] = data.deleteArticle.map {
              shortUrlOfDeletedArticle =>
                val updatedArticles = savedArticles.removeArticle(shortUrlOfDeletedArticle)
                val updatedResult = api.updateSavedArticles(request.user.auth, updatedArticles).flatMap {
                  case Right(updatedArticles) =>
                    renderSavedForLaterPage(idRequest, updatedArticles, pageNum)
                  case Left(errors) =>
                    val formWithErrors = savedArticlesForm.withError("", "There was a problem deleting your article(s)")
                    pageDataBuilder(savedArticles, idRequest, pageNum).map { pageData =>
                      NoCache(Ok(views.html.profile.savedForLater(page, formWithErrors, pageData)))
                    }
                }
                updatedResult
            }

            updatedArticlesViow.getOrElse {
              val formWithError = form.withError("Error", "There was a problem with your request")
              pageDataBuilder(emptyArticles(), idRequest, pageNum).map { pageData =>
                NoCache(Ok(views.html.profile.savedForLater(page, formWithError, pageData)))
              }
            }
        }.recoverWith { case t: Throwable  =>
          val formWithErrors = savedArticlesForm.withError("", "Error retrieving your saved articles")
          pageDataBuilder(emptyArticles(), idRequest, pageNum).map { pageData =>
            NoCache(Ok(views.html.profile.savedForLater(page, formWithErrors, pageData)))
          }
        }
        response
      }
      boundForm.fold[Future[Result]](onError, onSuccess)
    }

  private def renderSavedForLaterPage(idRequest: IdentityRequest, updatedArticles: SavedArticles, pageNum: Int)
                                                    (implicit request: RequestHeader): Future[Result] = {

    //Deal with case where one item on last page has been deleted
    if ( pageNum > updatedArticles.numPages && pageNum > 1) {
      Future.successful(NoCache(SeeOther( s"/saved-for-later?page=${updatedArticles.numPages}")))
    } else {
      val page = IdentityPage("/saved-for-later", "Saved for later", s"saved-for-later-${updatedArticles.articles.length}")
      pageDataBuilder(updatedArticles, idRequest, pageNum).map { pageData =>
        val form = savedArticlesForm.fill(SavedArticleData(pageData.shortUrls))
        NoCache(Ok(views.html.profile.savedForLater(page, form, pageData)))
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

object SaveForLaterCleaner {
  def apply(html: String) = withJsoup(html){ CampaignLinkCleaner("sfl") }
}

case class CampaignLinkCleaner(campaign: String) extends HtmlCleaner {
  override def clean(document: Document): Document = {
    document.select(".saved-content .fc-item__container a").foreach{ anchorElement =>
      val linkWithCampaign = anchorElement.attr("href") + s"?INTCMP=$campaign"
      anchorElement.attr("href", linkWithCampaign)
    }
    document
  }
}
