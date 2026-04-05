let role = "viewer";

let transactions = JSON.parse(localStorage.getItem("transactions")) || [
  { date: "2026-04-01", amount: 5000, category: "Salary", type: "income" },
  { date: "2026-04-02", amount: 1000, category: "Food", type: "expense" }
];

let trendChart, categoryChart;

// Role switch
document.getElementById("roleSelect").addEventListener("change", (e) => {
  role = e.target.value;

  document.getElementById("adminActions").style.display =
    role === "admin" ? "block" : "none";

  document.getElementById("actionHeader").style.display =
    role === "admin" ? "table-cell" : "none";

  init();
});

// Get balance
function getBalance() {
  let income = 0, expense = 0;

  transactions.forEach(t => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  });

  return income - expense;
}

// Add transaction (FIXED)
function addTransaction() {
  const amount = Number(prompt("Enter amount:"));
  const category = prompt("Enter category:");
  const type = prompt("income/expense");

  if (!amount || !category || !type) return;

  // ❗ VALIDATION
  if (type === "expense" && amount > getBalance()) {
    alert("⚠️ Insufficient balance! Cannot add this expense.");
    return;
  }

  transactions.push({
    date: new Date().toISOString().split("T")[0],
    amount,
    category,
    type
  });

  localStorage.setItem("transactions", JSON.stringify(transactions));
  init();
}

// Delete
function deleteTransaction(index) {
  transactions.splice(index, 1);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  init();
}

// Table
function renderTransactions(data) {
  const table = document.getElementById("transactionTable");
  table.innerHTML = "";

  if (data.length === 0) {
    table.innerHTML = "<tr><td colspan='5'>No Data</td></tr>";
    return;
  }

  data.forEach((t, i) => {
    table.innerHTML += `
      <tr>
        <td>${t.date}</td>
        <td>₹${t.amount}</td>
        <td>${t.category}</td>
        <td>${t.type}</td>
        ${role === "admin" ? `<td><button onclick="deleteTransaction(${i})">❌</button></td>` : ""}
      </tr>
    `;
  });
}

// Summary
function calculateSummary() {
  let income = 0, expense = 0;

  transactions.forEach(t => {
    t.type === "income" ? income += t.amount : expense += t.amount;
  });

  document.getElementById("balanceCard").innerText = "Balance: ₹" + (income - expense);
  document.getElementById("incomeCard").innerText = "Income: ₹" + income;
  document.getElementById("expenseCard").innerText = "Expenses: ₹" + expense;
}

// Insights
function renderInsights() {
  let map = {};

  transactions.forEach(t => {
    if (t.type === "expense") {
      map[t.category] = (map[t.category] || 0) + t.amount;
    }
  });

  if (Object.keys(map).length === 0) {
    document.getElementById("insightsText").innerText = "No Data";
    return;
  }

  let max = Object.keys(map).reduce((a, b) => map[a] > map[b] ? a : b);

  document.getElementById("insightsText").innerText =
    `Highest spending category: ${max}`;
}

// Search
document.getElementById("search").addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();

  const filtered = transactions.filter(t =>
    t.category.toLowerCase().includes(value)
  );

  renderTransactions(filtered);
});

// Charts
function renderCharts() {
  const trendCtx = document.getElementById("trendChart");
  const catCtx = document.getElementById("categoryChart");

  if (trendChart) trendChart.destroy();
  if (categoryChart) categoryChart.destroy();

  trendChart = new Chart(trendCtx, {
    type: "line",
    data: {
      labels: transactions.map(t => t.date),
      datasets: [{
        label: "Amount",
        data: transactions.map(t => t.amount)
      }]
    }
  });

  const map = {};
  transactions.forEach(t => {
    map[t.category] = (map[t.category] || 0) + t.amount;
  });

  categoryChart = new Chart(catCtx, {
    type: "pie",
    data: {
      labels: Object.keys(map),
      datasets: [{
        data: Object.values(map)
      }]
    }
  });
}

// Init
function init() {
  renderTransactions(transactions);
  calculateSummary();
  renderInsights();
  renderCharts();
}

init();