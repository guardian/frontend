package controllers

import model.dotcomrendering.PuzzlesLayout
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.{Environment, Mode}

import java.io.{ByteArrayInputStream, File, InputStream}
import java.nio.charset.StandardCharsets
import scala.concurrent.duration._
import scala.concurrent.{Await, ExecutionContext}

class PuzzlesLayoutProviderTest extends AnyFlatSpec with Matchers {
  private implicit val executionContext: ExecutionContext = ExecutionContext.global

  "LocalJsonPuzzlesLayoutProvider" should "load the production layout from the classpath" in {
    val provider = new LocalJsonPuzzlesLayoutProvider(Environment.simple())

    val layout = Await.result(provider.getLayout(), 5.seconds)

    layout.containers should not be empty
    layout.filters should not be empty
    layout.containers.flatMap(_.content.nestedContainers) should not be empty
    archives(layout) should not be empty
  }

  it should "close the resource stream after successful loading" in {
    val json = """{"containers":[],"filters":[]}"""
    val stream = new CloseTrackingInputStream(json)
    val provider = new LocalJsonPuzzlesLayoutProvider(environmentReturning(Some(stream)))

    Await.result(provider.getLayout(), 5.seconds) shouldBe PuzzlesLayout(Seq.empty, Seq.empty)
    stream.wasClosed shouldBe true
  }

  it should "fail clearly and close the stream when the blueprint is invalid" in {
    val stream = new CloseTrackingInputStream("""{"containers":[{"title":"incomplete"}]}""")
    val provider = new LocalJsonPuzzlesLayoutProvider(environmentReturning(Some(stream)))

    val error = the[IllegalArgumentException] thrownBy Await.result(provider.getLayout(), 5.seconds)

    error.getMessage should include("puzzles-layout.json")
    error.getMessage should include("is invalid")
    stream.wasClosed shouldBe true
  }

  it should "fail clearly and close the stream when the resource contains malformed JSON" in {
    val stream = new CloseTrackingInputStream("""{"containers": [""")
    val provider = new LocalJsonPuzzlesLayoutProvider(environmentReturning(Some(stream)))

    val error = the[IllegalArgumentException] thrownBy Await.result(provider.getLayout(), 5.seconds)

    error.getMessage should include("puzzles-layout.json")
    error.getMessage should include("could not be parsed as JSON")
    stream.wasClosed shouldBe true
  }

  it should "fail clearly when the classpath resource is missing" in {
    val provider = new LocalJsonPuzzlesLayoutProvider(environmentReturning(None))

    val error = the[IllegalStateException] thrownBy Await.result(provider.getLayout(), 5.seconds)

    error.getMessage should include("puzzles-layout.json")
    error.getMessage should include("was not found on the classpath")
  }

  private def archives(layout: PuzzlesLayout) =
    layout.containers.flatMap(container =>
      container.content.archive.toSeq ++
        container.content.nestedContainers.flatMap(nested => nested.content.archive.toSeq),
    )

  private def environmentReturning(stream: Option[InputStream]): Environment = {
    val classLoader = new ClassLoader(null) {
      override def getResourceAsStream(name: String): InputStream = stream.orNull
    }
    Environment(new File("."), classLoader, Mode.Test)
  }

  private class CloseTrackingInputStream(contents: String)
      extends ByteArrayInputStream(contents.getBytes(StandardCharsets.UTF_8)) {
    var wasClosed = false

    override def close(): Unit = {
      wasClosed = true
      super.close()
    }
  }
}
