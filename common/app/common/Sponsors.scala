package common

case class Sponsor(
  campaign: String,
  tag: String
)

object Sponsors {

  lazy val campaigns: Map[String, Sponsor] = Map(
    "sponsored/discover-america" -> Sponsor("Discover America", "discover-america"),
    "sponsored/rent-a-car" -> Sponsor("Enterprise: rent-a-car", "rent-a-car")
  )

  def find(tag:String) = {
    campaigns.get(tag) 
  }

}
