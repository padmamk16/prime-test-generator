const express = require('express');
const path = require('path')
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser')
const fs = require('fs')
const fileUpload = require("express-fileupload")
let filePath
const archiver = require('archiver')
const moment = require('moment')
//const OpenAI = require('openai')

//const openai = new OpenAI({ apiKey: 'My API Key' })

app.use(express.static(path.join(__dirname)))
app.use(fileUpload())
app.set('views', [
    path.join(__dirname, '/views')
])

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/', function (req, res) {
    res.render('pages/index.ejs');
});

app.get('/testcase', function (req, res) {
    res.render('pages/testcase.ejs');
});

app.get('/testdata', function (req, res) {
    res.render('pages/testdata.ejs');
});

app.get('/testscript', function (req, res) {
    res.render('pages/testscript.ejs');
});

app.listen(PORT, (error) => {
    console.log("Server is Successfully Running")
}
);

app.post('/testCaseGenerator', async (req, res) => {
    let tcDesc = req.body.tcDesc,
        isBdd = req.body.isBdd,
        userInput = req.body.userInput,
        fileName, testCaseTemplate
    let scenarioTCTemplate = `Generate all the critical scenarios, any additional scenarios to provide comprehensive coverage and edge cases for ${tcDesc} using JIRA Test Case template sections Test Case ID,Summary starting with verify, Preconditions, Test Steps, Expected Result, Priority, Labels, Test Type in a csv file`

    let acTestCaseTemplate = `Generate all the critical scenarios, any additional scenarios to provide comprehensive coverage and edge cases for for below acceptance criteria using JIRA Test Case template sections Test Case ID,Summary starting with verify, Preconditions, Test Steps, Expected Result, Priority, Labels, Test Type in a csv file
        Acceptance Criteria: `

    if (userInput === 'scenario') {
        testCaseTemplate = scenarioTCTemplate
    } else {
        testCaseTemplate = acTestCaseTemplate
    }

    let tempFolder = path.join(__dirname, '/downloads')
    if (!fs.existsSync(tempFolder)) {
        fs.mkdirSync(tempFolder, { recursive: true })
    }

    // const completion = await openai.chat.completions.create({
    //     model: 'gpt-3.5-turbo-instruct',
    //     prompt: testCaseTemplate
    // });

    // console.log(completion.choices[0]);
    let str = `Test Case ID,Summary,Preconditions,Test Steps,Expected Result,Priority,Labels,Test Type
TC001,Verify amount due is displayed in the emailed water bill statement,None,"1. Receive the emailed water bill statement.\n2. Open the email and review the bill statement.",The email displays the amount due prominently.,Critical,Billing,Functional
TC002,Verify due date is displayed in the emailed water bill statement,None,"1. Receive the emailed water bill statement.\n2. Open the email and review the bill statement.",The email displays the due date prominently.,Critical,Billing,Functional`

    fileName = `TestCases${moment().format('YYYYMMDD-hhmmss')}.csv`
    fs.writeFile(`${tempFolder}\\${fileName}`, str, (err) => {

        // In case of a error throw err.
        if (err) throw err;
    })
    res.setHeader(
        'Content-Disposition',
        'attachment; filename=' + fileName
      )
    res.sendFile(`${tempFolder}\\${fileName}`)

});

app.post('/testDataGenerator', async (req, res) => {
    let swagger = req.body.swagger,
        endpoint = req.body.endpoint,
        fileName = `TestData${moment().format('YYYYMMDD-hhmmss')}.txt`
    let testDataTemplate = `Generate all the possible combinations of test data based on the ${swagger} and the ${endpoint}`
    let str = `TestData`
    let tempFolder = path.join(__dirname, '/downloads')
    if (!fs.existsSync(tempFolder)) {
        fs.mkdirSync(tempFolder, { recursive: true })
    }
    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo-instruct',
        prompt: testDataTemplate
    });

    console.log(completion.choices[0]);
    fs.writeFile(`${tempFolder}\\${fileName}`, str, (err) => {

        // In case of a error throw err.
        if (err) throw err;
    })
    res.setHeader(
        'Content-Disposition',
        'attachment; filename=' + fileName
      )
    res.sendFile(`${tempFolder}\\${fileName}`)
})

app.post("/upload", async (req, res) => {
    var language = req.headers.language,
        tool = req.headers.tool
    if (!req.files) {
        return res.status(400).send("No files were uploaded.")
    }
    let tempFolder = path.join(__dirname, '/uploads')
    if (!fs.existsSync(tempFolder)) {
        fs.mkdirSync(tempFolder, { recursive: true })
    }
    const file = req.files.file
    filePath = path.join(tempFolder, file.name)

    file.mv(filePath, (err) => {

        // In case of a error throw err.
        if (err) throw err;

    });
    // let testScriptTemplate = `Generate page object and script files in Selenium and C# for the test cases in the uploaded csv file`

    // const completion = await openai.chat.completions.create({
    //     model: 'gpt-3.5-turbo-instruct',
    //     prompt: testScriptTemplate
    // });
    const file1Path = filePath; // Replace with your file 1 path
    const file2Path = filePath; // Replace with your file 2 path

    const files = [
        { name: 'file1.csv', path: filePath },
        { name: 'file2.csv', path: filePath }
    ];
    const zip = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });

    // Set the response headers
    res.attachment('files.zip')
   
    zip.pipe(res)
    files.forEach(file => {
        zip.file(file.path, { name: file.name });
    })

    zip.finalize()
});



