package models

import org.scalatest.{Matchers, FlatSpec}
import play.api.libs.json.Json

class TemperaturesTest extends FlatSpec with Matchers {
  "fromCelsius" should "properly calculate the imperial temperature" in {
    Temperatures.fromCelsius(15) shouldEqual Temperatures(
      metric = 15,
      imperial = 59
    )
  }

  "fromFahrenheit" should "properly calculate the metric temperature" in {
    Temperatures.fromFahrenheit(59) shouldEqual Temperatures(
      metric = 15,
      imperial = 59
    )
  }

  "toJson" should "make a nice string format" in {
    Json.toJson(Temperatures(
      metric = 15,
      imperial = 59
    )) shouldEqual Json.obj(
      "metric" -> "15°C",
      "imperial" -> "59°F"
    )
  }

  it should "trim past the first decimal place" in {
    Json.toJson(Temperatures.fromFahrenheit(34)) shouldEqual Json.obj(
      "metric" -> "1°C",
      "imperial" -> "34°F"
    )
  }
}
