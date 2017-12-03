const {app, globalShortcut, BrowserWindow, ipcMain} = require('electron')
const fs = require('fs');
const path = require('path');
var mainWindow = null;

function executeCommand(currentDirectory, commandString) {
  var commandValues = commandString.split(' ');
  var result = validateAndExecuteCommand(currentDirectory, commandValues);
  if (result == undefined) {
    var command = commandValues[0];
    result = command + ': command not found'
  }
  return result;
}

function listContentsOf(directoryPath) {
  var fileList = [];
  fileList = fs.readdirSync(directoryPath);
  return {command: 'ls', isSuccess: true, message: fileList};
}

function getAbsolutePath(directoryPath, currentDirectory) {
  if (currentDirectory == '/') {
    return currentDirectory + directoryPath;
  }
  return currentDirectory + '/' + directoryPath;
}

function changeDirectoryTo(directoryPath, currentDirectory) {
  if (fs.existsSync(getAbsolutePath(directoryPath, currentDirectory)) &&
    (fs.statSync(getAbsolutePath(directoryPath, currentDirectory))).isDirectory()) {//read from relative path
    // console.log("relative path: " + path.normalize(getAbsolutePath(directoryPath, currentDirectory)));
    var dirPath = path.resolve(getAbsolutePath(directoryPath, currentDirectory));
    return {command: 'cd', isSuccess: true,
            message: dirPath,
            currentDirectoryPath: dirPath};
  } else if (fs.existsSync(directoryPath) &&
      (fs.statSync(directoryPath)).isDirectory()) {// absolute Path
    // console.log( "absolute path: "+ path.normalize(directoryPath));
    var dirPath = path.resolve(directoryPath);
    return {command: 'cd', isSuccess: true, message: dirPath, currentDirectoryPath: dirPath};
  }
  return {command: 'cd', isSuccess: false, message: 'No Such directory'};
}

function clearSession() {
  return changeDirectoryTo('/', currentDirectory);
}

function createDirectoryAt(directoryPath) {
  return 'directory created';
}

function removeDirectoryAt(directoryPath) {
  if (fs.existsSync(directoryPath) && (fs.statSync(directoryPath)).isDirectory()) {

  } else if (fs.existsSync(directoryPath) && (fs.statSync(directoryPath)).isFile()) {

  }
  return {command: 'cd', isSuccess: false, message: 'No Such File/Directory to delete'};;
}

function validateAndExecuteCommand(currentDirectory, commandValues) {
  var result;
  switch(commandValues[0]) {
    case 'ls':
      if (commandValues.length == 1) {
        result = listContentsOf(currentDirectory)
      } else if (commandValues.length == 2) {
        var directoryPath = commandValues[1];
        if (fs.existsSync(directoryPath)) {// absolute Path
          result = listContentsOf(directoryPath);
        } else if (fs.existsSync(getAbsolutePath(directoryPath, currentDirectory))) {//read from relative path
          result = listContentsOf(getAbsolutePath(directoryPath, currentDirectory));
        }
      } else {
        result = {command: 'ls', isSuccess: false, message: 'Invalid command\nUsage: ls optional<arg>'};
      }
      break;
    case 'pwd':
      if (commandValues.length == 1) {
        result = {command: 'pwd', isSuccess: true, message: currentDirectory};
      } else {
        result = {isSuccess: false, message: 'Too many Arguements\nUsage: session'};
      }
      break;
    case 'session':
      if (commandValues.length == 2 && commandValues[1] == 'clear'){
        result = changeDirectoryTo('/', currentDirectory);
        result.command = 'session clear';
      } else {
        result = {isSuccess: false, message: 'Invalid Command\nUsage: session clear'};
      }
      break;
    case 'cd':
      if (commandValues.length == 1) {
        result = changeDirectoryTo('/', currentDirectory);
      } else if (commandValues.length == 2) {
        result = changeDirectoryTo(commandValues[1], currentDirectory);
      } else {
        result = {isSuccess: false, message: 'Invalid Command\nUsage: cd <arg>'};
      }
      break;
    case 'mkdir':
      result = 'mkdir command'
      break;
    case 'rm':
      // var directoryPath;
      // if (commandValues.length ==2 && commandValues[1] !== '-r') {
      //   directoryPath = commandValues[1];
      //   if (fs.existsSync(directoryPath) { //absolute path
      //     result = removeDirectoryAt(directoryPath)
      //   } else if (fs.existsSync(getAbsolutePath(directoryPath, currentDirectory))) {//relative path
      //     result = removeDirectoryAt(getAbsolutePath(directoryPath, currentDirectory));
      //   }
      // } else if (commandValues.length < 2) {
      //   result = {isSuccess: false, message: 'Invalid Command\nUsage: rm [-r] <arg>'};
      // }
      break;
    default:
      result = {isSuccess: false, message: 'No such command found'};
  }
  return result;
}

app.setName('MyTerm')
app.on('ready', function() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 400
  });
  globalShortcut.register('CommandOrControl+R', () => {
    // disable reloading
  })
  mainWindow.loadURL('file://' + __dirname + '/windows/main/main.html');
});
ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg)  // prints "ping"
  event.sender.send('asynchronous-reply', 'server-async pong')
});

ipcMain.on('synchronous-message', (event, currentDirectory, commandString) => {
  event.returnValue = executeCommand(currentDirectory, commandString);
});
app.on('window-all-closed', () => {
  app.quit()
})
