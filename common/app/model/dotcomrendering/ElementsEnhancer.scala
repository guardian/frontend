package model.dotcomrendering

import play.api.libs.json.{Json, _}

object ElementsEnhancer {

  // Note:
  //     In the file PageElement-Identifiers.md you will find a discussion of identifiers used by PageElements
  //     Also look for "03feb394-a17d-4430-8384-edd1891e0d01"

  def enhanceElement(element: JsValue): JsValue = {
    element.as[JsObject] ++ Json.obj("elementId" -> java.util.UUID.randomUUID.toString)
  }

  def enhanceElements(elements: JsValue): IndexedSeq[JsValue] = {
    elements.as[JsArray].value.map(element => enhanceElement(element))
  }

  def enhanceObjectWithElementsAtDepth1(obj: JsValue): JsValue = {
    obj.asOpt[JsObject] match {
      case Some(o) =>
        val elements = o.value("elements")
        o ++ Json.obj("elements" -> enhanceElements(elements))
      case None => obj
    }
  }

  def enhanceObjectsWithElementsAtDepth1(objs: JsValue): IndexedSeq[JsValue] = {
    objs.as[JsArray].value.map(obj => enhanceObjectWithElementsAtDepth1(obj))
  }

  def enhanceBlocks(obj: JsObject): JsObject = {
    obj ++
      Json.obj("blocks" -> enhanceObjectsWithElementsAtDepth1(obj.value("blocks")))
  }

  def enhanceDcrObject(obj: JsObject): JsObject = {
    obj ++
      Json.obj("blocks" -> enhanceObjectsWithElementsAtDepth1(obj.value("blocks"))) ++
      Json.obj("mainMediaElements" -> enhanceElements(obj.value("mainMediaElements"))) ++
      Json.obj("keyEvents" -> enhanceObjectsWithElementsAtDepth1(obj.value("keyEvents"))) ++
      Json.obj("pinnedPost" -> enhanceObjectWithElementsAtDepth1(obj.value("pinnedPost"))) ++
      Json.obj("promotedNewsletter" -> obj.value("promotedNewsletter"))
  }
}
