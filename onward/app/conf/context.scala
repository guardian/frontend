package conf

object HealthCheck extends AllGoodHealthcheckController(
  9011,
  "/top-stories.json?callback=navigation",
  "/most-read/society.json?callback=showMostPopular",
  "/related/theobserver/2012/nov/18/the-big-issue-cyclists-versus-motorists.json?callback=showRelated"
)