# DM-Chess

Play chess with a coworker over Slack, Teams, or whatever you use. You make a move in the browser, the share link auto-copies to your clipboard, you paste it. They click, make their move, paste the new link back. That's it.

No accounts, no installs, no servers.

**[dvelton.github.io/dm-chess](https://dvelton.github.io/dm-chess)**

![DM-Chess Screenshot](screenshot1.png)

## How to play

1. Open the app and click a piece, then click where it should go.
2. The share link copies to your clipboard automatically after each move.
3. Paste the link to your opponent in Slack/Teams/email/whatever.
4. They open it, make their move, send the new link back.
5. Keep going until someone wins or you both get bored.

You can also use the Share tab to copy an ASCII text version of the board if you prefer the old-school look in chat. The game auto-saves in your browser, so closing the tab won't lose your position.

## Screenshots

| Start | Mid-game | Move history |
|-------|----------|--------------|
| ![Game Start](screenshot1.png) | ![Move Response](screenshot2.png) | ![Ongoing Match](screenshot3.png) |

## Development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Deploys to GitHub Pages on push to `main`.

Built with React, TypeScript, Vite, Tailwind CSS, [chess.js](https://github.com/jhlywa/chess.js), and Radix UI. Originally made with [GitHub Spark](https://github.com/features/spark).

## License

[MIT](LICENSE)
