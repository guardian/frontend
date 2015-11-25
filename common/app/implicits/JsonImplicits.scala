package implicits

import com.amazonaws.services.dynamodbv2.model.AttributeValue
import play.api.libs.json._
import scala.collection.JavaConverters._

object JsonImplicits {
  implicit class FoldableJsValue(jsValue: JsValue) {
    def fold[B](jsNull: => B,
                jsBool: Boolean => B,
                jsNumber: BigDecimal => B,
                jsString: String => B,
                jsArray: Seq[JsValue] => B,
                jsObject: Seq[(String, JsValue)] => B,
                jsUndefined: => B): B = jsValue match {
      case JsNull => jsNull
      case JsBoolean(b) => jsBool(b)
      case JsNumber(n) => jsNumber(n)
      case JsString(s) => jsString(s)
      case JsArray(a) => jsArray(a)
      case JsObject(o) => jsObject(o.toSeq)
      case JsUndefined() => jsUndefined
    }
  }

  implicit class JsValueToAttributeValue(jsValue: JsValue) {
    private def jsNull: AttributeValue = new AttributeValue().withNULL(true)
    private def jsBool(bool: Boolean): AttributeValue = new AttributeValue().withBOOL(bool)
    private def jsNumber(decimal: BigDecimal): AttributeValue = new AttributeValue().withN(decimal.toLongExact.toString)
    private def jsString(string: String): AttributeValue = new AttributeValue().withS(string)
    private def jsArray(seq: Seq[JsValue]): AttributeValue = new AttributeValue().withL(seq.map(_.fold(jsNull, jsBool, jsNumber, jsString, jsArray, jsObject, jsUndefined)): _*)
    private def jsObject(obj: Seq[(String, JsValue)]): AttributeValue = new AttributeValue().withM(
      obj.map { case (s, json) => s -> json.fold(jsNull, jsBool, jsNumber, jsString, jsArray, jsObject, jsUndefined)}.toMap.asJava)
    private def jsUndefined: AttributeValue = new AttributeValue().withNULL(true)

    def toAttributeValue: AttributeValue = {
      jsValue.fold(jsNull, jsBool, jsNumber, jsString, jsArray, jsObject, jsUndefined)
    }
  }
}
