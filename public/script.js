async function sendSTK() {

  const amount =
    document.getElementById("amount").value;

  const rawNumbers =
    document.getElementById("numbers").value;

  const numbers = rawNumbers
    .split(/[\n,]+/)
    .map(n => n.trim())
    .filter(Boolean);

  const resultsDiv =
    document.getElementById("results");

  resultsDiv.innerHTML = "Processing...";

  try {

    const response = await fetch("/bulk-stk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount,
        numbers
      })
    });

    const data = await response.json();

    resultsDiv.innerHTML = "";

    data.results.forEach(item => {

      const div =
        document.createElement("div");

      div.className =
        "result-item " +
        (item.success
          ? "success"
          : "error");

      div.innerHTML = `
        <strong>${item.phone}</strong><br>
        ${item.success
          ? "STK Sent"
          : "Failed"}
      `;

      resultsDiv.appendChild(div);
    });

  } catch (error) {

    resultsDiv.innerHTML = `
      <div class="result-item error">
        ${error.message}
      </div>
    `;
  }
}
