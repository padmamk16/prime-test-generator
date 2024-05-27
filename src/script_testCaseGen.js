var tcDesc = document.getElementById("tcDesc"),
  bdd = document.getElementById("bdd"),
  downloadFileLink = document.getElementById("downloadFileLink");

onLoad();

function onLoad() {
  document.querySelector("#overlay").style.visibility = "hidden";
}

async function updateMessage(value) {
  if (value === "scenario") {
    tcDesc.placeholder = `Enter single scenario like 'user login flow' or multiple scenarios separated by semi-colon like 'user login flow; search flights in makemytrip.com'`;
  } else {
    tcDesc.placeholder = `Provide your acceptance criteria like below
    For a checkout page on a store’s website:

    PayPal, Google Pay, Apple Pay, and all major credit cards can be used to complete the transaction
    Shopping cart item(s) are displayed
    Items can be deleted from the shopping cart
    User is prompted to log in if they aren’t already `;
  }
}
async function generateTestCase() {
  var tcDescription = tcDesc.value,
    userInput;
  if (document.getElementById("scenario").checked) {
    userInput = document.getElementById("scenario").value;
  } else {
    userInput = document.getElementById("ac").value;
  }

  if (tcDescription === "") {
    alert("Enter the scenario or acceptance criteria to generate test cases!");
    return false;
  }
  const data = {
    tcDesc: tcDescription,
    userInput: userInput,
  };
  document.querySelector("#overlay").style.visibility = "visible";
  let response = await fetch("/testCaseGenerator", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  let excelData = await response.blob();
  let resHeader = response.headers.get("Content-Disposition");
  let fileName = resHeader.toString().split("filename=")[1];
  const downloadExcelObjectURL = URL.createObjectURL(excelData);
  downloadFileLink.href = downloadExcelObjectURL;
  downloadFileLink.setAttribute("download", fileName);
  document.querySelector("#overlay").style.visibility = "hidden";
  downloadFileLink.style.visibility = "visible";
}
