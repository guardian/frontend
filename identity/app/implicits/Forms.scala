package implicits

import common.Crypto
import play.api.data.{Form, FormError}
import play.api.libs.json._
import play.api.mvc.{Flash, RequestHeader}
import play.api.i18n.I18nSupport
import play.api.libs.crypto.CryptoConfig

trait Forms extends I18nSupport {

  val cryptoConfig: CryptoConfig
  private val formKey = "form-data"

  private implicit val errorReads = new Reads[Seq[FormError]]{
    override def reads(js: JsValue): JsResult[Seq[FormError]] = Json.fromJson[Map[String, Seq[String]]](js).map{
      _.toSeq.map{ case (k, v) => FormError(k, v) }
    }
  }

  implicit class Form2Cookie[A](form: Form[A]) {

    def bindFromFlash(implicit request: RequestHeader): Option[Form[A]] = {

      val errors = request.flash.get(s"$formKey-errors")
        .map(encryptedValue => Crypto.decryptAES(encryptedValue, cryptoConfig.secret))
        .map(Json.parse)
        .map(_.as[Seq[FormError]])
        .getOrElse(Nil)

      request.flash.get(formKey).map(encryptedValue => Crypto.decryptAES(encryptedValue, cryptoConfig.secret)).map(Json.parse).map { data =>
        errors.foldLeft(form.bind(data)) { (formFold, error) => formFold.withError(error) }
      }
    }

    def toFlash: Flash = {
      val formJson: String = JsObject(form.data.toSeq.map { case (k, v) => k -> JsString(v)}).toString()
      Flash(Map(
        formKey -> Crypto.encryptAES(formJson, cryptoConfig.secret),
        s"$formKey-errors" -> Crypto.encryptAES(form.errorsAsJson.toString(), cryptoConfig.secret)
      ))
    }

    def toFlashWithDataDiscarded: Flash = {
      Flash(Map())
    }
 }
}
