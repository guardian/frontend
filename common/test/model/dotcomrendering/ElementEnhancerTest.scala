package model.dotcomrendering

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.libs.json.{JsArray, JsNull, JsObject, JsValue, Json}
import model.dotcomrendering.ElementsEnhancer

class ElementEnhancerTest extends AnyFlatSpec with Matchers {

  "enhanceElement" should "add elementId and enhance ListBlockElement" in {
    val mockElement: JsObject = Json.obj(
      "_type" -> "model.dotcomrendering.pageElements.ListBlockElement",
      "items" -> Json.arr(
        Json.obj("elements" -> Json.arr(Json.obj("_type" -> "model.dotcomrendering.pageElements.TextElement"))),
      ),
    )

    val result = ElementsEnhancer.enhanceElement(mockElement)

    (result \ "elementId").asOpt[String] should not be empty
    val items = (result \ "items").as[JsArray]
    items.value.size shouldEqual 1
    val elements = (items(0) \ "elements").as[JsArray]
    elements.value.size shouldEqual 1
    (elements(0) \ "elementId").as[String] should not be empty
  }

  "enhanceElement" should "add elementId and enhance TimelineBlockElement" in {
    val mockElement: JsObject = Json.obj(
      "_type" -> "model.dotcomrendering.pageElements.TimelineBlockElement",
      "sections" -> Json.arr(
        Json.obj(
          "events" -> Json.arr(
            Json.obj("body" -> Json.arr(Json.obj("_type" -> "model.dotcomrendering.pageElements.TextElement"))),
          ),
        ),
      ),
    )

    val result = ElementsEnhancer.enhanceElement(mockElement)

    (result \ "elementId").asOpt[String] should not be empty

    val sections = (result \ "sections").as[JsArray]
    val events = (sections(0) \ "events").as[JsArray]
    val body = (events(0) \ "body").as[JsArray]
    val bodyElementIds = (body(0) \ "elementId").as[String]
    bodyElementIds should not be empty
  }

  "enhanceElement" should "return the original element with elementId for unknown types" in {
    val mockElement: JsObject = Json.obj(
      "_type" -> "model.dotcomrendering.pageElements.TextElement",
      "someField" -> "someValue",
    )

    val result = ElementsEnhancer.enhanceElement(mockElement)

    (result \ "elementId").asOpt[String] should not be empty
    (result \ "someField").asOpt[String] shouldEqual Some("someValue")
  }

  "enhanceElement" should "return JsNull if JsNull is passed" in {
    val result = ElementsEnhancer.enhanceElement(JsNull)

    result shouldEqual JsNull
  }
}
