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
        <td>$${parseFloat(entry.amount).toFixed(2)}</td>
        <td>${entry.notes ? entry.notes : ''}</td>
        <td class="edit-td"><button class="edit-button" data-index="${index}" data-type="income">Edit</button></td>
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
        <td>$${parseFloat(entry.amount).toFixed(2)}</td>
        <td>${entry.description ? entry.description : ''}</td>
        <td class="edit-td"><button class="edit-button" data-index="${index}" data-type="expense">Edit</button></td>
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
  
    //alert("Data imported successfully.");
}

// generatePlannerView
// This function will generate a calender type of view for users to estimate their budget for the month
function generatePlannerView() {
    const incomeEntries = JSON.parse(localStorage.getItem('incomeEntries')) || [];
    const expenseEntries = JSON.parse(localStorage.getItem('expenseEntries')) || [];
  
    const allEntries = [...incomeEntries, ...expenseEntries];
    
    // Extract unique months and sort them in order (January to December)
    const months = [...new Set(allEntries.map(entry => entry.date.slice(0, 7)))];
    months.sort(); // Sort months in YYYY-MM order
  
    const plannerContainer = document.getElementById('planner-container');
    plannerContainer.innerHTML = ''; // Clear previous content
  
    let cumulativeBalance = 0; // Initialize cumulative balance
  
    const monthNames = [
      "January", "February", "March", "April", "May", "June", "July", 
      "August", "September", "October", "November", "December"
    ];
  
    months.forEach(month => {
      const [year, monthNumber] = month.split('-');
      const daysInMonth = new Date(year, monthNumber, 0).getDate();
      const calendar = document.createElement('div');
      calendar.className = 'calendar';
  
      // Convert month number to month name
      const monthName = monthNames[parseInt(monthNumber, 10) - 1];
  
      calendar.innerHTML = `<h3>${monthName} ${year}</h3>`;
  
      let dailyBalance = cumulativeBalance; // Start each month with the cumulative balance
      let calendarRow = document.createElement('div');
      calendarRow.className = 'calendar-row';
  
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${month}-${String(day).padStart(2, '0')}`;
        
        // Adjust balance based on income/expenses for the current day
        incomeEntries.forEach(entry => {
          if (entry.date === dateStr) dailyBalance += parseFloat(entry.amount);
        });
        expenseEntries.forEach(entry => {
          if (entry.date === dateStr) dailyBalance -= parseFloat(entry.amount);
        });
  
        const dayBox = document.createElement('div');
        dayBox.className = 'day-box';
        const balanceClass = dailyBalance < 0 ? 'negative-balance' : 'positive-balance';
        dayBox.innerHTML = `<h3 class="day-num">${day}</h3><br><span class="${balanceClass}">$${dailyBalance.toFixed(2)}</span>`;
        calendarRow.appendChild(dayBox);
  
        // Start a new row every 7 days
        if (day % 7 === 0 || day === daysInMonth) {
          calendar.appendChild(calendarRow);
          calendarRow = document.createElement('div');
          calendarRow.className = 'calendar-row';
        }
      }
  
      // Update cumulative balance to carry over to the next month
      cumulativeBalance = dailyBalance;
  
      plannerContainer.appendChild(calendar);
    });
}

// variables used in generateBudgetChart()
let budgetChart532, budgetChart721;
// 
//
function generateBudgetCharts() {
  const expenseEntries = JSON.parse(localStorage.getItem('expenseEntries')) || [];
  
  let total = { Need: 0, Investment: 0, Want: 0 };
  
  expenseEntries.forEach(entry => {
    total[entry.description] += parseFloat(entry.amount);
  });

  // Data for the 50/30/20 chart
  const chartData532 = {
    labels: ['Needs', 'Investments', 'Wants'],
    datasets: [{
      data: [total.Need.toFixed(2), total.Investment.toFixed(2), total.Want.toFixed(2)],
      backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe'],
    }]
  };

  // Data for the 70/20/10 chart
  const chartData721 = {
    labels: ['Needs', 'Investments', 'Wants'],
    datasets: [{
      data: [(total.Need * 70 / 50).toFixed(2), (total.Investment * 20 / 30).toFixed(2), (total.Want * 10 / 20).toFixed(2)],
      backgroundColor: ['#ff9f40', '#4bc0c0', '#ffcd56'],
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
  };

  // Generate 50/30/20 chart
  const chartElement532 = document.getElementById('budget-chart-532').getContext('2d');
  if (budgetChart532) {
    budgetChart532.destroy();
  }
  budgetChart532 = new Chart(chartElement532, {
    type: 'doughnut',
    data: chartData532,
    options: chartOptions,
  });

  // Generate 70/20/10 chart
  const chartElement721 = document.getElementById('budget-chart-721').getContext('2d');
  if (budgetChart721) {
    budgetChart721.destroy();
  }
  budgetChart721 = new Chart(chartElement721, {
    type: 'doughnut',
    data: chartData721,
    options: chartOptions,
  });
}