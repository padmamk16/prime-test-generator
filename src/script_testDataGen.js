var swagger = document.getElementById("swagger"),
  endpoint = document.getElementById("endpoint"),
  downloadFileLink = document.getElementById("downloadFileLink");

onLoad();

function onLoad() {
  document.querySelector("#overlay").style.visibility = "hidden";
}

async function generateTestData() {
  if (swagger.value === "" && endpoint.value === "") {
    alert("Enter the swagger url and endpoint to generate test data!");
    return false;
  } else if (swagger.value === "" && endpoint !== "") {
    alert("Enter the swagger url to generate test data!");
    return false;
  } else if (swagger.value !== "" && endpoint === "") {
    alert("Enter the endpoint to generate test data!");
    return false;
  }

  const data = {
    swagger: swagger.value,
    endpoint: endpoint.value,
  };

  document.querySelector("#overlay").style.visibility = "visible";
  let response = await fetch("/testDataGenerator", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  let resData = await response.blob();
  let resHeader = response.headers.get("Content-Disposition");
  let fileName = resHeader.toString().split("filename=")[1];
  document.querySelector("#overlay").style.visibility = "hidden";

  const downloadObjectURL = URL.createObjectURL(resData);
  downloadFileLink.style.visibility = "visible";

  downloadFileLink.href = downloadObjectURL;
  downloadFileLink.setAttribute("download", fileName);
}
