// Top Buttons
// When Clear Button is clicked, clear all current data
document.getElementById('clear-data').addEventListener('click', function() {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      localStorage.clear();
      displayIncomeEntries();
      displayExpenseEntries();
      if (incomeChart) {
        incomeChart.destroy();
      }
      //alert("All data has been cleared.");
    }
});  

// When Export Button is clicked, export current data
document.getElementById('export-data').addEventListener('click', function() {
  const incomeEntries = JSON.parse(localStorage.getItem('incomeEntries')) || [];
  const expenseEntries = JSON.parse(localStorage.getItem('expenseEntries')) || [];

  let textContent = "Income Entries:\n";
  incomeEntries.forEach(entry => {
    textContent += `Date: ${entry.date}, Source: ${entry.source}, Amount: $${entry.amount}, Occurence: ${entry.occurrence || ''}\n`;
  });

  textContent += "\nExpense Entries:\n";
  expenseEntries.forEach(entry => {
    textContent += `Date: ${entry.date}, Category: ${entry.category}, Amount: $${entry.amount}, Tag: ${entry.tag || ''}\n`;
  });

  const blob = new Blob([textContent], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = "financial_data.txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
});
 
// When Import Button is clicked, import current data
document.getElementById('import-data').addEventListener('click', function() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'text/plain';

  fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
      const textContent = e.target.result;
      parseTextFile(textContent);
    };
    reader.readAsText(file);
  });

  fileInput.click();
});


// Income/Expense Forms
// When Income entry is submited, store it
document.getElementById('income-form').addEventListener('submit', function(e) {
  e.preventDefault();

  // Get form values
  const date = new Date(document.getElementById('income-date').value);
  const source = document.getElementById('income-source').value;
  const amount = parseFloat(document.getElementById('income-amount').value);
  const occurrence = document.getElementById('income-occurrence').value;

  // Determine the number of occurrences and the interval
  let occurrences = [];
  let interval;

  switch (occurrence) {
    case 'One-Time':
      interval = 0; // days
      break;
    case 'Weekly':
      interval = 7; // days
      break;
    case 'Bi-Weekly':
      interval = 14; // days
      break;
    case 'Monthly':
      interval = 30; // approximately a month (can adjust for specific months later)
      break;
    default:
      interval = 0;
  }

  // Generate occurrences
  if (occurrence === 'One-Time') {
    const newDate = new Date(date);
    occurrences.push({ date: newDate.toISOString().split('T')[0], source, amount, occurrence });
  }
  else {
    for (let i = 0; i < 4; i++) { // Let's assume we want to generate occurrences for 4 periods
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + (i * interval));
    occurrences.push({ date: newDate.toISOString().split('T')[0], source, amount, occurrence });
    }
  }

  // Retrieve existing income entries from localStorage or initialize an empty array
  let incomeEntries = JSON.parse(localStorage.getItem('incomeEntries')) || [];

  // Add the generated occurrences to the array
  incomeEntries = incomeEntries.concat(occurrences);

  // Save the updated income entries array back to localStorage
  localStorage.setItem('incomeEntries', JSON.stringify(incomeEntries));

  // Update the table and chart immediately
  displayIncomeEntries();
  updateChart();
  generatePlannerView();
  generateBudgetComparison();
  

  document.getElementById('chart-view').style.display = 'none';


  // Clear the form
  this.reset();
});

  
// When Expense entry is submited, store it
document.getElementById('expense-form').addEventListener('submit', function(e) {
    e.preventDefault();
  
    // Get form values
    const date = document.getElementById('expense-date').value;
    const category = document.getElementById('expense-category').value;
    const amount = document.getElementById('expense-amount').value;
    const tag = document.getElementById('expense-tag').value;
  
    // Create an expense entry object
    const expenseEntry = { date, category, amount, tag };
  
    // Retrieve existing expense entries from localStorage or initialize an empty array
    let expenseEntries = JSON.parse(localStorage.getItem('expenseEntries')) || [];
  
    // Add the new expense entry to the array
    expenseEntries.push(expenseEntry);
  
    // Save the updated expense entries array back to localStorage
    localStorage.setItem('expenseEntries', JSON.stringify(expenseEntries));
  
    // Update the table and chart immediately
    displayExpenseEntries();
    updateChart();
    generatePlannerView();
    generateBudgetComparison();
    //console.log('Expense Added:', expenseEntry);
  
    // Clear the form
    this.reset();
});


// Table
// Display the table at start and when pressed open window
document.getElementById('table-tab').addEventListener('click', function() {
    document.getElementById('table-tab').classList.add('active');
    document.getElementById('chart-tab').classList.remove('active');
    document.getElementById('planner-tab').classList.remove('active');
    document.getElementById('budget-rule-tab').classList.remove('active');

    document.getElementById('table-view').style.display = 'block';
    document.getElementById('chart-view').style.display = 'none';
    document.getElementById('planner-view').style.display = 'none';
    document.getElementById('budget-rule-view').style.display = 'none';

    document.getElementById('sidebar-container').style.display = 'none';
});

// Initial display when the page loads
displayIncomeEntries();
displayExpenseEntries();

