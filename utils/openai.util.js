const { AzureOpenAI } = require("openai")
const moment = require("moment");
const path = require('path')
const fs = require('fs')

// You will need to set these environment variables or edit the following values
const endpoint = process.env["AZURE_OPENAI_ENDPOINT"] || "endpoint";
const apiKey = process.env["AZURE_OPENAI_API_KEY"] || "apiKey";
const apiVersion = "2023-03-15-preview";
const deployment = "AZURE_OPENAI_MODEL";

class OpenAIUtil {
  static async generateTestCases(testCaseTemplate, fileName) {
    const prompt = [testCaseTemplate]
    const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
    const completion = await client.completions.create({
      prompt, 
      model: deployment,
      max_tokens: 128
    });

    let text =  completion.choices[0].text
    let filePath = await this.getFilesFromCompletion(
      fileName,
      text
    );

    return filePath;
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

  static async generateTestScript(testScriptTemplate, filePath) {
    // Upload a file with an "assistants" purpose
    const apiVersion = "2024-02-15-preview";
    let deployment = "AZURE_OPENAI_MODEL";
    let client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
    const fileStream = fs.createReadStream(filePath);
    let assistantFile = await client.files.create({
      file: fileStream,
      purpose: "assistants",
    });// Create your File object
    
    deployment = "AZURE_OPENAI_MODEL";
    client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
    // Create an assistant using the file ID
    let assistant = await client.beta.assistants.create({
      instructions: testScriptTemplate,
      model: deployment,
      tools: [{ "type" : "code_interpreter" }],
      tool_resources: {
        "code_interpreter": {
          "file_ids": [assistantFile.id],
        }
      }
    });

    const files = [];

    for (let i = 0; i < assistant.content; i++) {
      let fileName = assistant.content[i].annotations.file_path.file_id;
      const response = await client.files.content(fileName);
      // Extract the binary data from the Response object
      const data = await response.arrayBuffer();

      // Convert the binary data to a Buffer
      const bufferData = Buffer.from(data);
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
