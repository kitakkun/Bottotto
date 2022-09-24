# Bottotto (No longer maintained. archived)

Bottotto is a discord bot, which has various features that make your discord experience better.

For example, Bottotto can...
- read aloud messages written in a specific text channel.
- manage temporal private text channels.
- and more...

## Important Notices

**This project is no longer maintained** as it contains **too many bugs**.
I think it will be so difficult to fix all of them, so I finally decided to archive this repository.

However, my dreams to create powerful discord bot is never ruined! I'm currently porting Bottotto by using JDA(Java Discord API). If you are interested in it, please check 'kottotto' repository.

My new project, kottotto is <a href="https://github.com/kitakkun/kottotto/">here</a> :D

## Features
### Temporal Private Text Channel

When you enter a voice channel, Bottotto automatically creates a temporal private text channel. This channel is only visible from users in the voice channel.

When nobody exists in the voice channel, Bottotto automatically delete the temporal text channel to keep your discord server clean.

https://user-images.githubusercontent.com/48154936/185778956-8a39db8d-c915-498e-a912-1e78e10f7075.mp4

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
  "clientId": "client id of your discord bot",
  "PATH_TO_OPEN_JTALK": "path to OpenJTalk executable.",
  "OPEN_JTALK_VOICE_PATH": "path to .htsvoice file.",
  "OPEN_JTALK_DICTIONARY_PATH": "path to OpenJTalk dictionary."
}
```

### Install node modules

The node packages we need is configured in `package.json`. So what you need to do is just run

```shell
npm install
```

### Deploy slash commands

Before you begin, you need to deploy slash commands. To do it, run

```shell
node deploy-commands.js
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
