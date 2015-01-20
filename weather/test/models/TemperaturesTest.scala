package models

import org.scalatest.{Matchers, FlatSpec}

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
}
