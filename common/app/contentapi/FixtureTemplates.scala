package contentapi

import com.gu.contentapi.client.model.{Asset => ApiAsset, Content => ApiContent, Element => ApiElement, Tag => ApiTag}

/** Quite often we base tests on pieces of content from Content API, where we only care that a few of the fields are
  * set.
  *
  * This allows us to easily construct such fixtures.
  */
object FixtureTemplates {
  val emptyApiContent = ApiContent(
    id = "",
    sectionId = None,
    sectionName = None,
    webPublicationDateOption = None,
    webTitle = "",
    webUrl = "",
    apiUrl = "",
    elements = None
  )

  val emptyTag = ApiTag(
    "",
    "",
    None,
    None,
    "",
    "",
    ""
  )

  val emptyElement = ApiElement(
    "",
    "",
    "",
    None,
    Nil
  )

  val emptyAsset = ApiAsset(
    "",
    None,
    None,
    Map.empty
  )
}
