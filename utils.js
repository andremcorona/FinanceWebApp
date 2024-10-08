// This file contains all the functions used in scripts.js for the FinanceWebApp project!

// displayIncomeEntries
// This function
function displayIncomeEntries(dataKey = 'incomeEntries') {
    const incomeSection = document.getElementById('income-entries-section');
    incomeSection.innerHTML = '<tr><th colspan="4">Income</th></tr>'; // Clear existing entries
  
    const incomeEntries = JSON.parse(localStorage.getItem(dataKey)) || [];
  
    // Sort by date in descending order
    incomeEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
  
    incomeEntries.forEach((entry, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.source}</td>
        <td>$${parseFloat(entry.amount).toFixed(2)}</td>
        <td>${entry.occurrence ? entry.occurrence : ''}</td>
        <td class="edit-td"><button class="edit-button" data-index="${index}" data-type="income">Edit</button></td>
      `;
      incomeSection.appendChild(row);
    });
  
    addEditButtonListeners();
}

// displayExpenseEntries
// This function
function displayExpenseEntries(dataKey = 'expenseEntries') {
    const expenseSection = document.getElementById('expense-entries-section');
    expenseSection.innerHTML = '<tr><th colspan="4">Expenses</th></tr>'; // Clear existing entries
  
    const expenseEntries = JSON.parse(localStorage.getItem(dataKey)) || [];
  
    // Sort by date in descending order
    expenseEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
  
    expenseEntries.forEach((entry, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.category}</td>
        <td>$${parseFloat(entry.amount).toFixed(2)}</td>
        <td>${entry.tag ? entry.tag : ''}</td>
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
        const description = parts[3] ? parts[3].split(': ')[1] : '';
  
        if (currentSection === 'income') {
          incomeEntries.push({ date, source: categoryOrSource, amount, occurrence: description });
        } else if (currentSection === 'expense') {
          expenseEntries.push({ date, category: categoryOrSource, amount, tag: description });
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
  
    //let cumulativeBalance = 0; // Initialize cumulative balance
  
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
  
      let dailyBalance = 0; // Start each month with the cumulative balance
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
      //cumulativeBalance = dailyBalance;
  
      plannerContainer.appendChild(calendar);
    });
}

// variables used in updateChart()
let incomeChart, expenseChart;
// updateChart
// This function will update the chart based on the relationship between Income and Expenses
function updateChart(incomeKey = 'incomeEntries', expenseKey = 'expenseEntries') {
  const incomeEntries = JSON.parse(localStorage.getItem(incomeKey)) || [];
  const expenseEntries = JSON.parse(localStorage.getItem(expenseKey)) || [];

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

// variables used in generateBudgetComparison()
let budgetChart;
// 
// This function will generate the 
function generateBudgetComparison(incomeKey = 'incomeEntries', expenseKey = 'expenseEntries') {
  const incomeEntries = JSON.parse(localStorage.getItem(incomeKey)) || [];
  const expenseEntries = JSON.parse(localStorage.getItem(expenseKey)) || [];
  const totalIncome = incomeEntries.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);

  let total = { Need: 0, Investment: 0, Want: 0 };
  let totalExpenses = 0;
  

  expenseEntries.forEach(entry => {
    total[entry.tag] += parseFloat(entry.amount);
    totalExpenses += parseFloat(entry.amount);
  });

  const remainingIncome = totalIncome - totalExpenses;
  const needsPercent = (total.Need / totalIncome) * 100;
  const investmentsPercent = (total.Investment / totalIncome) * 100;
  const wantsPercent = (total.Want / totalIncome) * 100;

  // Update the Doughnut chart
  const chartData = {
    labels: ['Needs', 'Investments', 'Wants',],
    datasets: [{
      data: [total.Need.toFixed(2), total.Investment.toFixed(2), total.Want.toFixed(2), remainingIncome.toFixed(2)],
      backgroundColor: ['#ff6384', '#70f511', '#ffa500', '#bfbbbb'],
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
  };

  const chartElement = document.getElementById('budget-chart').getContext('2d');
  if (budgetChart) {
    budgetChart.destroy();
  }
  budgetChart = new Chart(chartElement, {
    type: 'doughnut',
    data: chartData,
    options: chartOptions,
  });

  // Update the comparison table
  document.getElementById('needs-current').textContent = `${needsPercent.toFixed(2)}%`;
  document.getElementById('investments-current').textContent = `${investmentsPercent.toFixed(2)}%`;
  document.getElementById('wants-current').textContent = `${wantsPercent.toFixed(2)}%`;

  // For 50/30/20 rule
  document.getElementById('needs-532').className = needsPercent <= 50 ? 'good' : 'bad';
  document.getElementById('investments-532').className = investmentsPercent <= 30 ? 'good' : 'bad';
  document.getElementById('wants-532').className = wantsPercent <= 20 ? 'good' : 'bad';

  // For 70/20/10 rule
  document.getElementById('needs-721').className = needsPercent <= 70 ? 'good' : 'bad';
  document.getElementById('investments-721').className = investmentsPercent <= 20 ? 'good' : 'bad';
  document.getElementById('wants-721').className = wantsPercent <= 10 ? 'good' : 'bad';

}

function populateMonthList() {
  const monthList = document.getElementById('month-list');
  monthList.innerHTML = ''; // Clear any existing items

  // Add the "Overall" option
  const overallItem = document.createElement('li');
  overallItem.textContent = 'Overall';
  overallItem.dataset.month = 'overall';
  monthList.appendChild(overallItem);

  // Get the unique months from income and expense entries
  const incomeEntries = JSON.parse(localStorage.getItem('incomeEntries')) || [];
  const expenseEntries = JSON.parse(localStorage.getItem('expenseEntries')) || [];

  const months = new Set();

  incomeEntries.forEach(entry => {
    const month = entry.date.slice(0, 7); // Get the "YYYY-MM" part of the date
    months.add(month);
  });

  expenseEntries.forEach(entry => {
    const month = entry.date.slice(0, 7); // Get the "YYYY-MM" part of the date
    months.add(month);
  });

  // Sort months in chronological order
  const sortedMonths = Array.from(months).sort();

  // Add each month to the sidebar
  sortedMonths.forEach(month => {
    const monthItem = document.createElement('li');
    const [year, monthIndex] = month.split('-');
    const monthName = new Date(year, monthIndex - 1).toLocaleString('default', { month: 'long', year: 'numeric' }); // Corrected display
    monthItem.textContent = monthName;
    monthItem.dataset.month = month;
    monthList.appendChild(monthItem);
  });

  // Add event listeners to each list item
  document.querySelectorAll('#month-list li').forEach(item => {
    item.addEventListener('click', function() {
      document.querySelectorAll('#month-list li').forEach(li => li.classList.remove('active'));
      this.classList.add('active');
      updateViewForMonth(this.dataset.month);
    });
  });
}

// Call this function when your application initializes
populateMonthList();

function updateViewForMonth(month) {
  if (month === 'overall') {
    // Clear filtered data and use overall data
    localStorage.removeItem('filteredIncomeEntries');
    localStorage.removeItem('filteredExpenseEntries');
    updateChart(); // Use overall data
    generateBudgetComparison(); // Use overall data
  } else {
    // Filter data for the selected month
    const incomeEntries = JSON.parse(localStorage.getItem('incomeEntries')) || [];
    const expenseEntries = JSON.parse(localStorage.getItem('expenseEntries')) || [];

    const filteredIncomeEntries = incomeEntries.filter(entry => entry.date.startsWith(month));
    const filteredExpenseEntries = expenseEntries.filter(entry => entry.date.startsWith(month));

    // Temporarily store filtered data for display purposes
    localStorage.setItem('filteredIncomeEntries', JSON.stringify(filteredIncomeEntries));
    localStorage.setItem('filteredExpenseEntries', JSON.stringify(filteredExpenseEntries));

    // Display the filtered data
    displayIncomeEntries('filteredIncomeEntries');
    displayExpenseEntries('filteredExpenseEntries');
    updateChart('filteredIncomeEntries', 'filteredExpenseEntries');
    generateBudgetComparison('filteredIncomeEntries', 'filteredExpenseEntries');
  }
}

// Function to initialize the page with the Overall data selected
function initializePage() {
  // Add 'active' class to the Overall button
  const overallButton = document.querySelector('[data-month="overall"]');
  if (overallButton) {
    overallButton.classList.add('active');
  }

  // Load the overall data
  updateViewForMonth('overall');
}
