package services

import common.{GuLogging, PekkoAsync}
import conf.Configuration
import software.amazon.awssdk.services.ses.SesAsyncClient
import software.amazon.awssdk.services.ses.model.{Destination => EmailDestination, _}
import utils.AWSv2

import java.util.concurrent.TimeoutException
import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future, Promise}
import scala.util.control.NonFatal

class EmailService(pekkoAsync: PekkoAsync) extends GuLogging {
  private lazy val client: SesAsyncClient = SesAsyncClient
    .builder()
    .credentialsProvider(AWSv2.credentials)
    .region(AWSv2.region)
    .build()

  def shutdown(): Unit = client.close()

  def send(
      from: String,
      to: Seq[String],
      cc: Seq[String] = Nil,
      subject: String,
      textBody: Option[String] = None,
      htmlBody: Option[String] = None,
  )(implicit executionContext: ExecutionContext): Future[SendEmailResponse] = {

    // Don't send emails in non-prod environments
    if (Configuration.environment.isNonProd) {
      log.debug(s"Skipping email send in non-prod: from=$from to=$to subject=$subject")
      return Future.successful(SendEmailResponse.builder().messageId("non-prod-mock").build())
    }

    log.debug(s"Sending email from $from to $to about $subject")

    val textPart: Option[Content] = textBody.map(tb => Content.builder().data(tb).build())
    val htmlPart: Option[Content] = htmlBody.map(hb => Content.builder().data(hb).build())

    val bodyBuilder = Body.builder()
    textPart.foreach(bodyBuilder.text)
    htmlPart.foreach(bodyBuilder.html)
    val body = bodyBuilder.build()

    val message = Message
      .builder()
      .subject(Content.builder().data(subject).build())
      .body(body)
      .build()

    val destinationBuilder = EmailDestination.builder().toAddresses(to: _*)
    if (cc.nonEmpty) destinationBuilder.ccAddresses(cc: _*)
    val destination = destinationBuilder.build()

    val request = SendEmailRequest
      .builder()
      .source(from)
      .destination(destination)
      .message(message)
      .build()

    val promise = Promise[SendEmailResponse]()

    pekkoAsync.after(1.minute) {
      promise.tryFailure(new TimeoutException("Timed out"))
    }

    val cf = client.sendEmail(request)
    cf.handle[Unit] { (result: SendEmailResponse, err: Throwable) =>
      if (err != null) promise.tryFailure(err)
      else promise.trySuccess(result)
      ()
    }

    promise.future.foreach { response =>
      log.debug(s"Sent message ID ${response.messageId()}")
    }
    promise.future.failed.foreach { case NonFatal(e) =>
      log.error(s"Email send failed: ${e.getMessage}")
    }

    promise.future
  }
}
