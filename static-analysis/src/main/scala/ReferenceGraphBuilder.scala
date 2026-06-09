import java.nio.file.Path
import scala.meta.{Decl, Defn, Importer, Member, Pat, Pkg, Tree}
import scala.meta.Tree._
import scala.meta.internal.semanticdb.{Range, SymbolOccurrence}

class ReferenceGraphBuilder(
    scalaSources: ScalaSources,
    semanticDB: SemanticDB,
) {

  private def findEnclosingConstruct(node: Tree): Option[Tree] = node.parent match {
    case Some(defn: Defn) => Some(defn)
    // case Some(pkg: Pkg)   => Some(pkg)
    case Some(parentNode) => findEnclosingConstruct(parentNode)
    case None             => None
  }

  private def symbolOccurrenceToSourceTree(
      file: SourceRef,
      symbolOccurrence: SymbolOccurrence,
  ): Seq[Tree] = {
    def toCoordinates(range: Range): SymbolCoordinates =
      SymbolCoordinates(file, range.startLine, range.startCharacter, range.endLine, range.endCharacter)

    symbolOccurrence.range match {
      case None        => return Seq.empty
      case Some(range) => scalaSources.getByCoordinates(toCoordinates(range))
    }
  }

  private def sourceTreeToSymbolOccurrence(
      file: SourceRef,
      tree: Tree,
  ): Seq[SymbolOccurrence] = {
    val positions = tree match {
      case value: WithPats => value.pats.map(_.pos) // pats are vals vars etc.
      case m: Member       => Seq(m.name.pos) // defs, classes, traits, objects, type members
      case other           => Seq(other.pos)
    }

    positions
      .map(pos =>
        SymbolCoordinates(
          file,
          pos.startLine,
          pos.startColumn,
          pos.endLine,
          pos.endColumn,
        ),
      )
      .flatMap { coordinates =>
        semanticDB.getByCoordinates(coordinates).map(_._2)
      }

  }

  private def isPackageOrImport(node: Tree): Boolean = node.parent match {
    case Some(_: Pkg)         => true
    case Some(_: Importer)    => true
    case Some(_: Defn.Def)    => false
    case Some(_: Defn.Class)  => false
    case Some(_: Defn.Trait)  => false
    case Some(_: Defn.Object) => false
    case Some(parent)         => isPackageOrImport(parent)
    case None                 => false
  }

  private def resolveReferences(): Seq[(SymbolOccurrence, SymbolOccurrence)] = {
    semanticDB.allDocuments
      // start by resolving all the method definitions across all documents
      .flatMap { case (_, document) =>
        document.symbols.filter(_.kind.isMethod).map(_.symbol)
      }
      // then find where each of these methods are called
      .flatMap(definitionSymbol => semanticDB.getOccurrences(SemanticDBSymbol(definitionSymbol)))
      .filter(_._2.role.isReference)
      // for each call site, find the enclosing method or class or object or trait
      .flatMap { case (file, occurrence) =>
        // format: off
        symbolOccurrenceToSourceTree(file, occurrence) // convert the symbol occurrence into a position in the source tree
          .filterNot(isPackageOrImport)
          .flatMap(findEnclosingConstruct) // in the source tree we can find which method, class etc is enclosing that call
          .flatMap(sourceTreeToSymbolOccurrence(file, _)) // then convert back into the sybol occurrence by using coordinates
          .map(p => p -> occurrence)
        // format: on
      }

  }

}

object ReferenceGraphBuilder {
  def main(args: Array[String]): Unit = {
    val sources = SourceLoader.loadSources(Path.of("."))
    val semanticDB = SourceLoader.loadSemanticDB(Path.of("."))
    val builder = new ReferenceGraphBuilder(sources, semanticDB)
    val references = builder.resolveReferences()

    val refMap = references.groupBy(_._1.symbol).view.mapValues(_.map(_._2)).toMap
    println(s"Found ${references.size} references across ${refMap.size} unique symbols.")
  }
}
