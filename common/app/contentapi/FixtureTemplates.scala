package contentapi

import com.gu.contentapi.client.model.v1.{
  Asset => ApiAsset,
  Content => ApiContent,
  Element => ApiElement,
  Tag => ApiTag,
  AssetType,
  TagType,
  ElementType,
}

/** Quite often we base tests on pieces of content from Content API, where we only care that a few of the fields are
  * set.
  *
  * This allows us to easily construct such fixtures.
  */
object FixtureTemplates {
  val emptyApiContent: ApiContent = ApiContent(
    id = "",
    sectionId = None,
    sectionName = None,
    webPublicationDate = None,
    webTitle = "",
    webUrl = "",
    apiUrl = "",
    elements = None,
  )

  val emptyTag: ApiTag = ApiTag(
    "",
    TagType.Keyword,
    None,
    None,
    "",
    "",
    "",
  )

  val emptyElement: ApiElement = ApiElement(
    "",
    "",
    ElementType.Text,
    None,
    Nil,
  )

  val emptyAsset: ApiAsset = ApiAsset(
    AssetType.Image,
    None,
    None,
    None,
  )
}
