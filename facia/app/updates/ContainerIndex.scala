package updates

import model.{Config, Collection, FaciaPage}
import org.joda.time.DateTime
import play.api.libs.json.Json
import slices.{DynamicFast, DynamicContainers, FixedContainers}
import views.support.TemplateDeduping

object ContainerIndexItem {
  implicit val jsonWrites = Json.writes[ContainerIndexItem]
}

case class ContainerIndexItem(
  id: String,
  visibleOnMobile: Boolean
)

object ContainerIndex {
  implicit val jsonWrites = Json.writes[ContainerIndex]
}

case class ContainerIndex(
  updated: DateTime,
  items: Seq[ContainerIndexItem]
)

object FrontIndex {
  implicit val jsonWrites = Json.writes[FrontIndex]

  def fromFaciaPage(faciaPage: FaciaPage): FrontIndex = {
    val templateDeduping = new TemplateDeduping

    def numberOfItemsToConsume(config: Config, collection: Collection) = {
      FixedContainers.unapply(config.collectionType) match {
        case Some(definition) =>

        case None => DynamicContainers(config.collectionType, )
      }
    }

    faciaPage.collections map { case (config, collection) =>
      config.
    }
  }
}

case class FrontIndex(containers: Seq[ContainerIndex])
