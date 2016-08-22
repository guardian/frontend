
import app.FrontendComponents
import play.api.ApplicationLoader.Context
import play.api.BuiltInComponentsFromContext
import test.{WithTestFootballClient, FootballTestData}

trait TestComponents extends FootballTestData with WithTestFootballClient {
  self: SportServices =>
  override lazy val footballClient = testFootballClient
  override lazy val competitionsService = testCompetitionsService
}

class TestAppLoader extends AppLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents with TestComponents
}
