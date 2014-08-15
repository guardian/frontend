package conf

object HealthCheck extends AnyGoodHealthcheckController(
  9005,
  "/commercial/soulmates/mixed.json",
  "/commercial/masterclasses.json",
  "/commercial/travel/offers.json",
  "/commercial/jobs.json",
  "/commercial/money/bestbuys.json",
  "/commercial/books/bestsellers.json"
)