document.getElementById('clear-data').addEventListener('click', function() {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      localStorage.clear();
      displayIncomeEntries();
      displayExpenseEntries();
      if (incomeChart) {
        incomeChart.destroy();
      }
      alert("All data has been cleared.");
    }
});  

document.getElementById('export-data').addEventListener('click', function() {
    const incomeEntries = JSON.parse(localStorage.getItem('incomeEntries')) || [];
    const expenseEntries = JSON.parse(localStorage.getItem('expenseEntries')) || [];
    const data = {
      incomeEntries,
      expenseEntries
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "financial_data.json");
    document.body.appendChild(downloadAnchorNode); // Required for Firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
});
 
document.getElementById('import-data').addEventListener('click', function() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';
  
    fileInput.addEventListener('change', function(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = function(e) {
        const data = JSON.parse(e.target.result);
        localStorage.setItem('incomeEntries', JSON.stringify(data.incomeEntries || []));
        localStorage.setItem('expenseEntries', JSON.stringify(data.expenseEntries || []));
        displayIncomeEntries();
        displayExpenseEntries();
        if (incomeChart) {
          updateChart();
        }
        alert("Data imported successfully.");
      };
      reader.readAsText(file);
    });
  
    fileInput.click();
});

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
  
    // Sort by date in descending order
    incomeEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
  
    incomeEntries.forEach((entry, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.source}</td>
        <td>$${entry.amount}</td>
        <td>${entry.notes ? entry.notes : ''}</td>
        <td><button class="edit-button" data-index="${index}" data-type="income">Edit</button></td>
      `;
      incomeSection.appendChild(row);
    });
  
    addEditButtonListeners();
}
  
  function displayExpenseEntries() {
    const expenseSection = document.getElementById('expense-entries-section');
    expenseSection.innerHTML = '<tr><th colspan="4">Expenses</th></tr>'; // Clear existing entries
  
    const expenseEntries = JSON.parse(localStorage.getItem('expenseEntries')) || [];
  
    // Sort by date in descending order
    expenseEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
  
    expenseEntries.forEach((entry, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.category}</td>
        <td>$${entry.amount}</td>
        <td>${entry.description ? entry.description : ''}</td>
        <td><button class="edit-button" data-index="${index}" data-type="expense">Edit</button></td>
      `;
      expenseSection.appendChild(row);
    });
  
    addEditButtonListeners();
}
  
function addEditButtonListeners() {
    const editButtons = document.querySelectorAll('.edit-button');
    editButtons.forEach(button => {
      button.addEventListener('click', function() {
        const index = this.getAttribute('data-index');
        const type = this.getAttribute('data-type');
  
        if (type === 'income') {
          const incomeEntries = JSON.parse(localStorage.getItem('incomeEntries')) || [];
          const entry = incomeEntries[index];
  
          // Populate the form with the existing data
          document.getElementById('income-date').value = entry.date;
          document.getElementById('income-source').value = entry.source;
          document.getElementById('income-amount').value = entry.amount;
          document.getElementById('income-notes').value = entry.notes;
  
          // Remove the old entry
          incomeEntries.splice(index, 1);
          localStorage.setItem('incomeEntries', JSON.stringify(incomeEntries));
        } else if (type === 'expense') {
          const expenseEntries = JSON.parse(localStorage.getItem('expenseEntries')) || [];
          const entry = expenseEntries[index];
  
          // Populate the form with the existing data
          document.getElementById('expense-date').value = entry.date;
          document.getElementById('expense-category').value = entry.category;
          document.getElementById('expense-amount').value = entry.amount;
          document.getElementById('expense-description').value = entry.description;
  
          // Remove the old entry
          expenseEntries.splice(index, 1);
          localStorage.setItem('expenseEntries', JSON.stringify(expenseEntries));
        }
  
        // Update the display after removing the entry
        displayIncomeEntries();
        displayExpenseEntries();
      });
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
      backgroundColor: totalExpenses > totalIncome ? ['#ffff00', '#ff0000'] : ['#00ff00', '#ff0000'],
    }],
    labels: totalExpenses > totalIncome ? ['Exceeded Expenses', 'Expenses'] : ['Remaining Income', 'Expenses']
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
  
