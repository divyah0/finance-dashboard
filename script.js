let role = "viewer";

let transactions = JSON.parse(localStorage.getItem("transactions")) || [
  { date: "2026-04-01", amount: 5000, category: "Salary", type: "income" },
  { date: "2026-04-02", amount: 1000, category: "Food", type: "expense" }
];

let trendChart, categoryChart;

// Role change
document.getElementById("roleSelect").addEventListener("change", (e) => {
  role = e.target.value;

  document.getElementById("adminActions").style.display =
    role === "admin" ? "block" : "none";

  document.getElementById("actionHeader").style.display =
    role === "admin" ? "table-cell" : "none";

  init();
});

// Dark mode
function toggleTheme() {
  document.body.classList.toggle("dark");
}

// Balance
function getBalance() {
  let income = 0, expense = 0;

  transactions.forEach(t => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  });

  return income - expense;
}

// Show form
function showForm() {
  document.getElementById("formBox").style.display = "block";
}

// Save transaction
function saveTransaction() {
  const amount = Number(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const type = document.getElementById("type").value;

  if (!amount || !category) {
    alert("Enter all fields");
    return;
  }

  if (type === "expense" && amount > getBalance()) {
    alert("Insufficient balance!");
    return;
  }

  transactions.push({
    date: new Date().toISOString().split("T")[0],
    amount,
    category,
    type
  });

  localStorage.setItem("transactions", JSON.stringify(transactions));

  document.getElementById("formBox").style.display = "none";

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
    table.innerHTML = "<tr><td colspan='5'>No transactions found</td></tr>";
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
  let income = 0, expense = 0;
  let map = {};

  transactions.forEach(t => {
    if (t.type === "income") income += t.amount;
    else {
      expense += t.amount;
      map[t.category] = (map[t.category] || 0) + t.amount;
    }
  });

  if (transactions.length === 0) {
    document.getElementById("insightsText").innerText = "No data available";
    return;
  }

  let maxCategory = Object.keys(map).length
    ? Object.keys(map).reduce((a, b) => map[a] > map[b] ? a : b)
    : "N/A";

  document.getElementById("insightsText").innerText =
    `Total Income: ₹${income}, Total Expense: ₹${expense}. Highest spending on: ${maxCategory}`;
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