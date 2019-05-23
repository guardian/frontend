package model

import com.netaporter.uri.Uri

import scala.util.Try

object ReturnJourney {
  private val paymentFailureCodes = Set("PF", "PF1", "PF2", "PF3", "PF4", "CCX")

  sealed trait Journey {
    def applies(returnUri: Uri): Boolean
    val continueCopy: String = "Continue"
  }

  // Checks for INTCMP parameter in returnUrl after manage.theguardian redirects to signin with this parameter for payment failure flows
  // If parameter exists and is for payment failure, the 'continue' button reads 'Update your payment method'
  case object PaymentFailure extends Journey {
    override def applies(returnUri: Uri): Boolean =
      returnUri.query
        .param("INTCMP")
        .exists(paymentFailureCodes.contains)

    override val continueCopy: String = "Update your payment method"
  }

  case object Subscriptions extends Journey {
    // e.g. /subscribe/paper/checkout or /subscribe/digital/checkout
    override def applies(returnUri: Uri): Boolean =
      returnUri.host.contains("support.theguardian.com") &&
        returnUri.pathParts.head.part == "subscribe"

    override val continueCopy: String = "Back to my subscription"
  }

  case object Contributions extends Journey {
    // e.g. /au/contribute or /uk/contribute
    override def applies(returnUri: Uri): Boolean =
      returnUri.host.contains("support.theguardian.com") &&
        returnUri.pathParts.last.part == "contribute"

    override val continueCopy: String = "Back to my contribution"
  }

  case object Other extends Journey {
    override def applies(returnUri: Uri): Boolean = true
  }

  private val all = List(PaymentFailure, Subscriptions, Contributions, Other)

  def apply(returnUrl: Option[String]): Journey =
    (for {
      url <- returnUrl
      parsedUrl <- Try(Uri.parse(url)).toOption
      returnJourney <- all.find(_.applies(parsedUrl))
    } yield returnJourney).getOrElse(Other)
}
