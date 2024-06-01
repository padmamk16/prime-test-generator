const { AzureOpenAI } = require("openai")
const path = require('path')
const fs = require('fs')
const jp = require('jsonpath')

// You will need to set these environment variables or edit the following values
const endpoint = process.env["AZURE_OPENAI_ENDPOINT"] || "endPoint";
const apiKey = process.env["AZURE_OPENAI_API_KEY"] || "apikey";
const apiVersion = "2023-03-15-preview";
const deployment = "gpt-35-turbo-instruct-test";

class OpenAIUtil {
  static async generateTestCases(testCaseTemplate, fileName) {
    const prompt = [testCaseTemplate]
    const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
    const completion = await client.completions.create({
      prompt,
      model: deployment,
      max_tokens: 128
    });
    let text = completion.choices[0].text.replace(/\n\n/g,'\n')
    return text;
  }

  static async generateTestData(testDataTemplate, fileName) {
    const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
    const completion = await client.completions.create({
      model: deployment,
      prompt: testDataTemplate,
      max_tokens: 128
    });

    let filePath = await this.getFilesFromCompletion(
      fileName,
      completion.choices[0].text
    );

    return filePath;
  }

  static async getFilesFromCompletion(fileName, text) {
    let tempFolder = path.join(__dirname, "/downloads");
    if (!fs.existsSync(tempFolder)) {
      fs.mkdirSync(tempFolder, { recursive: true });
    }

    fs.writeFileSync(`${tempFolder}\\${fileName}`, text, (err) => {
      // In case of a error throw err.
      if (err) throw err;
      console.log("File written successfully");
    });
    return `${tempFolder}\\${fileName}`;
  }

  static async generateTestScript(testScriptTemplate, filePath, language) {
    // Upload a file with an "assistants" purpose
    let apiVersion = "2024-02-15-preview";
    let deployment = "gpt-35-turbo-test";
    let client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
    let fileStream = fs.createReadStream(filePath);
    let assistantFile = await client.files.create({
      file: fileStream,
      purpose: "assistants",
    });// Create your File object

    deployment = "gpt-4-test"
    client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
    // Create an assistant using the file ID
    let assistant = await client.beta.assistants.create({
      instructions: testScriptTemplate,
      model: "gpt-4-1106-preview",
      tools: [{ "type": "code_interpreter" }],
      "file_ids": [assistantFile.id]
    });

    const files = [];

    for (let i = 0; i < assistant.content; i++) {
      let file = jp.query(assistant.content[i], '$..file_id');
      const response = await client.files.content(file);
      // Extract the binary data from the Response object
      const data = await response.arrayBuffer();

      // Convert the binary data to a Buffer
      const bufferData = Buffer.from(data);
      let fileName = `Code${i + 1}`
      if (language === 'csharp') {
        fileName += '.cs'
      } else if (language === 'java') {
        fileName += '.java'
      } else if (language === 'javascript') {
        fileName += '.js'
      } else {
        fileName += '.py'
      }
      let filePath = `${tempFolder}\\${fileName}`;
      fs.writeFileSync(filePath, bufferData, (err) => {
        // In case of a error throw err.
        if (err) throw err;
        console.log("File written successfully");
      });

      files.push({ name: fileName, path: filePath });
    }
    return files
  }
}

module.exports = OpenAIUtil;
