package model.dotcomrendering

import play.api.libs.json.{Json, _}

/** The `ElementsEnhancer` object provides functions to enhance JSON representations of elements used in Dotcom
  * Rendering. It adds unique identifiers to elements, as expected by the DCR schemas. More information on the decision
  * for this can be found in PageElement-Identifiers.md or by searching for "03feb394-a17d-4430-8384-edd1891e0d01"
  */

object ElementsEnhancer {

  def enhanceElement(element: JsValue): JsValue = {
    // Check if the element is a JsObject before proceeding
    element match {
      case obj: JsObject =>
        val elementWithId = obj ++ Json.obj("elementId" -> java.util.UUID.randomUUID.toString)
        val elementType = elementWithId.value("_type").as[String]

        elementType match {
          case "model.dotcomrendering.pageElements.ListBlockElement"     => enhanceListBlockElement(elementWithId)
          case "model.dotcomrendering.pageElements.TimelineBlockElement" => enhanceTimelineBlockElement(elementWithId)
          case _                                                         => elementWithId;
        }
      case _ => element
    }
  }
  def enhanceListBlockElement(elementWithId: JsObject): JsObject = {
    val listItems = elementWithId.value("items").as[JsArray]
    val listItemsWithIds = listItems.value.map { item =>
      val obj = item.as[JsObject]
      obj ++ Json.obj("elements" -> enhanceElements(obj.value("elements")))
    }
    elementWithId ++ Json.obj("items" -> listItemsWithIds)
  }

  def enhanceTimelineBlockElement(element: JsObject): JsObject = {
    val sectionsList = element.value("sections").as[List[JsObject]]
    val sectionsListWithIds = sectionsList.map { section =>
      val eventsList = section.value("events").as[List[JsObject]]
      val eventsListWithIds = eventsList.map { event =>
        val bodyElementsWithIds = enhanceElements(event.value("body").as[JsArray])
        event.as[JsObject] ++ Json.obj("body" -> bodyElementsWithIds)
      }
      section.as[JsObject] ++ Json.obj("events" -> eventsListWithIds)
    }
    element ++ Json.obj("sections" -> sectionsListWithIds)
  }

  def enhanceElements(elements: JsValue): IndexedSeq[JsValue] = {
    elements.as[JsArray].value.map(element => enhanceElement(element))
  }.toIndexedSeq

  def enhanceObjectWithElements(obj: JsValue): JsValue = {
    obj.asOpt[JsObject] match {
      case Some(o) =>
        val elements = o.value("elements")
        o ++ Json.obj("elements" -> enhanceElements(elements))
      case None => obj
    }
  }

  def enhanceObjectsWithElements(objs: JsValue): IndexedSeq[JsValue] = {
    objs.as[JsArray].value.map(obj => enhanceObjectWithElements(obj))
  }.toIndexedSeq

  def enhanceBlocks(obj: JsObject): JsObject = {
    obj ++
      Json.obj("blocks" -> enhanceObjectsWithElements(obj.value("blocks")))
  }

  def enhanceDcrObject(obj: JsObject): JsObject = {
    obj ++
      Json.obj("blocks" -> enhanceObjectsWithElements(obj.value("blocks"))) ++
      Json.obj("mainMediaElements" -> enhanceElements(obj.value("mainMediaElements"))) ++
      Json.obj("keyEvents" -> enhanceObjectsWithElements(obj.value("keyEvents"))) ++
      Json.obj("pinnedPost" -> enhanceObjectWithElements(obj.value("pinnedPost"))) ++
      Json.obj("promotedNewsletter" -> obj.value("promotedNewsletter")) ++
      Json.obj("audioArticleImage" -> enhanceElement(obj.value("audioArticleImage"))) ++
      Json.obj("trailPicture" -> enhanceElement(obj.value("trailPicture")))
  }
}
