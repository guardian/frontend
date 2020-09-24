package implicits

import common.Crypto
import play.api.data.{Form, FormError}
import play.api.http.HttpConfiguration
import play.api.libs.json._
import play.api.mvc.{Flash, RequestHeader}
import play.api.i18n.{I18nSupport, MessagesProvider}

trait Forms extends I18nSupport {

  val httpConfiguration: HttpConfiguration
  private val formKey = "form-data"

  private implicit val errorReads = new Reads[Seq[FormError]] {
    override def reads(js: JsValue): JsResult[Seq[FormError]] =
      Json.fromJson[Map[String, Seq[String]]](js).map {
        _.toSeq.map { case (k, v) => FormError(k, v) }
      }
  }

  implicit class Form2Cookie[A](form: Form[A]) {

    def bindFromFlash(implicit request: RequestHeader): Option[Form[A]] = {

      val errors = request.flash
        .get(s"$formKey-errors")
        .map(encryptedValue => Crypto.decryptAES(encryptedValue, httpConfiguration.secret.secret))
        .map(Json.parse)
        .map(_.as[Seq[FormError]])
        .getOrElse(Nil)

      request.flash
        .get(formKey)
        .map(encryptedValue => Crypto.decryptAES(encryptedValue, httpConfiguration.secret.secret))
        .map(Json.parse)
        .map { data =>
          errors.foldLeft(form.bind(data)) { (formFold, error) => formFold.withError(error) }
        }
    }

    def toFlash(implicit messagesProvider: MessagesProvider): Flash = {
      val formJson: String = JsObject(form.data.toSeq.map { case (k, v) => k -> JsString(v) }).toString()
      Flash(
        Map(
          formKey -> Crypto.encryptAES(formJson, httpConfiguration.secret.secret),
          s"$formKey-errors" -> Crypto.encryptAES(form.errorsAsJson.toString(), httpConfiguration.secret.secret),
        ),
      )
    }

    def toFlashWithDataDiscarded: Flash = {
      Flash(Map())
    }
  }

  implicit val formErrorWrites = new Writes[FormError] {
    def writes(formError: FormError) =
      Json.obj(
        "key" -> formError.key,
        "message" -> formError.message,
      )
  }
}
