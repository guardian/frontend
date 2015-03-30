package services

import com.amazonaws.handlers.AsyncHandler
import com.amazonaws.regions.Region.getRegion
import com.amazonaws.regions.Regions.EU_WEST_1
import com.amazonaws.services.simpleemail._
import com.amazonaws.services.simpleemail.model.{Destination => EmailDestination, _}
import common.{ExecutionContexts, Logging}
import conf.Configuration.aws.mandatoryCredentials

import scala.collection.JavaConversions._
import scala.concurrent.{Future, Promise}
import scala.language.implicitConversions
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

    futureResponse map { response =>
      log.info(s"Sent message ID ${response.getMessageId}")
      response
    } recoverWith {
      case e: Exception =>
        val cause = e.getCause
        log.error(s"Email send failed: ${cause.getMessage}")
        Future.failed(cause)
    }
  }


  private implicit class RichEmailClient(client: AmazonSimpleEmailServiceAsyncClient) {

    def sendAsyncEmail(request: SendEmailRequest): Future[SendEmailResult] = {
      val promise = Promise[SendEmailResult]()

      val handler = new AsyncHandler[SendEmailRequest, SendEmailResult] {
        override def onSuccess(request: SendEmailRequest, result: SendEmailResult): Unit =
          promise.complete(Success(result))
        override def onError(exception: Exception): Unit =
          promise.complete(Failure(exception))
      }

      client.sendEmailAsync(request, handler)

      promise.future
    }
  }

}
