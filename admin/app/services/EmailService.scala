package services

import com.amazonaws.regions.Region.getRegion
import com.amazonaws.regions.Regions.EU_WEST_1
import com.amazonaws.services.simpleemail.AmazonSimpleEmailServiceClient
import com.amazonaws.services.simpleemail.model.{Destination => EmailDestination, _}
import common.Logging
import conf.Configuration.aws.mandatoryCredentials

import scala.collection.JavaConversions._
import scala.util.Try

object EmailService extends Logging {

  def send(from: String,
           to: Seq[String],
           subject: String,
           body: String): Try[SendEmailResult] = {

    val client = new AmazonSimpleEmailServiceClient(mandatoryCredentials)
    client.setRegion(getRegion(EU_WEST_1))

    val message = new Message()
      .withSubject(new Content().withData(subject))
      .withBody(new Body().withText(new Content().withData(body)))

    val request = new SendEmailRequest()
      .withSource(from)
      .withDestination(new EmailDestination().withToAddresses(to))
      .withMessage(message)

    val response = Try(client.sendEmail(request))

    client.shutdown()

    response recoverWith {
      case e: Exception =>
        log.error(s"Email send failed: ${e.getMessage}")
        response
    }
  }

}
