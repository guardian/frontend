import SourceLoader.SourceRef

import java.nio.file.Path
import scala.meta.internal.semanticdb.{SymbolInformation, SymbolOccurrence}

object Analysis {

  def findViewsDefinitions(semanticDB: SemanticDB): Seq[(SourceRef, SymbolInformation)] = {
    semanticDB.allDocuments.flatMap { case (file, document) =>
      document.symbols
        .filter { symbol =>
          symbol.symbol.startsWith("views/html/") && (symbol.kind.isMethod || symbol.kind.isObject)
        }
        .map(definitions => file -> definitions)
        .map { case (file, definition) =>

          file -> definition
        }
    }
  }

  def findViewsCallSites(semanticDB: SemanticDB): Seq[(SourceRef, SymbolOccurrence)] = {
    val allDefs = findViewsDefinitions(semanticDB)
    allDefs.flatMap { case (_, definition) =>
      semanticDB
        .getOccurrences(definition.symbol)
        .filter { case (_, occurrence) => occurrence.role.isReference }
        .map { case (callFile, occurrence) => callFile -> occurrence }
    }
  }

  def main(args: Array[String]): Unit = {
    val sources = SourceLoader.loadSources(Path.of("./article"))
    val semanticDB = SourceLoader.loadSemanticDB(Path.of("./article"))

    val callHierarchyBuilder = new CallHierarchyBuilder(sources, semanticDB)

    findViewsCallSites(semanticDB)
      .map { case (file, occurrence) =>
        val methodRef = MethodRef(occurrence.symbol, occurrence, file)
        callHierarchyBuilder.buildCallHierarchy(methodRef)
      }
      .foreach(node => CallHierarchy.printCallHierarchy(node))
  }

}
