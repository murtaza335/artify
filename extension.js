'use strict';

const vscode = require('vscode');
const { ArtViewProvider } = require('./src/views');
const { Gallery } = require('./src/gallery');
const { PlayPanel } = require('./src/play');
const { Store } = require('./src/store');
const { Deck } = require('./src/deck');

function activate(context) {
  const store = new Store(context.globalState);
  const deck = new Deck(context.globalState);
  const vase = new ArtViewProvider('vase', store, context.globalState, deck);
  const palette = new ArtViewProvider('palette');


  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('artify.vase', vase),
    vscode.window.registerWebviewViewProvider('artify.palette', palette),
    vscode.commands.registerCommand('artify.openGallery', () => Gallery.show()),
    vscode.commands.registerCommand('artify.reformVase', () => vase.reform()),
    vscode.commands.registerCommand('artify.replay', () => vase.replay()),
    vscode.commands.registerCommand('artify.newRound', async () => {
      await deck.newRound();
      vscode.window.showInformationMessage('Artify: every shape and design counts as unseen again.');
    }),
    vscode.commands.registerCommand('artify.play', () => PlayPanel.show(context, store, deck)),
    // The artwork has a light and a dark variant, so redraw when the theme kind changes.
    vscode.window.onDidChangeActiveColorTheme(() => {
      vase.render();
      palette.render();
      PlayPanel.refresh();
    })
  );

  // A one-click way into Artify Play from the status bar.
  const button = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
  button.command = 'artify.play';
  button.text = '$(play) Artify Play';
  button.tooltip = 'Make art, solve a puzzle or throw paint while you wait';
  context.subscriptions.push(button);
  const syncButton = () => {
    if (vscode.workspace.getConfiguration('artify').get('showStatusBarButton', true)) button.show();
    else button.hide();
  };
  syncButton();
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('artify.showStatusBarButton')) syncButton();
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
