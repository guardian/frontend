package model

import play.api.libs.json._
import model.pressed.PressedStory


sealed trait Pillar {
  val name: String
}
object Pillar {

  object News extends Pillar { override val name = "News" }
  object Opinion extends Pillar { override val name = "Opinion" }
  object Sport extends Pillar { override val name = "Sport" }
  object Arts extends Pillar { override val name = "Arts" }
  object Lifestyle extends Pillar { override val name = "Lifestyle" }

  implicit val format: Format[Pillar] = new Format[Pillar] {
    override def reads(json: JsValue): JsResult[Pillar] = json match {
      case JsString(News.name) => JsSuccess(News)
      case JsString(Opinion.name) => JsSuccess(Opinion)
      case JsString(Sport.name) => JsSuccess(Sport)
      case JsString(Arts.name) => JsSuccess(Arts)
      case JsString(Lifestyle.name) => JsSuccess(Lifestyle)
      case _ => JsError(s"Unknown pillar: '$json'")
    }

    override def writes(o: Pillar): JsValue = JsString(o.name)
  }

   def pillarFromPressedContent(storyContent: Option[PressedStory]): Pillar = {
     storyContent.flatMap(_.metadata.pillar).getOrElse(Pillar.News)
   }
}

object Pillars {

  def pillarForSection(sectionId: SectionId): Option[Pillar] = sectionToPillar.get(sectionId)

  private val sectionToPillar: Map[SectionId, Pillar] = Map(
    SectionId("artanddesign") -> Pillar.Arts,
    SectionId("australia-news") -> Pillar.News,
    SectionId("better-business") -> Pillar.News,
    SectionId("books") -> Pillar.Arts,
    SectionId("business") -> Pillar.News,
    SectionId("business-to-business") -> Pillar.News,
    SectionId("cardiff") -> Pillar.News,
    SectionId("childrens-books-site") -> Pillar.Arts,
    SectionId("cities") -> Pillar.News,
    SectionId("commentisfree") -> Pillar.Opinion,
    SectionId("community") -> Pillar.News,
    SectionId("crosswords") -> Pillar.Lifestyle,
    SectionId("culture") -> Pillar.News,
    SectionId("culture-network") -> Pillar.News,
    SectionId("culture-professionals-network") -> Pillar.News,
    SectionId("edinburgh") -> Pillar.News,
    SectionId("education") -> Pillar.News,
    SectionId("enterprise-network") -> Pillar.News,
    SectionId("environment") -> Pillar.News,
    SectionId("extra") -> Pillar.News,
    SectionId("fashion") -> Pillar.Lifestyle,
    SectionId("film") -> Pillar.Arts,
    SectionId("football") -> Pillar.Sport,
    SectionId("global-development") -> Pillar.News,
    SectionId("global-development-professionals-network") -> Pillar.News,
    SectionId("government-computing-network") -> Pillar.News,
    SectionId("guardian-professional") -> Pillar.News,
    SectionId("healthcare-network") -> Pillar.News,
    SectionId("help") -> Pillar.News,
    SectionId("higher-education-network") -> Pillar.News,
    SectionId("housing-network") -> Pillar.News,
    SectionId("inequality") -> Pillar.News,
    SectionId("info") -> Pillar.News,
    SectionId("jobsadvice") -> Pillar.News,
    SectionId("katine") -> Pillar.News,
    SectionId("law") -> Pillar.News,
    SectionId("leeds") -> Pillar.News,
    SectionId("lifeandstyle") -> Pillar.Lifestyle,
    SectionId("local") -> Pillar.News,
    SectionId("local-government-network") -> Pillar.News,
    SectionId("media") -> Pillar.News,
    SectionId("media-network") -> Pillar.News,
    SectionId("membership") -> Pillar.News,
    SectionId("money") -> Pillar.Lifestyle,
    SectionId("music") -> Pillar.Arts,
    SectionId("news") -> Pillar.News,
    SectionId("politics") -> Pillar.News,
    SectionId("public-leaders-network") -> Pillar.News,
    SectionId("science") -> Pillar.News,
    SectionId("search") -> Pillar.News,
    SectionId("small-business-network") -> Pillar.News,
    SectionId("social-care-network") -> Pillar.News,
    SectionId("social-enterprise-network") -> Pillar.News,
    SectionId("society") -> Pillar.News,
    SectionId("society-professionals") -> Pillar.News,
    SectionId("sport") -> Pillar.Sport,
    SectionId("stage") -> Pillar.Arts,
    SectionId("teacher-network") -> Pillar.News,
    SectionId("technology") -> Pillar.News,
    SectionId("theguardian") -> Pillar.News,
    SectionId("theobserver") -> Pillar.News,
    SectionId("travel") -> Pillar.Lifestyle,
    SectionId("travel/offers") -> Pillar.Lifestyle,
    SectionId("tv-and-radio") -> Pillar.Arts,
    SectionId("uk-news") -> Pillar.News,
    SectionId("us-news") -> Pillar.News,
    SectionId("voluntary-sector-network") -> Pillar.News,
    SectionId("weather") -> Pillar.News,
    SectionId("women-in-leadership") -> Pillar.News,
    SectionId("world") -> Pillar.News
  )


}
