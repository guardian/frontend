package services

import java.util.concurrent.{Future => JFuture}

import com.amazonaws.regions.Region.getRegion
import com.amazonaws.regions.Regions.EU_WEST_1
import com.amazonaws.services.simpleemail._
import com.amazonaws.services.simpleemail.model.{Destination => EmailDestination, _}
import common.{ExecutionContexts, Logging}
import conf.Configuration.aws.mandatoryCredentials

import scala.collection.JavaConversions._
import scala.concurrent.{Future, Promise}
import scala.util.Try

object EmailService extends ExecutionContexts with Logging {

  private lazy val client = {
    val cl = new AmazonSimpleEmailServiceAsyncClient(mandatoryCredentials)
    cl.setRegion(getRegion(EU_WEST_1))
    cl
  }

  def shutdown(): Unit = client.shutdown()

  def send(from: String,
           to: Seq[String],
           cc: Seq[String] = Nil,
           subject: String,
           body: String): Future[SendEmailResult] = {

    val message = new Message()
      .withSubject(new Content().withData(subject))
      .withBody(new Body().withText(new Content().withData(body)))

    val request = new SendEmailRequest()
      .withSource(from)
      .withDestination(new EmailDestination().withToAddresses(to).withCcAddresses(cc))
      .withMessage(message)

    val futureResponse = javaFuture2ScalaFuture(client.sendEmailAsync(request))

    futureResponse recoverWith {
      case e: Exception =>
        val cause = e.getCause
        log.error(s"Email send failed: ${cause.getMessage}")
        Future.failed(cause)
    }
  }

  /*
   http://stackoverflow.com/questions/17215421/scala-concurrent-future-wrapper-for-java-util
   -concurrent-future
   */
  private def javaFuture2ScalaFuture[T](jFuture: JFuture[T]): Future[T] = {
    val promise = Promise[T]()
    new Thread(new Runnable {
      def run() {
        promise.complete(Try(jFuture.get))
      }
    }).start()
    promise.future
  }

}
