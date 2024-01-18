package test
import controllers.Assets
import org.scalatestplus.mockito.MockitoSugar

trait WithAssets extends MockitoSugar {
  lazy val assets: Assets = mock[Assets]
}
