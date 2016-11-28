package services

import client.{Error, Response}
import com.exacttarget.fuelsdk.{ETResponse, ETSubscriber}
import utils.SafeLogging
import common.ExecutionContexts
import conf.IdentityConfiguration
import scala.concurrent.Future

class ExactTargetService(conf: IdentityConfiguration) extends ExecutionContexts with SafeLogging {

  def unsubscribeFromAllLists(email: String): Future[Response[ETSubscriber]] = Future {

    def unsubscribe(subscriber: ETSubscriber) = {
      subscriber.setStatus(ETSubscriber.Status.UNSUBSCRIBED)
      val response = etClient.update(subscriber)

      Option(response.getResult) match {
        case None => Left(List(Error(response.getResponseMessage, response.getResponseMessage, response.getResponseCode.toInt)))
        case Some(etResult) => Right(etResult.getObject)
      }
    }

    def createAndUnsubscribe() = {
      val subscriber = new ETSubscriber()
      subscriber.setEmailAddress(email)
      subscriber.setKey(email)
      subscriber.setStatus(ETSubscriber.Status.UNSUBSCRIBED)
      val response = etClient.create(subscriber)

      Option(response.getResult) match {
        case None => Left(List(Error(response.getResponseMessage, response.getResponseMessage, response.getResponseCode.toInt)))
        case Some(etResult) => Right(etResult.getObject)
      }
    }

    Option(etClient.retrieve(classOf[ETSubscriber], s"emailAddress=$email")) match {
      case None => createAndUnsubscribe
      case Some(etResult) => unsubscribe(etResult.getObject)
    }
  }

  private lazy val etClient =
    conf.exactTargetUserhelp.factory.getOrElse(throw new RuntimeException("Missing Exact Target Userhelp configuration"))
}
