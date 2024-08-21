// This file contains all the functions used in scripts.js for the FinanceWebApp project!

// displayIncomeEntries
// This function
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

// displayExpenseEntries
// This function
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

// addEditButtonListeners
// This function 
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

// variables used in updateChart()
let incomeChart, expenseChart;
// updateChart
// This function will update the chart based on the relationship between Income and Expenses
function updateChart() {
  const incomeEntries = JSON.parse(localStorage.getItem('incomeEntries')) || [];
  const expenseEntries = JSON.parse(localStorage.getItem('expenseEntries')) || [];

  const totalIncome = incomeEntries.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
  const totalExpenses = expenseEntries.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);

  const chartElement = document.getElementById('income-expense-chart').getContext('2d');

  const chartData = {
    datasets: [{
      data: [totalIncome - totalExpenses, totalExpenses],
      backgroundColor: totalExpenses > totalIncome ? ['#ffa500', '#ff0000'] : ['#00ff00', '#ff0000'],
    }],
    labels: totalExpenses > totalIncome ? ['Exceeded', 'Expenses'] : ['Remaining', 'Expenses']
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

// parseTextFile
// This function will search through the txt file for patterns that match the export format only (for now)
function parseTextFile(textContent) {
    const incomeEntries = [];
    const expenseEntries = [];
  
    const lines = textContent.split('\n');
    let currentSection = '';
  
    lines.forEach(line => {
      line = line.trim();
  
      if (line === 'Income Entries:') {
        currentSection = 'income';
      } else if (line === 'Expense Entries:') {
        currentSection = 'expense';
      } else if (line !== '') {
        const parts = line.split(', ');
        const date = parts[0].split(': ')[1];
        const categoryOrSource = parts[1].split(': ')[1];
        const amount = parseFloat(parts[2].split(': ')[1].replace('$', ''));
        const descriptionOrNotes = parts[3] ? parts[3].split(': ')[1] : '';
  
        if (currentSection === 'income') {
          incomeEntries.push({ date, source: categoryOrSource, amount, notes: descriptionOrNotes });
        } else if (currentSection === 'expense') {
          expenseEntries.push({ date, category: categoryOrSource, amount, description: descriptionOrNotes });
        }
      }
    });
  
    localStorage.setItem('incomeEntries', JSON.stringify(incomeEntries));
    localStorage.setItem('expenseEntries', JSON.stringify(expenseEntries));
    
    displayIncomeEntries();
    displayExpenseEntries();
    if (incomeChart) {
      updateChart();
    }
  
    alert("Data imported successfully.");
}