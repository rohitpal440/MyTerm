(function($) {
  const path = require('path');
  const {ipcRenderer} = require('electron');
  ipcRenderer.on('asynchronous-reply', (event, arg) => {
    console.log(arg); // prints "pong"
  });
  ipcRenderer.send('asynchronous-message', 'client-async ping');
  var currentDirectory = '/';
  var lastCommand;
  function requestCommandExecution(command) {
    return ipcRenderer.sendSync('synchronous-message', currentDirectory, command);
  }
  $('#term_demo').terminal(function(command) {
    if (command !== '') {
      command = command.replace(/^\s+|\s+$/g, "").replace(/\s+/g, " ");
      // this.echo(new String(command));
      try {
        var result = requestCommandExecution(command);
        if (result.isSuccess == true) {
          switch (result.command) {
            case 'ls':
              result.message.forEach(file => {
                this.echo(file);
              });
              break;
            case 'cd':
            case 'session clear':
              currentDirectory = result.currentDirectoryPath;
              this.echo(result.message);
              break;
            case 'pwd':
              this.echo(result.message);
              break;
            default:
              this.echo(result.message);
          }
        } else {
          this.echo(result.message);
        }
      } catch(e) {
        this.echo("Catch Block");
        this.error(new String(e));
      }
    } else {
         this.echo('');
    }
  }, {
    greetings: 'Welcome to MyTerm!',
    name: 'MyTerm',
    prompt: '$ '
  });
}($))
