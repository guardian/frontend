# Previewing interactives on a localhost

All of the frontend applications are packaged as standalone JARs, so we can download and execute them like so,

```
wget -O interactive.zip "http://guest:@teamcity.gudev.gnl:8111/httpAuth/repository/download/bt1144/.lastSuccessful/artifacts.zip" 
unzip interactive.zip
java -DAPP_SECRET="" -jar packages/frontend-interactive/frontend-interactive.jar 
```

The frontend applications will run on port 9000, so visit that port in a browser...

Eg, [http://localhost:9000/world/australia-election-2013-interactive](http://localhost:9000/world/australia-election-2013-interactive)

You can point them at different environments using ~/.gu/frontend.properties file

```
content.api.key=xxx
content.api.host=xxx
```

And you can preview and test on various devices using the techniques explained in
[testing externally on localhost](testing-externally-on-localhost.md).
