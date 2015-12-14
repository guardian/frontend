# Converting individual Rubicon tag creatives into template creatives
This package has classes required to convert third-party Rubicon tag creatives into creatives based on a template.
The advantage is that a change to the tag only has to be made in the template, rather than in every single
creative individually.

## Creating a creative template
0. Generate json using `CreativeTemplate.generate()` and write it to a file.
0. Find *Rubicon Tags* creative template in DFP.
0. Export old creative template in case of need to roll back.
0. Import new json file into DFP to overwrite old creative template.

## Replacing third-party creatives with new template creatives
Use `Creative.replaceTagCreatives()`.  This will:

0. Find relevant creatives
0. For each creative, generate a new template creative associated with the same line items
0. Disassociate original creatives from their line items
