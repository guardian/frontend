import scala.jdk.CollectionConverters._
import java.nio.file.{Files, Path}
import scala.collection.{MapView, mutable}
import scala.meta.internal.semanticdb.{Locator, SymbolInformation, SymbolOccurrence, TextDocument}
import scala.meta.{Input, Position, Source, Tree}

case class ScalaSources(private val sources: Map[SourceRef, Source]) {
  private val byCoordinates: MapView[SymbolCoordinates, Seq[Tree]] = sources.toSeq
    .flatMap { case (filePath, source) =>
      source.collect { case node =>
        val coordinates = SymbolCoordinates(
          filePath,
          node.pos.startLine,
          node.pos.startColumn,
          node.pos.endLine,
          node.pos.endColumn,
        )
        coordinates -> node
      }
    }
    .groupBy(_._1)
    .view
    .mapValues(_.map(_._2))
  def getByCoordinates(coordinates: SymbolCoordinates): Seq[Tree] =
    byCoordinates.getOrElse(coordinates, Seq.empty)
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
  private val byCoordinates: MapView[SymbolCoordinates, Seq[(SourceRef, SymbolOccurrence)]] = documents.toSeq
    .flatMap { case (filePath, document) =>
      document.occurrences.flatMap { occurrence =>
        occurrence.range.map { range =>
          val coordinates = SymbolCoordinates(
            filePath,
            range.startLine,
            range.startCharacter,
            range.endLine,
            range.endCharacter,
          )
          coordinates -> (filePath, occurrence)
        }
      }
    }
    .groupBy(_._1)
    .view
    .mapValues(_.map(_._2))
  // Giant map to look up all occurrences of a symbol across all documents, keyed by the symbol name
  private val occurrences: MapView[SemanticDBSymbol, Seq[(SourceRef, SymbolOccurrence)]] = documents.toSeq
    .flatMap { case (filePath, document) =>
      document.occurrences.map(occurrence => SemanticDBSymbol(occurrence.symbol) -> (filePath, occurrence))
    }
    .groupBy(_._1)
    .view
    .mapValues(_.map(_._2))

  private val symbolInformation: MapView[SemanticDBSymbol, Seq[(SourceRef, SymbolInformation)]] = documents.toSeq
    .flatMap { case (filePath, document) =>
      document.symbols.map(symbolInfo => SemanticDBSymbol(symbolInfo.symbol) -> (filePath, symbolInfo))
    }
    .groupBy(_._1)
    .view
    .mapValues(_.map(_._2))
  def getOccurrences(symbol: SemanticDBSymbol): Seq[(SourceRef, SymbolOccurrence)] =
    occurrences.getOrElse(symbol, Seq.empty)
  lazy val allOccurrenceSymbols: Seq[String] = occurrences.keys.map(_.symbolName).toSeq
  def allDocuments = documents.toSeq
  def findDefinition(symbol: SemanticDBSymbol): Option[(SourceRef, SymbolInformation)] =
    symbolInformation.getOrElse(symbol, Seq.empty).headOption
  def getByCoordinates(coordinates: SymbolCoordinates): Seq[(SourceRef, SymbolOccurrence)] =
    byCoordinates.getOrElse(coordinates, Seq.empty)
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
