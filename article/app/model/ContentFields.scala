package model

import play.api.libs.json.{Json, Writes}
import play.api.mvc.RequestHeader
import views.{BodyProcessor, MainCleaner}

case class ContentFields(fields: Fields, cleanedMainBlockHtml: String, cleanedBodyHtml: String)
object ContentFields {
  def apply(article: Article)(implicit request: RequestHeader, context: ApplicationContext): ContentFields =
    new ContentFields(article.fields, MainCleaner.apply(article).body, BodyProcessor.apply(article).body)

  implicit val contentFieldsWrites: Writes[ContentFields] = Json.writes[ContentFields]
}
