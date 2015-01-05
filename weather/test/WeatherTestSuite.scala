import org.scalatest.Suites
import test._

class WeatherTestSuite extends Suites(new WeatherHealthcheckTest) with SingleServerSuite {
  override lazy val port: Int = conf.HealthCheck.testPort
}
