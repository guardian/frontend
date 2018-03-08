package model

import play.api.libs.json.{Json, Writes}
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.{BodyCleaner, MainCleaner}

case class ContentFields(fields: Fields, cleanedMainBlockHtml: String, cleanedBodyHtml: String)
object ContentFields {
  def apply(article: Article, isAmp: Boolean = false)(implicit request: RequestHeader, context: ApplicationContext): ContentFields =
    new ContentFields(article.fields, MainCleaner.apply(article, amp = isAmp).body, BodyCleaner.apply(article, amp = isAmp).body)

  implicit val contentFieldsWrites: Writes[ContentFields] = Json.writes[ContentFields]
}
