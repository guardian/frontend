package services

import com.gu.identity.model.{SavedArticle, SavedArticles}
import common.ExecutionContexts
import idapiclient.IdApiClient
import org.joda.time.DateTime
import org.joda.time.format.ISODateTimeFormat

import scala.concurrent.Future

import client.{Auth, Error, Response}
import com.google.inject.{Inject, Singleton}
import utils.SafeLogging
import implicits.Articles.RichSavedArticles

@Singleton
class PlaySavedArticlesService @Inject()(api: IdApiClient) extends SafeLogging with ExecutionContexts{

  val fmt = ISODateTimeFormat.dateTimeNoMillis()

  def getOrCreateArticlesList(auth: Auth): Future[Response[SavedArticles]] = {
    val savedArticlesResponse = api.savedArticles(auth)
    savedArticlesResponse.flatMap {
      case Right(response) => Future { Right(sanitizeArticleData(response)) }
      case Left(errors) =>
        errors match {
          case List(Error("Not found", "Resource not found", _, _)) =>
            val timestamp = fmt.print(new DateTime())
            Future { Right(new SavedArticles(timestamp, List.empty)) }
          case _ => savedArticlesResponse
        }
    }
  }

  def sanitizeArticleData(savedArticles: SavedArticles) : SavedArticles = {

    val sanitizedArticles = savedArticles.articles map {
      article =>
        val id = article.id.replace("http://www.theguardian.com/","")
        val shortUrl = article.shortUrl.replace("http://gu.com","")
        SavedArticle(id, shortUrl, article.date, article.read, article.platform)
    }
    SavedArticles(savedArticles.version, sanitizedArticles)
  }

}
