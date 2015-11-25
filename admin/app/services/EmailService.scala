package services

import java.util.concurrent.TimeoutException

import com.amazonaws.handlers.AsyncHandler
import com.amazonaws.regions.Region.getRegion
import com.amazonaws.regions.Regions.EU_WEST_1
import com.amazonaws.services.simpleemail._
import com.amazonaws.services.simpleemail.model.{Destination => EmailDestination, _}
import common.{AkkaAsync, ExecutionContexts, Logging}
import conf.Configuration.aws.mandatoryCredentials

import scala.collection.JavaConversions._
import scala.concurrent.duration._
import scala.concurrent.{Future, Promise}
import scala.util.control.NonFatal
import scala.util.{Failure, Success}

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
           textBody: Option[String] = None,
           htmlBody: Option[String] = None): Future[SendEmailResult] = {

    log.info(s"Sending email from $from to $to about $subject")

    def withText(body: Body): Body = {
      textBody map { text =>
        body.withText(new Content().withData(text))
      } getOrElse body
    }

    def withHtml(body: Body): Body = {
      htmlBody map { html =>
        body.withHtml(new Content().withData(html))
      } getOrElse body
    }

    val body = withHtml(withText(new Body()))

    val message = new Message()
      .withSubject(new Content().withData(subject))
      .withBody(body)

    val request = new SendEmailRequest()
      .withSource(from)
      .withDestination(new EmailDestination().withToAddresses(to).withCcAddresses(cc))
      .withMessage(message)

    val futureResponse = client.sendAsyncEmail(request)

    futureResponse onSuccess {
      case response => log.info(s"Sent message ID ${response.getMessageId}")
    }

    futureResponse onFailure {
      case NonFatal(e) => log.error(s"Email send failed: ${e.getMessage}")
    }

    futureResponse
  }


  private implicit class RichEmailClient(client: AmazonSimpleEmailServiceAsyncClient) {

    def sendAsyncEmail(request: SendEmailRequest): Future[SendEmailResult] = {
      val promise = Promise[SendEmailResult]()

      AkkaAsync.after(1.minute) {
        promise.tryFailure(new TimeoutException(s"Timed out"))
      }

      val handler = new AsyncHandler[SendEmailRequest, SendEmailResult] {
        override def onSuccess(request: SendEmailRequest, result: SendEmailResult): Unit =
          promise.complete(Success(result))
        override def onError(exception: Exception): Unit =
          promise.complete(Failure(exception))
      }

      try {
        client.sendEmailAsync(request, handler)
        promise.future
      } catch {
        case NonFatal(e) => Future.failed(e)
      }
    }
  }

}