// Chart
// Display chart window when pressed
document.getElementById('chart-tab').addEventListener('click', function() {
    document.getElementById('chart-tab').classList.add('active');
    document.getElementById('table-tab').classList.remove('active');
    document.getElementById('planner-tab').classList.remove('active');
    document.getElementById('budget-rule-tab').classList.remove('active');


    document.getElementById('table-view').style.display = 'none';
    document.getElementById('chart-view').style.display = 'block';
    document.getElementById('planner-view').style.display = 'none';
    document.getElementById('budget-rule-view').style.display = 'none';

    document.getElementById('sidebar-container').style.display = 'block';

    updateChart();
});
  
// Draw Text for Pie Chart & Budget Rule Chart
Chart.register({
    id: 'centerText',
    beforeDraw: function(chart) {

      const ctx = chart.ctx;
      const width = chart.width;
      const height = chart.height;
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Get totalIncome and totalExpenses
      const incomeEntries = JSON.parse(localStorage.getItem('filteredIncomeEntries')) || JSON.parse(localStorage.getItem('incomeEntries')) || [];
      const expenseEntries = JSON.parse(localStorage.getItem('filteredExpenseEntries')) || JSON.parse(localStorage.getItem('expenseEntries')) || [];
      const totalIncome = incomeEntries.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
      const totalExpenses = expenseEntries.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);

      ctx.restore();

      if (chart.canvas.id === 'income-expense-chart') {
        
        // Display Income and Expenses text
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if(totalExpenses > totalIncome) {
            ctx.fillStyle = '#007bff'; // Blue for income
            ctx.fillText(`Income: $${(totalIncome).toFixed(2)}`, centerX, centerY - 10);
            ctx.fillStyle = '#ff0000'; // Red for expenses
            ctx.fillText(`Expenses: $${(totalExpenses).toFixed(2)}`, centerX, centerY + 15);
            ctx.fillStyle = '#ffa500'; // Orange for exceeded
            ctx.fillText(`Exceeded: $${(totalIncome - totalExpenses).toFixed(2)}`, centerX, centerY + 40);
        }
        else {
            ctx.fillStyle = '#000000'; // Blue for income
            ctx.fillText(`Income: $${(totalIncome).toFixed(2)}`, centerX, centerY - 10);
            ctx.fillStyle = '#ff0000'; // Red for expenses
            ctx.fillText(`Expenses: $${(totalExpenses).toFixed(2)}`, centerX, centerY + 15);
            ctx.fillStyle = '#00ff00'; // Green for remaining
            ctx.fillText(`Remaining: $${(totalIncome - totalExpenses).toFixed(2)}`, centerX, centerY + 40);
        }
  
        ctx.save();
      }
      if (chart.canvas.id === 'budget-chart') {
        
        let total = { Need: 0, Investment: 0, Want: 0 };

        expenseEntries.forEach(entry => {
          // Check if the description is one of the expected categories
          if (total.hasOwnProperty(entry.tag)) {
            total[entry.tag] += parseFloat(entry.amount);
          }
        });
        

        ctx.restore();
        
        // Display Income and Expenses text
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';


        ctx.fillStyle = '#007bff'; // Blue for income
        ctx.fillText(`Income: $${totalIncome.toFixed(2)}`, centerX, centerY - 10);
        ctx.fillStyle = '#ff6384'; // Pink for Needs
        ctx.fillText(`Needs: $${total.Need.toFixed(2)}`, centerX, centerY + 15);
        ctx.fillStyle = '#70f511'; // Light Green for expenses
        ctx.fillText(`Investments: $${total.Investment.toFixed(2)}`, centerX, centerY + 40);
        ctx.fillStyle = '#ffa500'; // Orange for exceeded
        ctx.fillText(`Wants: $${total.Want.toFixed(2)}`, centerX, centerY + 65);

  
        ctx.save();
      }
    }
});

// Display the planner window when pressed
document.getElementById('planner-tab').addEventListener('click', function() {
  document.getElementById('table-tab').classList.remove('active');
  document.getElementById('chart-tab').classList.remove('active');
  document.getElementById('planner-tab').classList.add('active');
  document.getElementById('budget-rule-tab').classList.remove('active');


  document.getElementById('table-view').style.display = 'none';
  document.getElementById('chart-view').style.display = 'none';
  document.getElementById('planner-view').style.display = 'block';
  document.getElementById('budget-rule-view').style.display = 'none';

  document.getElementById('sidebar-container').style.display = 'none';

  generatePlannerView(); // Generate the planner view when the tab is clicked
});

// Display the dudget rule window when pressed
document.getElementById('budget-rule-tab').addEventListener('click', function() {
  document.getElementById('table-tab').classList.remove('active');
  document.getElementById('chart-tab').classList.remove('active');
  document.getElementById('planner-tab').classList.remove('active');
  document.getElementById('budget-rule-tab').classList.add('active');

  document.getElementById('table-view').style.display = 'none';
  document.getElementById('chart-view').style.display = 'none';
  document.getElementById('planner-view').style.display = 'none';
  document.getElementById('budget-rule-view').style.display = 'block';
  
  document.getElementById('sidebar-container').style.display = 'block';

  generateBudgetComparison();
});

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', function() {
  initializePage();
});