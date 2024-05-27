var language = document.getElementById("language"),
  tool = document.getElementById("tool"),
  framework = document.getElementById("framework");

onLoad();

function onLoad() {
  document.querySelector("#overlay").style.visibility = "hidden";
}

const uploadForm = document.querySelector(".upload");
uploadForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  document.querySelector("#overlay").style.visibility = "visible";
  const data = {
    language: language.value,
    tool: tool.value,
  };
  let file = e.target.uploadFile.files[0];
  let formData = new FormData();
  formData.append("file", file);
  let response = await fetch("/upload", {
    method: "POST",
    body: formData,
    headers: {
      language: data.language,
      tool: data.tool,
    },
  });

  let scriptData = await response.blob();

  const downloadExcelObjectURL = URL.createObjectURL(scriptData);
  downloadFileLink.href = downloadExcelObjectURL;
  downloadFileLink.setAttribute("download", "TestScripts.zip");
  document.querySelector("#overlay").style.visibility = "hidden";
  downloadFileLink.style.visibility = "visible";
});

function changeTools() {
  if (tool.value == "selenium") {
    language.innerHTML = "";
    language.innerHTML += "<option value=csharp> C#</option>";
    language.innerHTML += "<option value=java> Java</option>";
    language.innerHTML += "<option value=javascript> Javascript</option>";
    language.innerHTML += "<option value=python> Python</option>";
    framework.innerHTML = "";
    framework.innerHTML += "<option value=nunit> NUnit</option>";
    framework.innerHTML += "<option value=specflow> SpecFlow</option>";
  } else if (tool.value == "webdriverio") {
    language.innerHTML = "";
    language.innerHTML += "<option value=javascript> Javascript</option>";
    language.innerHTML += "<option value=typescript> Typescript</option>";
    framework.innerHTML = "";
    framework.innerHTML += "<option value=mocha> Mocha</option>";
    framework.innerHTML += "<option value=cucumber> Cucumber</option>";
  } else if (tool.value == "playwright") {
    language.innerHTML = "";
    language.innerHTML += "<option value=javascript> Javascript</option>";
    language.innerHTML += "<option value=typescript> Typescript</option>";
    framework.innerHTML = "";
    framework.innerHTML += "<option value=na> - </option>";
  } else if (tool.value == "pupeteer") {
    language.innerHTML = "";
    language.innerHTML += "<option value=javascript> Javascript</option>";
    framework.innerHTML = "";
    framework.innerHTML += "<option value=na> - </option>";
  }
}

function changeLanguage() {
  if (language.value == "csharp") {
    framework.innerHTML = "";
    framework.innerHTML += "<option value=nunit> NUnit</option>";
    framework.innerHTML += "<option value=nunit> SpecFlow</option>";
  } else if (language.value == "javascript") {
    framework.innerHTML = "";
    framework.innerHTML += "<option value=pom> POM</option>";
  } else if (language.value == "java") {
    framework.innerHTML = "";
    framework.innerHTML += "<option value=testng> TestNG</option>";
    framework.innerHTML += "<option value=cucumber> Cucumber</option>";
  } else if (language.value == "python") {
    framework.innerHTML = "";
    framework.innerHTML += "<option value=pytest> PyTest</option>";
    framework.innerHTML += "<option value=robot> Robot</option>";
  }
}
