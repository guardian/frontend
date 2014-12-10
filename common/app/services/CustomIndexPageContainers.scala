package services

import com.gu.facia.client.models.CollectionConfig
import layout.{Front, CollectionEssentials, FaciaContainer}
import model.Tag
import org.joda.time.DateTime
import slices.{Fixed, FixedContainers}
import model.Snap
import Front.containers
import FaciaContainer.index

object CustomIndexPageContainers {
  private def makeJsonSnap(id: String, snapTitle: String, link: String, endpoint: String) = new Snap(
    id,
    Nil,
    DateTime.now(),
    None
  ) {
    override lazy val url: String = link
    override lazy val href: Option[String] = Some(link)
    override lazy val snapType: Option[String] = Some("json.html")
    override lazy val snapUri: Option[String] = Some(endpoint)
    override lazy val headline: String = snapTitle
  }

  def fromIndexPage(indexPage: IndexPage) = {
    indexPage.page match {
      case tag: Tag if tag.isFootballTeam =>
        Some(FaciaContainer(
          1,
          Fixed(FixedContainers.footballTeamFixtures),
          CollectionConfigWithId(
            "football-team-fixtures",
            CollectionConfig.emptyConfig.copy(displayName = Some("Fixtures and results"))
          ),
          CollectionEssentials.fromTrails(Seq(
            makeJsonSnap("fixtures", "Fixtures", s"/${tag.id}/fixtures", s"/${tag.id}/fixtures.json"),
            makeJsonSnap("results", "Results", s"/${tag.id}/results", s"/${tag.id}/results.json"),
            makeJsonSnap("table", "Table", s"/football/tables", "")
          ))
        ).copy(
          customClasses = Some(Seq("fc-container--tag")),
          hideToggle = true
        ))

      case _ => None
    }
  }

  def merge(front: Front, container: FaciaContainer) = {
    val (preceding, succeeding) = front.containers splitAt container.index

    containers.set(
      front,
      preceding ++ Seq(index.set(container, preceding.length)) ++ succeeding.map(index.modifyF(_ + 1))
    )
  }
}

