const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;
const bodyParser = require("body-parser");
const fs = require("fs");
const fileUpload = require("express-fileupload");
const moment = require("moment");
const archiver = require("archiver");
const OpenAIUtil  = require("./utils/openai.util");

app.use(express.static(path.join(__dirname)));
app.use(fileUpload());
app.set("views", [path.join(__dirname, "/views")]);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", function (req, res) {
  res.render("pages/index.ejs");
});

app.get("/testcase", function (req, res) {
  res.render("pages/testcase.ejs");
});

app.get("/testdata", function (req, res) {
  res.render("pages/testdata.ejs");
});

app.get("/testscript", function (req, res) {
  res.render("pages/testscript.ejs");
});

app.listen(PORT, (error) => {
  console.log("Server is Successfully Running");
});

app.post("/testCaseGenerator", async (req, res) => {
  let tcDesc = req.body.tcDesc,
    userInput = req.body.userInput,
    testCaseTemplate
  let scenarioTCTemplate = `Generate all the critical scenarios, any additional scenarios to provide comprehensive coverage and edge cases for ${tcDesc} using JIRA Test Case template sections Test Case ID,Summary starting with verify, Preconditions, Test Steps, Expected Result, Priority, Labels, Test Type in a comma separated csv file`;

  let acTestCaseTemplate = `Generate all the critical scenarios, any additional scenarios to provide comprehensive coverage and edge cases for for below acceptance criteria using JIRA Test Case template sections Test Case ID,Summary starting with verify, Preconditions, Test Steps, Expected Result, Priority, Labels, Test Type in a comma separated csv file
        Acceptance Criteria: `;

  if (userInput === "scenario") {
    testCaseTemplate = scenarioTCTemplate;
  } else {
    testCaseTemplate = acTestCaseTemplate;
  }
  let fileName = `TestCases_${moment().format("YYYYMMDD_hhmmss")}.csv`;
  let filePath = await OpenAIUtil.generateTestCases(testCaseTemplate, fileName);
  res.setHeader("Content-Disposition", "attachment; filename=" + fileName);
  res.sendFile(filePath)
});

app.post("/testDataGenerator", async (req, res) => {
  let swagger = req.body.swagger,
    endpoint = req.body.endpoint;
  let testDataTemplate = `Generate all the possible combinations of test data based on the ${swagger} and the ${endpoint}`;
  let fileName = `TestData_${moment().format("YYYYMMDD_hhmmss")}.txt`;
  let filePath = await OpenAIUtil.generateTestData(testDataTemplate, fileName);
  res.setHeader("Content-Disposition", "attachment; filename=" + fileName);
  res.sendFile(filePath);
});

app.post("/upload", async (req, res) => {
  var language = req.headers.language,
    tool = req.headers.tool,
    autoFramework = req.headers.framework;
  var framework = autoFramework !== '-' ? autoFramework : ''
  let testScriptTemplate = `Generate automation scripts with page objects classes in ${tool} and ${language} with ${framework} framework for the test cases in the uploaded csv file`;
  if (!req.files) {
    return res.status(400).send("No files were uploaded.");
  }
  let tempFolder = path.join(__dirname, "/uploads");
  if (!fs.existsSync(tempFolder)) {
    fs.mkdirSync(tempFolder, { recursive: true });
  }
  const file = req.files.file;
  let filePath = path.join(tempFolder, file.name);

  // Convert the binary data to a Buffer
  const bufferData = Buffer.from(file.data);
  fs.writeFileSync(filePath, bufferData, (err) => {
    // In case of a error throw err.
    if (err) throw err;
    console.log("File written successfully");
  });

  let files = await OpenAIUtil.generateTestScript(testScriptTemplate, filePath);
  const zip = archiver("zip", {
    zlib: { level: 9 }, // Sets the compression level.
  });

  // Set the response headers
  res.attachment("TestScripts.zip");

  zip.pipe(res);
  files.forEach((file) => {
    zip.file(file.path, { name: file.name });
  });

  zip.finalize();
});
