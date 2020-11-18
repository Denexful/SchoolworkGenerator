const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const simpleOdf = require('simple-odf');
const { ipcMain } = require('electron');

function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      worldSafeExecuteJavaScript: true,
      enableRemoteModule : true
    }
  })

  // and load the index.html of the app.
  win.loadFile('Views/index.html')
  win.removeMenu();
  win.maximize();
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})


ipcMain.on('GenerateTest', (event, args) => {
  console.log(args);
  GenerateTest(args.Path, args.TestName ,args.Questions)
  event.reply('GenerateTest-reply', true);
})

function GenerateTest(RawPath, TestName ,Questions){
  //#region GENERATE PATH
  var Path = RawPath.replaceAll('\\', '/');
  var PathToFile = "";
  if(TestName){
    PathToFile = Path+ '/' +TestName+'.odt';
    var counter = 1;
    while(fs.existsSync(PathToFile)){
      PathToFile = Path+ '/' +TestName+ ' (' + counter +')' + '.odt';
      counter++;
    }
  }
  else{
    PathToFile = Path+ '/'+'GENERATEDTEST.odt';
    var counter = 1;
    while(fs.existsSync(PathToFile)){
      PathToFile = Path+ '/' +'GENERATEDTEST '+ '(' + counter + ')'+ '.odt';
      counter++;
    }
  }
  //#endregion GENERATE PATH

  const document = new simpleOdf.TextDocument();
  const body = document.getBody();
  body.addHeading('Test generated with SchoolworkGenerator by Denis Stawicki');
  body.addParagraph();

  Questions.forEach(Question => {
    var question = Question.Identifier+'.' + Question.Question;
    body.addParagraph(question)
    if(Question.Markers > 0){
      const list = body.addList();
      for (let index = 0; index < Question.Markers; index++) {
        list.addItem().addParagraph();
      }
    }
    body.addParagraph();
  });
  document.saveFlat(PathToFile);
}
