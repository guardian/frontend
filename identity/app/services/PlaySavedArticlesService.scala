package services

import common.ExecutionContexts

import scala.concurrent.Future

import client.{Error, Response}
import com.google.inject.Singleton
import model.FrontendSavedArtcles
import utils.SafeLogging


//{"status":"error","errors":[{"message":"Not found","description":"Resource not found"}]}
@Singleton
class PlaySavedArticlesService extends SafeLogging with ExecutionContexts{

  def getOrCreateArticlesList(savedArticlesResponse: Future[Response[FrontendSavedArtcles]]): Future[Response[FrontendSavedArtcles]] = {
    savedArticlesResponse.flatMap {
      case Right(_) =>  savedArticlesResponse
      case Left(errors) =>
            errors match {
              case List(Error("Not found", "Resource not found", _, _)) =>  Future { Right(new FrontendSavedArtcles()) }
              case _ => savedArticlesResponse
            }
      }
  }
}
