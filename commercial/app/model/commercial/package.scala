package model

import play.api.data.validation.ValidationError
import play.api.libs.json._

package object commercial {

  object OptString {
    def apply(s: String): Option[String] = Option(s) filter (_.trim.nonEmpty)
  }

  object transform {
    implicit def readsSeq[A](implicit readsA: Reads[A]): Reads[Seq[A]] = new Reads[Seq[A]] {

      /*
          External feeds (Merchandise and Events) can sometimes contain malformed elements.
          We want to be able to ignore these elements whilst still reading the remaining well-formed elements.
          Let's keep the baby if not the bathwater.
       */
      override def reads(json: JsValue): JsResult[Seq[A]] = {
        json match {
          case JsArray(jsValues) => JsSuccess(jsValues.flatMap(_.asOpt[A]))
          case _ => JsError(Seq(JsPath() -> Seq(ValidationError(s"Expected JsArray but received: ${json}"))))
        }
      }
    }
  }
}
