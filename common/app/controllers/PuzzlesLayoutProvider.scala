package controllers

import model.dotcomrendering.PuzzlesLayout
import play.api.Environment
import play.api.libs.json.{JsError, JsSuccess, Json}

import scala.concurrent.{ExecutionContext, Future, blocking}
import scala.util.control.NonFatal

trait PuzzlesLayoutProvider {
  def getLayout()(implicit executionContext: ExecutionContext): Future[PuzzlesLayout]
}

class LocalJsonPuzzlesLayoutProvider(
    environment: Environment,
    resourceName: String = LocalJsonPuzzlesLayoutProvider.DefaultResourceName,
) extends PuzzlesLayoutProvider {

  override def getLayout()(implicit executionContext: ExecutionContext): Future[PuzzlesLayout] = Future(
    blocking(loadLayout()),
  )

  private def loadLayout(): PuzzlesLayout = {
    val inputStream = environment
      .resourceAsStream(resourceName)
      .getOrElse(
        throw new IllegalStateException(s"Puzzles layout resource $resourceName was not found on the classpath"),
      )

    try {
      Json.parse(inputStream).validate[PuzzlesLayout] match {
        case JsSuccess(layout, _) => layout
        case JsError(errors)      =>
          throw new IllegalStateException(
            s"Puzzles layout resource '$resourceName' is invalid: ${JsError.toJson(errors)}",
          )
      }
    } catch {
      case error: IllegalStateException => throw error
      case NonFatal(error)              =>
        throw new IllegalStateException(
          s"Puzzles layout resource '$resourceName' could not be parsed as JSON",
          error,
        )
    } finally {
      inputStream.close()
    }
  }
}

object LocalJsonPuzzlesLayoutProvider {
  val DefaultResourceName: String = "puzzles-layout.json"
}
