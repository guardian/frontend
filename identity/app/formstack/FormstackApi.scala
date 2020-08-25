package formstack

import com.gu.identity.model.LiftJsonConfig
import conf.Configuration
import idapiclient.Response
import idapiclient.parser.JodaJsonSerializer
import idapiclient.responses.Error
import net.liftweb.json._
import utils.SafeLogging

import scala.concurrent.{ExecutionContext, Future}

class FormstackApi(httpClient: WsFormstackHttp) extends SafeLogging {

  implicit val formats = LiftJsonConfig.formats + JodaJsonSerializer

  def formstackUrl(formId: String): String = {
    val formstackUrl = Configuration.formstack.url
    s"$formstackUrl/form/$formId.json"
  }

  def checkForm(
      formstackForm: FormstackForm,
  )(implicit executionContext: ExecutionContext): Future[Response[FormstackForm]] = {

    httpClient.GET(
      formstackUrl(formstackForm.formId),
      Seq("oauth_token" -> Configuration.formstack.identityOauthToken),
    ) map {
      case FormstackHttpResponse(body, statusCode, _) => {
        statusCode match {
          case 200 => {
            logger.trace("Formstack API returned 200 for reference lookup")
            val json = parse(body)
            (for {
              formId <- (json \ "id").extractOpt[String]
              inactive <- (json \ "inactive").extractOpt[Boolean]
            } yield {
              if (formstackForm.formId == formId && !inactive) {
                logger.trace(s"Formstack reference $formId was good")
                Right(formstackForm)
              } else {
                logger.warn(
                  s"Form, '$formId' is valid but not enabled (request formId vs response formId: ${formstackForm.formId} - $formId, inactive: $inactive)",
                )
                Left(List(Error("Invalid form", "This is not a valid form", 404)))
              }
            }).getOrElse {
              logger.warn(s"200 received from Formstack for '${formstackForm.formId}', but response was invalid $body")
              Left(List(Error("Invalid Formstack API response", "")))
            }
          }
          case 405 => {
            logger.warn("405 returned while checking formstack reference")
            Left(List(Error("Invalid form reference", "Invalid form reference", 405)))
          }
          case 404 => {
            logger.warn(s"Attempted to load bad formstack reference (404) $body")
            Left(List(Error("Form not found", "Form not found", 404)))
          }
          case _ => {
            logger.warn(s"Unexpected error getting info for formstack reference. Status code $statusCode, body $body")
            Left(List(Error("Form error", "Unexpected error retrieving form info", statusCode)))
          }
        }
      }
    }
  }
}
