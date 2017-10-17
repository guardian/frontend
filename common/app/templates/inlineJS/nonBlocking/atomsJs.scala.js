@import play.twirl.api.HtmlFormat
@(page: model.Page)(implicit context: model.ApplicationContext)
(function () {
  function loadAtoms() {
    @* 
     * each atomsJS element looks like this:
     *   this.profile=(function(...){...}())
     * we can just bind this to an arbitrary object that we can pass around.   
     *@
    @page.metadata.atomsJS.mkString(" ")
  } 
  var guardian = window.guardian || (window.guardian = {});
  guardian.atoms = {};
  loadAtoms.call(guardian.atoms);
  console.log("Atoms are loaded!")
  console.dir(guardian.atoms);
}());