package common

case class Sponsor(
  campaign: String,
  tag: String
)

object Sponsors {

  lazy val campaigns: Map[String, Sponsor] = Map(
    "carphone-warehouse-mobile-living/carphone-warehouse-mobile-living" -> Sponsor("Carphone Warehouse", "carphone-warehouse") 
  )

  def find(tag:String) = {
    campaigns.get(tag) 
  }

}
