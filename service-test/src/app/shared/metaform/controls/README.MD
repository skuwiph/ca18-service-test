# NOTE
I would like the controls to be loaded dynamically using the ComponentResolverFactory method, but since we are using lazy-loaded modules, there is currently an issue.

The Angular team _may_ provide a mechanism for getting this to work without adding an entryComponents attribute to the app.module, or it _may_ be possible to look at the Material2 source code to see how they worked around it for their ModuleDialog feature, but as it stands, we have bigger fish to fry currently.

-- IAS 10/03/17