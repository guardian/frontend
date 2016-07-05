package controllers

import conf.AnyGoodCachedHealthCheck

class HealthCheck extends AnyGoodCachedHealthCheck(
  9005,
  "/commercial/soulmates/mixed.json",
  "/commercial/masterclasses.json",
  "/commercial/travel/offers.json",
  "/commercial/jobs.json",
  "/commercial/money/bestbuys.json",
  "/commercial/books/books.json"
)
