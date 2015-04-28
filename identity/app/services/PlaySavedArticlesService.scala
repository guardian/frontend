package services

import com.gu.identity.model.SavedArticles
import common.ExecutionContexts
import idapiclient.IdApiClient
import org.joda.time.DateTime
import org.joda.time.format.ISODateTimeFormat

import scala.concurrent.Future

import client.{Auth, Error, Response}
import com.google.inject.{Inject, Singleton}
import utils.SafeLogging

@Singleton
class PlaySavedArticlesService @Inject()(api: IdApiClient) extends SafeLogging with ExecutionContexts{

  val fmt = ISODateTimeFormat.dateTimeNoMillis()

  def getOrCreateArticlesList(auth: Auth): Future[Response[SavedArticles]] = {
    val savedArticlesResponse = api.savedArticles(auth)
    savedArticlesResponse.flatMap {
      case Right(_) => savedArticlesResponse
      case Left(errors) =>
        errors match {
          case List(Error("Not found", "Resource not found", _, _)) =>
            val timestamp = fmt.print(new DateTime())
            Future { Right(new SavedArticles(timestamp, List.empty)) }
          case _ => savedArticlesResponse
        }
    }
  }
}
