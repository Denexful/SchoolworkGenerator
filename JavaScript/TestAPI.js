const { ipcRenderer } = require('electron')
const {dialog} = require('electron').remote;
var QuestionsFields = []
var TestName =""
document.addEventListener("DOMContentLoaded", function(event) { 
  SetUpTest();
  });

function BulletPointGenerateNum(event){
  var sender = event.target
  var ParentContainer = sender.parentNode;
  if(ParentContainer.nodeName == "BUTTON"){
    ParentContainer = ParentContainer.parentNode;
  }
  var ParentContainerID = ParentContainer.id
  var Identifier = GetCleanID(ParentContainerID);
  ParentContainer.removeEventListener("click", BulletPointGenerateNum);
  ParentContainer.innerHTML = "";

  var MarkerInputNumeric = document.createElement("input");
  MarkerInputNumeric.className = "num-input form-control";
  MarkerInputNumeric.type = "number";
  MarkerInputNumeric.id = "MarkersDivNumeric-" + Identifier
  MarkerInputNumeric.value = "3"
  MarkerInputNumeric.addEventListener("change", BulletPointGenerateButon);
  MarkerInputNumeric.addEventListener("change", MarkerNumberChange)

  ParentContainer.appendChild(MarkerInputNumeric);

  QuestionsFields.forEach(Field => {
    if(Field.Identifier == Identifier){
      Field.Markers = 3;
    }  
  })

}

function BulletPointGenerateButon(event){
  if(event.target.value <= 0){
    var sender = event.target
    var ParentContainer = sender.parentNode;
    ParentContainer.innerHTML= "<button class=\"btn btn-outline-secondary\" type=\"button\"><i class=\"fas fa-list-ul\"></i></button>"
    ParentContainer.addEventListener("click", BulletPointGenerateNum);
  }  
}


function PopulateBody(QuestionField){
  var Body = document.getElementById("TestGeneratorBody");
  Body.innerHTML = "";
  QuestionField.forEach(Field => {
    var inputGroup = document.createElement("div")
    inputGroup.className = "input-group mb-3";
    
    var inputGroupPrepend = document.createElement("div")
    inputGroupPrepend.className = "input-group-prepend";

    var BtnFlip = document.createElement("a");
    BtnFlip.className = "btn-flip";
    BtnFlip.dataset.back="X"
    BtnFlip.dataset.front= Field.Identifier +".";
    BtnFlip.id = "Delete-" + Field.Identifier;
    BtnFlip.addEventListener("click", DeleteQuestionField);

    inputGroupPrepend.appendChild(BtnFlip);
    inputGroup.appendChild(inputGroupPrepend); 

    var inputQuestionLabel = document.createElement("input");
    inputQuestionLabel.type="text";
    inputQuestionLabel.className= "form-control QuestionLabel";
    inputQuestionLabel.setAttribute('aria-label', 'Default');
    inputQuestionLabel.setAttribute('aria-describedby', 'inputGroup-sizing-default')
    inputQuestionLabel.placeholder = "Write here you Question";
    inputQuestionLabel.value = Field.Question;
    inputQuestionLabel.id = "QuestionField-"+ Field.Identifier;
    inputQuestionLabel.addEventListener("input", QuestionInputChange)
    inputGroup.appendChild(inputQuestionLabel);

    var ContainerForMarkers = document.createElement("div");
    ContainerForMarkers.id = "MarkersDiv-" + Field.Identifier;
    ContainerForMarkers.className = "input-group-append";
    ContainerForMarkers.addEventListener("click", BulletPointGenerateNum);
    AreaForMarkers = document.createElement("span")

    if(parseInt(Field.Markers) <= 0){
      var AreaForMarkers = document.createElement("button");
      AreaForMarkers.className = "btn btn-outline-secondary";
      AreaForMarkers.type = "button";
    }
    else{
      var AreaForMarkers = document.createElement("input");
      AreaForMarkers.className = "num-input form-control";
      AreaForMarkers.type = "number";
      AreaForMarkers.id = "MarkersDivNumeric-" + Field.id;
      AreaForMarkers.value = Field.Markers;
      AreaForMarkers.addEventListener("change", BulletPointGenerateButon);
      AreaForMarkers.addEventListener("change", MarkerNumberChange);
    }
    var IconForMarkers = document.createElement("i");
    IconForMarkers.className = "fas fa-list-ul";

    AreaForMarkers.appendChild(IconForMarkers);
    ContainerForMarkers.appendChild(AreaForMarkers);
    inputGroup.appendChild(ContainerForMarkers);

    Body.appendChild(inputGroup);
  });
}

function AddQuestionField(){
  var NewInputField = {
    Identifier : GetAvailableID(),
    Question : "",
    Markers : 0
  }
  QuestionsFields.push(NewInputField);

  PopulateBody(QuestionsFields);
}
function GetAvailableID(){
  var highestNumber = 0;
  QuestionsFields.forEach(Field => {
    if(Field.Identifier > highestNumber){
      highestNumber = Field.Identifier;
    }
  });
  return ++highestNumber;
}
function DeleteQuestionField(event){
    var senderDomElement = event.target;  
    var CleanID = GetCleanID(senderDomElement.id);
    for(var i = 0; i < QuestionsFields.length; i++){
      if(CleanID == QuestionsFields[i].Identifier){
         QuestionsFields.splice(i,1);
      }
    }
    ResetIdentifier();
    PopulateBody(QuestionsFields);
}
function ResetIdentifier(){
  NewID = 1;  
  QuestionsFields.forEach(Field => {
      Field.Identifier = NewID;
      ++NewID;
    });
}
function QuestionInputChange(event){
  var senderDomElement = event.target;  
  var CleanID = GetCleanID(senderDomElement.id);
  QuestionsFields.forEach(Field => {
    if(Field.Identifier == CleanID){
      Field.Question = senderDomElement.value;
    }
  })
}
function MarkerNumberChange(event){
  var senderDomElement = event.target;  
  var CleanID = GetCleanID(senderDomElement.id);
  QuestionsFields.forEach(Field => {
    if(Field.Identifier == CleanID){
      Field.Markers = parseInt(senderDomElement.value);
    }
  })
  
}
function GetCleanID(RawId){
  var tempRawData = RawId.split("-");
  var CleanID = tempRawData[1];
  return CleanID;
}
function SetUpTest(){
    document.getElementById("SubmitButton").addEventListener("click", OnSubmit);
    var test = document.getElementById("SubmitButton");
    document.getElementById("AddButton").addEventListener("click", AddQuestionField);
    document.getElementById("RefreshButton").addEventListener("click", OnRefresh)
    document.getElementById("TestNameField").addEventListener("input", TestNameChanged);
    var QuestionField = {
      Identifier : 1,
      Question : "",
      Markers : 0
    }
    QuestionsFields = [];
    QuestionsFields.push(QuestionField);
    PopulateBody(QuestionsFields);   
}
function TestNameChanged(event){
  TestName = event.target.value;
}

function OnSubmit(event){
  var path = dialog.showOpenDialogSync({
    properties: ['openDirectory']
  });
  var TestPackage = {
    TestName : TestName,
    Path: path[0],
    Questions: QuestionsFields
  }
  ipcRenderer.send('GenerateTest', TestPackage)
}
function OnRefresh(){
  SetUpTest();
}
