# Testing externally on your localhost

There are a number of tools on the market for this. The one we recommended is ngrok.


# To use ngrok:

Install ngrok via their website: https://ngrok.com/download or use homebrew :
```bash
brew cask install ngrok
```
In sbt run your desired project:
```bash
sbt
> project article
> run
```
In a separate terminal, run ngrok, assigning the port number you are using for frontend (default is 9000):
```bash
ngrok http 9000
```
Copy the Forwarding url - ie "https://eb65c38f.ngrok.io"
To end the tunnel use CTRL-C to kill it.
