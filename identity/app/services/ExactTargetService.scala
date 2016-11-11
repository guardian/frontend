package services

import com.exacttarget.fuelsdk.{ETResponse, ETSubscriber}
import utils.SafeLogging
import common.ExecutionContexts
import conf.IdentityConfiguration
import scala.concurrent.Future
import scalaz.\/

class ExactTargetService(conf: IdentityConfiguration) extends ExecutionContexts with SafeLogging {

  type UnsubscribeError = ETResponse[ETSubscriber]

  def unsubscribeFromAllLists(email: String): Future[UnsubscribeError \/ ETSubscriber] = Future {

    def unsubscribe(subscriber: ETSubscriber) = {
      subscriber.setStatus(ETSubscriber.Status.UNSUBSCRIBED)
      val response = etClient.update(subscriber)

      Option(response.getResult).fold[UnsubscribeError \/ ETSubscriber]
        {\/.left(response)}
        {result => \/.right(result.getObject)}
    }

    def createAndUnsubscribe() = {
      val subscriber = new ETSubscriber()
      subscriber.setEmailAddress(email)
      subscriber.setKey(email)
      subscriber.setStatus(ETSubscriber.Status.UNSUBSCRIBED)
      val response = etClient.create(subscriber)

      Option(response.getResult).fold[UnsubscribeError \/ ETSubscriber]
        {\/.left(response)}
        {result => \/.right(result.getObject)}
    }

    Option(
      etClient.retrieve(classOf[ETSubscriber], s"emailAddress=$email").getResult
    ).fold(createAndUnsubscribe)(result => unsubscribe(result.getObject))
  }

  private val etClient =
    conf.exactTargetUserhelp.factory.getOrElse(throw new RuntimeException("Missing Exact Target Userhelp configuration"))
}
