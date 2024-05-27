import OpenAI from "openai";
const moment = require("moment");
const openai = new OpenAI({ apiKey: "My API Key" });

class OpenAIUtil {
  static async generateTestCases(testCaseTemplate) {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: testCaseTemplate,
    });

    let fileName = `TestCases${moment().format("YYYYMMDD-hhmmss")}.csv`;
    let filePath = await this.getFilesFromCompletion(
      completion.content[0].csv_file,
      fileName
    );

    return filePath;
  }

  static async generateTestData(testDataTemplate) {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: testDataTemplate,
    });

    let fileName = `TestData${moment().format("YYYYMMDD-hhmmss")}.txt`;
    let filePath = await this.getFilesFromCompletion(
      completion.content[0].text_file,
      fileName
    );

    return filePath;
  }

  static async getFilesFromCompletion(file, fileName) {
    let tempFolder = path.join(__dirname, "/downloads");
    if (!fs.existsSync(tempFolder)) {
      fs.mkdirSync(tempFolder, { recursive: true });
    }

    const response = await openai.files.content(file.file_id);

    // Extract the binary data from the Response object
    const data = await response.arrayBuffer();

    // Convert the binary data to a Buffer
    const bufferData = Buffer.from(data);

    fs.writeFile(`${tempFolder}\\${fileName}`, bufferData, (err) => {
      // In case of a error throw err.
      if (err) throw err;
      console.log("File written successfully");
    });
    return `${tempFolder}\\${fileName}`;
  }

  static async generateTestScript(testScriptTemplate, filePath) {
    // Upload a file with an "assistants" purpose
    const assistantFile = await openai.files.create({
      file: fs.createReadStream(filePath),
      purpose: "assistants",
    });

    // Create an assistant using the file ID
    const assistant = await openai.beta.assistants.create({
      instructions: testScriptTemplate,
      model: "gpt-4o",
      tools: [{ type: "code_interpreter" }],
      tool_resources: {
        code_interpreter: {
          file_ids: [assistantFile.id],
        },
      },
    });

    const files = [];

    for (let i = 0; i < assistant.content; i++) {
      let fileName = assistant.content[i].annotations.file_path.file_id;
      const response = await openai.files.content(fileName);
      // Extract the binary data from the Response object
      const data = await response.arrayBuffer();

      // Convert the binary data to a Buffer
      const bufferData = Buffer.from(data);
      let filePath = `${tempFolder}\\${fileName}`;
      fs.writeFile(filePath, bufferData, (err) => {
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
