# Bottotto

Bottotto is a discord bot, which has various features that make your discord experience better.

For example, Bottotto can...
- read aloud messages written in a specific text channel.
- manage temporal private text channels.
- and more...

## Installation

### Dependencies

Bottotto requires following dependencies.

- Node.js v16 or above
- OpenJTalk

### Setting up `config.json`

Before running the program, you need to configure `config.json` properly. 
Wrong settings may cause accidental shutdown of your bot.

Here's the template of `config.json`.

```json
{
  "token": "place the token of your discord bot here.",
  "root": "servers/",
  "guildId": "your server's id",
  "clientId": "client id of your discord bot",
  "PATH_TO_OPEN_JTALK": "path to OpenJTalk executable.",
  "OPEN_JTALK_VOICE_PATH": "path to .htsvoice file.",
  "OPEN_JTALK_DICTIONARY_PATH": "path to OpenJTalk dictionary."
}
```

### Run the program
To run the bot on your own system, just run
```shell
node main.js
```
However, you may want to run it continuously even if it was crashed by some accidents.
To daemonize it, use `forever`.

```shell
forever node main.js
```

If you see `ready...` on your console, you are ready to go!

## Disclaimer

Bottotto is still under developing 
and not maintained frequently.
Please use this program at your own risk, and I take no responsibility for any loss or damage.