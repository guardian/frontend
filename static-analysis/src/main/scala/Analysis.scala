import java.nio.file.Path
import scala.meta.internal.semanticdb.{SymbolInformation, SymbolOccurrence}

object Analysis {

  def isViewsDefinition(symbolInfo: SymbolInformation, file: SourceRef): Boolean =
    symbolInfo.symbol.startsWith("views/html/") && (symbolInfo.kind.isMethod || symbolInfo.kind.isObject)

  def main(args: Array[String]): Unit = {
    val sources = SourceLoader.loadSources(Path.of("./article"))
    val semanticDB = SourceLoader.loadSemanticDB(Path.of("./article"))

    val callHierarchyBuilder = new CallHierarchyBuilder(sources, semanticDB)
    callHierarchyBuilder
      .buildCallHierarchy(isViewsDefinition)
      .foreach(node => CallHierarchy.printCallHierarchy(node, indent = ""))
  }

}
