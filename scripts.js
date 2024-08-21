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
    textContent += `Date: ${entry.date}, Source: ${entry.source}, Amount: $${entry.amount}, Notes: ${entry.notes || ''}\n`;
  });

  textContent += "\nExpense Entries:\n";
  expenseEntries.forEach(entry => {
    textContent += `Date: ${entry.date}, Category: ${entry.category}, Amount: $${entry.amount}, Description: ${entry.description || ''}\n`;
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
  
    // Update the table and chart immediately
    displayIncomeEntries();
    updateChart();
    //console.log('Income Added:', incomeEntry);
  
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
    const description = document.getElementById('expense-description').value;
  
    // Create an expense entry object
    const expenseEntry = { date, category, amount, description };
  
    // Retrieve existing expense entries from localStorage or initialize an empty array
    let expenseEntries = JSON.parse(localStorage.getItem('expenseEntries')) || [];
  
    // Add the new expense entry to the array
    expenseEntries.push(expenseEntry);
  
    // Save the updated expense entries array back to localStorage
    localStorage.setItem('expenseEntries', JSON.stringify(expenseEntries));
  
    // Update the table and chart immediately
    displayExpenseEntries();
    updateChart();
    //console.log('Expense Added:', expenseEntry);
  
    // Clear the form
    this.reset();
});


// Table
// Display the table at start and when pressed
document.getElementById('table-tab').addEventListener('click', function() {
    document.getElementById('table-tab').classList.add('active');
    document.getElementById('chart-tab').classList.remove('active');
    document.getElementById('table-view').style.display = 'block';
    document.getElementById('chart-view').style.display = 'none';
});

// Initial display when the page loads
displayIncomeEntries();
displayExpenseEntries();

// Chart
// Display chart when pressed
document.getElementById('chart-tab').addEventListener('click', function() {
    document.getElementById('chart-tab').classList.add('active');
    document.getElementById('table-tab').classList.remove('active');
    document.getElementById('table-view').style.display = 'none';
    document.getElementById('chart-view').style.display = 'block';
    updateChart();
});
  
// Draw Pie Chart 
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
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if(totalExpenses > totalIncome) {
            ctx.fillStyle = '#007bff'; // Blue for income
            ctx.fillText(`Income: $${totalIncome}`, centerX, centerY - 10);
            ctx.fillStyle = '#ff0000'; // Red for expenses
            ctx.fillText(`Expenses: $${totalExpenses}`, centerX, centerY + 15);
            ctx.fillStyle = '#ffa500'; // Yellow for exceeded
            ctx.fillText(`Exceeded: $${totalIncome - totalExpenses}`, centerX, centerY + 40);
        }
        else {
            ctx.fillStyle = '#000000'; // Blue for income
            ctx.fillText(`Income: $${totalIncome}`, centerX, centerY - 10);
            ctx.fillStyle = '#ff0000'; // Red for expenses
            ctx.fillText(`Expenses: $${totalExpenses}`, centerX, centerY + 15);
            ctx.fillStyle = '#00ff00'; // Green for remaining
            ctx.fillText(`Remaining: $${totalIncome - totalExpenses}`, centerX, centerY + 40);
        }
        
  
        ctx.save();
      }
    }
});