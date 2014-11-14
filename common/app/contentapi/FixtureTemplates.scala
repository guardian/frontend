package contentapi

import com.gu.contentapi.client.model.{Content => ApiContent}

/** Quite often we base tests on pieces of content from Content API, where we only care that a few of the fields are
  * set.
  *
  * This allows us to easily construct such fixtures.
  */
object FixtureTemplates {
  val emptyApiContent = ApiContent(
    "",
    None,
    None,
    None,
    "",
    "",
    "",
    None,
    elements = None
  )
}
