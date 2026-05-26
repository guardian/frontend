import scala.jdk.CollectionConverters._
import java.nio.file.{Files, Path}
import scala.collection.{MapView, mutable}
import scala.meta.internal.semanticdb.{Locator, SymbolOccurrence, TextDocument}
import scala.meta.{Input, Source, Tree}

case class ScalaSources(private val sources: Map[SourceRef, Source]) {
  def getSource(filePath: SourceRef): Option[Source] = sources.get(filePath)
  def collect[T](f: PartialFunction[(SourceRef, Tree), T]): Seq[T] = {
    sources.toSeq.flatMap { case (filePath, source) =>
      val pf: PartialFunction[Tree, T] = {
        case node if f.isDefinedAt((filePath, node)) => f((filePath, node))
      }
      source.collect(pf)
    }
  }
}

case class SemanticDB(private val documents: Map[SourceRef, TextDocument]) {
  // Giant map to look up all occurrences of a symbol across all documents, keyed by the symbol name
  private val occurrences: MapView[SemanticDBSymbol, Seq[(SourceRef, SymbolOccurrence)]] = documents.toSeq
    .flatMap { case (filePath, document) =>
      document.occurrences.map(occurrence => SemanticDBSymbol(occurrence.symbol) -> (filePath, occurrence))
    }
    .groupBy(_._1)
    .view
    .mapValues(_.map(_._2))
  def getOccurrences(symbol: SemanticDBSymbol): Seq[(SourceRef, SymbolOccurrence)] =
    occurrences.getOrElse(symbol, Seq.empty)
  def allDocuments = documents.toSeq
  def getDocument(filePath: SourceRef): Option[TextDocument] = documents.get(filePath)
}

object SourceLoader {

  def loadSemanticDB(path: Path): SemanticDB = {
    val result = mutable.Map.empty[SourceRef, TextDocument]
    Locator(path) { case (path, documents) =>
      documents.documents.headOption.foreach { doc =>
        val filePath = path.toString
          .split("META-INF/semanticdb/")
          .lastOption
          .getOrElse(path.toString)
          .replaceAll(".semanticdb$", "")
        result.put(SourceRef(filePath), doc)
      }
    }
    val debug = result.flatMap(_._2.occurrences.filter(_.symbol.contains("emailArticleBody")))
    println(debug)
    SemanticDB(result.toMap)
  }

  def loadSources(path: Path): ScalaSources = {
    val source = Files
      .walk(path)
      .iterator()
      .asScala
      .filter(p => p.toString.endsWith(".scala"))
      .map { p =>
        val content = new String(Files.readAllBytes(p), "UTF-8")
        val input = Input.VirtualFile(p.toString, content)
        val source = input.parse[Source].get
        val filePath = p.toString().replaceFirst("\\./", "")
        SourceRef(filePath) -> source
      }
      .toMap

    ScalaSources(source)
  }

}
