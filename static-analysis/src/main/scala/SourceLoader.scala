import scala.jdk.CollectionConverters._
import java.nio.file.{Files, Path}
import scala.meta.{Input, Source, Tree}

case class ScalaSources(private val sources: Map[String, Source]) {
  def getSource(filePath: String): Option[Source] = sources.get(filePath)
  def collect[T](f: PartialFunction[(String, Tree), T]): Seq[T] = {
    sources.toSeq.flatMap { case (filePath, source) =>
      val pf: PartialFunction[Tree, T] = {
        case node if f.isDefinedAt((filePath, node)) => f((filePath, node))
      }
      source.collect(pf)
    }
  }
}

object SourceLoader {

  def load(path: Path): ScalaSources = {
    val source = Files
      .walk(path)
      .iterator()
      .asScala
      .filter(p => p.toString.endsWith(".scala"))
      .map { p =>
        val content = new String(Files.readAllBytes(p), "UTF-8")
        val input = Input.VirtualFile(p.toString, content)
        val source = input.parse[Source].get
        val filePath = p.toString.split("src/main/scala/").lastOption.getOrElse(p.toString)
        filePath -> source
      }
      .toMap

    ScalaSources(source)
  }

}
