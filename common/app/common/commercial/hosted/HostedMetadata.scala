package common.commercial.hosted

import com.gu.contentapi.client.model.v1.{Content, TagType}
import model.{MetaData, SectionSummary}
import play.api.libs.json.{JsBoolean, JsString}

object HostedMetadata {

  def fromContent(item: Content): MetaData = {

    val url = s"/${item.id}"
    val title = item.webTitle
    val contentType = item.`type`.name
    val sectionId = item.sectionId
    val toneTags = item.tags.filter(_.`type` == TagType.Tone)
    val toneIds = toneTags.map(_.id).mkString(",")
    val toneNames = toneTags.map(_.webTitle).mkString(",")
    val description = item.fields.flatMap(_.trailText).getOrElse("")
    val owner = {
      val hostedTag = item.tags.find(_.paidContentType.contains("HostedContent"))
      val sponsorship = hostedTag.flatMap(_.activeSponsorships).map(_.head)
      sponsorship.map(_.sponsorName).getOrElse("")
    }

    MetaData.make(
      id = item.id,
      section = sectionId map SectionSummary.fromId,
      webTitle = title,
      analyticsName = s"GFE:${sectionId.getOrElse("")}:$contentType:$title",
      url = Some(url),
      description = Some(description),
      contentType = contentType,
      iosType = Some(contentType),
      javascriptConfigOverrides = Map(
        "isHosted" -> JsBoolean(true),
        "toneIds" -> JsString(toneIds),
        "tones" -> JsString(toneNames)
      ),
      opengraphPropertiesOverrides = Map(
        "og:url" -> url,
        "og:title" -> title,
        "og:description" -> s"ADVERTISER CONTENT FROM ${owner.toUpperCase} HOSTED BY THE GUARDIAN | $description",
        "fb:app_id" -> "180444840287"
      )
    )
  }
}
