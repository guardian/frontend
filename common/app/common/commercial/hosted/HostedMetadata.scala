package common.commercial.hosted

import com.gu.contentapi.client.model.v1.{Content, TagType}
import conf.Configuration.site
import model.{MetaData, SectionSummary}
import play.api.libs.json.{JsBoolean, JsString}

object HostedMetadata {

  def fromContent(item: Content): MetaData = {

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
      webTitle = item.webTitle,
      url = Some(s"/${item.id}"),
      description = Some(description),
      contentType = contentType,
      iosType = Some(contentType),
      isHosted = true,
      javascriptConfigOverrides = Map(
        "isHosted" -> JsBoolean(true),
        "toneIds" -> JsString(toneIds),
        "tones" -> JsString(toneNames),
        "shortUrl" -> JsString(item.fields.flatMap(_.shortUrl).getOrElse(""))
      ),
      opengraphPropertiesOverrides = Map(
        "og:url" -> s"${site.host}/${item.id}",
        "og:title" -> item.webTitle,
        "og:description" -> s"ADVERTISER CONTENT FROM ${owner.toUpperCase} HOSTED BY THE GUARDIAN | $description",
        "fb:app_id" -> "180444840287"
      )
    )
  }
}
