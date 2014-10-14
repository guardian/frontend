package conf

object HealthCheck extends AllGoodHealthcheckController(
  9002,
  "/books",
  "/books/harrypotter",
  "/travel/gallery/2012/nov/20/st-petersburg-pushkin-museum",
  "/travel/gallery/2012/nov/20/st-petersburg-pushkin-museum?index=2",
  "/world/video/2012/nov/20/australian-fake-bomber-sentenced-sydney-teenager-video"
)