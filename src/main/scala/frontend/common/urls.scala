package frontend.common

import com.gu.openplatform.contentapi.model.{ Content => ApiContent, Tag => ApiTag }

object RelativeUrl {
  def apply(c: ApiContent): String = "/%s" format c.id
  def apply(t: ApiTag): String = "/%s" format t.id
}