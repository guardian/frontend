package services

import java.util.concurrent.TimeoutException

import com.amazonaws.handlers.AsyncHandler
import com.amazonaws.services.simpleemail._
import com.amazonaws.services.simpleemail.model.{Destination => EmailDestination, _}
import common.{AkkaAsync, GuLogging}
import conf.Configuration.aws.mandatoryCredentials

import scala.jdk.CollectionConverters._
import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future, Promise}
import scala.util.control.NonFatal
import scala.util.{Failure, Success}

class EmailService(akkaAsync: AkkaAsync) extends GuLogging {

  private lazy val client: AmazonSimpleEmailServiceAsync = AmazonSimpleEmailServiceAsyncClient
    .asyncBuilder()
    .withCredentials(mandatoryCredentials)
    .withRegion(conf.Configuration.aws.region)
    .build()

  val sendAsync = client.sendAsyncEmail(akkaAsync) _

  def shutdown(): Unit = client.shutdown()

  def send(
      from: String,
      to: Seq[String],
      cc: Seq[String] = Nil,
      subject: String,
      textBody: Option[String] = None,
      htmlBody: Option[String] = None,
  )(implicit executionContext: ExecutionContext): Future[SendEmailResult] = {

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
      .withDestination(new EmailDestination().withToAddresses(to.asJava).withCcAddresses(cc.asJava))
      .withMessage(message)

    val futureResponse = sendAsync(request)

    futureResponse.foreach { response =>
      log.info(s"Sent message ID ${response.getMessageId}")
    }

    futureResponse.failed.foreach {
      case NonFatal(e) => log.error(s"Email send failed: ${e.getMessage}")
    }

    futureResponse
  }

  private implicit class RichEmailClient(client: AmazonSimpleEmailServiceAsync) {

    def sendAsyncEmail(akkaAsync: AkkaAsync)(request: SendEmailRequest): Future[SendEmailResult] = {
      val promise = Promise[SendEmailResult]()

      akkaAsync.after(1.minute) {
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
