package services

import com.gu.facia.client.models.CollectionConfig
import layout.{Front, CollectionEssentials, FaciaContainer}
import model.Tag
import org.joda.time.DateTime
import slices.{Fixed, FixedContainers}
import model.Snap

object CustomIndexPageContainers {
  private def makeJsonSnap(id: String, title: String, link: String, endpoint: String) = new Snap(
    id,
    Nil,
    DateTime.now(),
    None
  ) {
    override lazy val href: Option[String] = Some(link)
    override lazy val snapType: Option[String] = Some("json.html")
    override lazy val snapUri: Option[String] = Some(endpoint)
  }

  def fromIndexPage(indexPage: IndexPage) = {
    indexPage.page match {
      case tag: Tag if tag.isFootballTeam =>
        Some(FaciaContainer(
          1,
          Fixed(FixedContainers.footballTeamFixtures),
          CollectionConfigWithId(
            "football-team-fixtures",
            CollectionConfig.emptyConfig
          ),
          CollectionEssentials.fromTrails(Seq(
            makeJsonSnap("fixtures", "Fixtures", s"/${tag.id}/fixtures", ""),
            makeJsonSnap("results", "Results", s"/${tag.id}/results", ""),
            makeJsonSnap("table", "Table", s"/football/tables", "")
          ))
        ))

      case _ => None
    }
  }

  def merge(front: Front, container: FaciaContainer) = {
    val (preceding, succeeding) = front.containers splitAt container.index

    Front.containers.set(
      front,
      preceding ++
        Seq(FaciaContainer.index.set(container, preceding.length)) ++
        succeeding.map(FaciaContainer.index.modifyF(_ + 1))
    )
  }
}

