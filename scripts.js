document.getElementById('income-form').addEventListener('submit', function(e) {
    e.preventDefault();
  
    // Get form values
    const date = document.getElementById('income-date').value;
    const source = document.getElementById('income-source').value;
    const amount = document.getElementById('income-amount').value;
    const notes = document.getElementById('income-notes').value;
  
    // Create an income entry object
    const incomeEntry = { date, source, amount, notes };
  
    // Retrieve existing income entries from localStorage or initialize an empty array
    let incomeEntries = JSON.parse(localStorage.getItem('incomeEntries')) || [];
  
    // Add the new income entry to the array
    incomeEntries.push(incomeEntry);
  
    // Save the updated income entries array back to localStorage
    localStorage.setItem('incomeEntries', JSON.stringify(incomeEntries));
  
    console.log('Income Added:', incomeEntry);
  
    // Clear the form
    this.reset();
});
  
  
document.getElementById('expense-form').addEventListener('submit', function(e) {
    e.preventDefault();
  
    // Get form values
    const date = document.getElementById('expense-date').value;
    const category = document.getElementById('expense-category').value;
    const amount = document.getElementById('expense-amount').value;
    const description = document.getElementById('expense-description').value;
  
    // Create an expense entry object
    const expenseEntry = { date, category, amount, description };
  
    // Retrieve existing expense entries from localStorage or initialize an empty array
    let expenseEntries = JSON.parse(localStorage.getItem('expenseEntries')) || [];
  
    // Add the new expense entry to the array
    expenseEntries.push(expenseEntry);
  
    // Save the updated expense entries array back to localStorage
    localStorage.setItem('expenseEntries', JSON.stringify(expenseEntries));
  
    console.log('Expense Added:', expenseEntry);
  
    // Clear the form
    this.reset();
});


// Function to display table
document.getElementById('table-tab').addEventListener('click', function() {
    document.getElementById('table-tab').classList.add('active');
    document.getElementById('chart-tab').classList.remove('active');
    document.getElementById('table-view').style.display = 'block';
    document.getElementById('chart-view').style.display = 'none';
});
  
function displayIncomeEntries() {
    const incomeSection = document.getElementById('income-entries-section');
    incomeSection.innerHTML = '<tr><th colspan="4">Income</th></tr>'; // Clear existing entries
  
    const incomeEntries = JSON.parse(localStorage.getItem('incomeEntries')) || [];
  
    incomeEntries.forEach((entry) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.source}</td>
        <td>$${entry.amount}</td>
        <td>${entry.notes ? entry.notes : ''}</td>
      `;
      incomeSection.appendChild(row);
    });
}
  
function displayExpenseEntries() {
    const expenseSection = document.getElementById('expense-entries-section');
    expenseSection.innerHTML = '<tr><th colspan="4">Expenses</th></tr>'; // Clear existing entries
  
    const expenseEntries = JSON.parse(localStorage.getItem('expenseEntries')) || [];
  
    expenseEntries.forEach((entry) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.category}</td>
        <td>$${entry.amount}</td>
        <td>${entry.description ? entry.description : ''}</td>
      `;
      expenseSection.appendChild(row);
    });
}
  
// Call these functions after adding a new entry
document.getElementById('income-form').addEventListener('submit', function() {
    displayIncomeEntries();
});
  
document.getElementById('expense-form').addEventListener('submit', function() {
    displayExpenseEntries();
});
  
// Initial display when the page loads
displayIncomeEntries();
displayExpenseEntries();
  

// Function to display chart
document.getElementById('chart-tab').addEventListener('click', function() {
    document.getElementById('chart-tab').classList.add('active');
    document.getElementById('table-tab').classList.remove('active');
    document.getElementById('table-view').style.display = 'none';
    document.getElementById('chart-view').style.display = 'block';
    updateChart();
});
  
let incomeChart, expenseChart;

function updateChart() {
  const incomeEntries = JSON.parse(localStorage.getItem('incomeEntries')) || [];
  const expenseEntries = JSON.parse(localStorage.getItem('expenseEntries')) || [];

  const totalIncome = incomeEntries.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
  const totalExpenses = expenseEntries.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);

  const chartElement = document.getElementById('income-expense-chart').getContext('2d');

  const chartData = {
    datasets: [{
      data: [totalIncome - totalExpenses, totalExpenses],
      backgroundColor: totalExpenses > totalIncome ? ['#00ff00', '#ff0000'] : ['#00ff00', '#ff0000'],
    }],
    labels: ['Remaining Income', 'Expenses']
  };

  const chartOptions = {
    responsive: false,  
    maintainAspectRatio: false,  
    cutout: '75%',
    plugins: {
      centerText: true, // Use the custom plugin to draw text in the center
    }
  };

  if (incomeChart) {
    incomeChart.destroy();
  }

  incomeChart = new Chart(chartElement, {
    type: 'doughnut',
    data: chartData,
    options: chartOptions
  });
}

Chart.register({
    id: 'centerText',
    beforeDraw: function(chart) {
      if (chart.config.type === 'doughnut') {
        const ctx = chart.ctx;
        const width = chart.width;
        const height = chart.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Get totalIncome and totalExpenses
        const incomeEntries = JSON.parse(localStorage.getItem('incomeEntries')) || [];
        const expenseEntries = JSON.parse(localStorage.getItem('expenseEntries')) || [];
        const totalIncome = incomeEntries.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
        const totalExpenses = expenseEntries.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
  
        ctx.restore();
        
        // Display Income and Expenses text
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#00ff00'; // Green for income
        ctx.fillText(`Income: $${totalIncome}`, centerX, centerY);
        ctx.fillStyle = '#ff0000'; // Red for expenses
        ctx.fillText(`Expenses: $${totalExpenses}`, centerX, centerY + 30);
  
        ctx.save();
      }
    }
  });
  
