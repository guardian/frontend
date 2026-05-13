package controllers

import model.dotcomrendering.PuzzlesLayout
import play.api.Environment
import play.api.libs.json.Json

trait PuzzlesLayoutProvider {
  def getLayout(): PuzzlesLayout
}

class LocalJsonPuzzlesLayoutProvider(environment: Environment) extends PuzzlesLayoutProvider {
  override def getLayout(): PuzzlesLayout = {
    val inputStream = environment
      .resourceAsStream("puzzles-layout.json")
      .getOrElse(throw new RuntimeException("Could not find puzzles-layout.json in classpath"))

    try {
      Json.parse(inputStream).as[PuzzlesLayout]
    } finally {
      inputStream.close()
    }
  }
}