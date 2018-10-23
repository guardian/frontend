package model.dotcomponents

import common.Edition
import conf.Configuration
import controllers.ArticlePage
import model.liveblog.BlockElement
import navigation.NavMenu
import play.api.libs.json.{JsValue, Json, Writes}
import play.api.mvc.RequestHeader

// We have introduced our own set of objects for serializing data to the DotComponents API,
// because we don't want people changing the core frontend models and as a side effect,
// making them incompatible with Dotcomponents. By having our own set of models, there's
// only one reason for change.
// exceptions: we do resuse the existing Nav & BlockElement classes right now

case class TagProperties(
    id: String,
    tagType: String,
    webTitle: String,
    twitterHandle: Option[String]
                        )
case class Tag(
    properties: TagProperties
)

case class Block(
    bodyHtml: String,
    elements: List[BlockElement]
)

case class Blocks(
    body: List[Block]
)

case class PageData(
    author: String,
    pageId: String,
    pillar: Option[String],
    ajaxUrl: String,
    webPublicationDate: Long,
    section: Option[String],
    headline: String,
    webTitle: String,
    byline: String,
    contentId: Option[String],
    authorIds: Option[String],
    keywordIds: Option[String],
    toneIds: Option[String],
    seriesId: Option[String],
    isHosted: Boolean,
    beaconUrl: String,
    edition: String,
    contentType: Option[String],
    commissioningDesks: Option[String]
)

case class Config(
    isImmersive: Boolean,
    page: PageData,
    nav: NavMenu
)

case class ContentFields(
    standfirst: Option[String],
    main: String,
    body: String,
    blocks: Blocks
)

case class DotcomponentsDataModel(
    contentFields: ContentFields,
    config: Config,
    tags: List[Tag],
    version: Int
)

object Block {
  implicit val blockElementWrites: Writes[BlockElement] = Json.writes[BlockElement]
  implicit val writes = Json.writes[Block]
}

object Blocks {
  implicit val writes = Json.writes[Blocks]
}

object ContentFields {
  implicit val writes = Json.writes[ContentFields]
}

object TagProperties {
  implicit val writes = Json.writes[TagProperties]
}

object Tag {
  implicit val writes = Json.writes[Tag]
}

object PageData {
  implicit val writes = Json.writes[PageData]
}

object Config {
  implicit val writes = Json.writes[Config]
}

object DotcomponentsDataModel {

  val VERSION = 1

  def fromArticle(articlePage: ArticlePage, request: RequestHeader): DotcomponentsDataModel = {

    val article = articlePage.article

    val blocks: List[Block] = article.blocks match {
      case Some(bs) => bs.body.map(bb => Block(bb.bodyHtml, bb.elements.toList)).toList
      case None => List()
    }

    val dcBlocks = Blocks(blocks)

    val contentFields = ContentFields(
      article.fields.standfirst,
      article.fields.main,
      article.fields.body,
      dcBlocks
    )

    val jsConfig = (k: String) => articlePage.getJavascriptConfig.get(k).map(_.as[String])

    val pageData = PageData(
      article.tags.contributors.map(_.name).mkString(","),
      article.metadata.id,
      article.metadata.pillar.map(_.toString),
      Configuration.ajax.url,
      article.trail.webPublicationDate.getMillis,
      article.metadata.section.map(_.value),
      article.trail.headline,
      article.metadata.webTitle,
      article.trail.byline.getOrElse(""),
      jsConfig("contentId"),   // source: content.scala
      jsConfig("authorIds"),   // source: meta.scala
      jsConfig("keywordIds"),  // source: tags.scala and meta.scala
      jsConfig("toneIds"),     // source: meta.scala
      jsConfig("seriesId"),    // source: content.scala
      article.metadata.isHosted,
      Configuration.debug.beaconUrl,
      Edition(request).displayName,
      jsConfig("contentType"),
      jsConfig("commissioningDesks")
    )

    val tags = article.tags.tags.map(
      t => Tag(
        TagProperties(
          t.id,
          t.properties.tagType,
          t.properties.webTitle,
          t.properties.twitterHandle
        )
      )
    )

    val navMenu = NavMenu(articlePage, Edition(request))(request)

    val config = Config(
      article.isImmersive,
      pageData,
      navMenu
    )

    DotcomponentsDataModel(
      contentFields,
      config,
      tags,
      VERSION
    )

  }

  def toJsonString(model: DotcomponentsDataModel): String = {

    // make what we have look a bit closer to what dotcomponents currently expects

    implicit val DotComponentsDataModelWrites = new Writes[DotcomponentsDataModel] {
      def writes(model: DotcomponentsDataModel) = Json.obj(
        "config" -> model.config,
        "contentFields" -> Json.obj(
          "fields" -> model.contentFields
        ),
        "tags" -> Json.obj(
          "tags" -> model.tags
        ),
        "version" -> model.version
      )
    }

    Json.prettyPrint(Json.toJson(model))

  }

}
