package contentapi

import com.gu.contentapi.client.model.{Content => ApiContent}

object Helpers {
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
