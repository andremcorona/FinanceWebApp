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
    generatePlannerView();
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
    const tag = document.getElementById('expense-tag').value;
  
    // Create an expense entry object
    const expenseEntry = { date, category, amount, description: tag };
  
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
    document.getElementById('budget-tab').classList.remove('active');

    document.getElementById('table-view').style.display = 'block';
    document.getElementById('chart-view').style.display = 'none';
    document.getElementById('planner-view').style.display = 'none';
    document.getElementById('budget-view').style.display = 'none';
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
    document.getElementById('budget-tab').classList.remove('active');


    document.getElementById('table-view').style.display = 'none';
    document.getElementById('chart-view').style.display = 'block';
    document.getElementById('planner-view').style.display = 'none';
    document.getElementById('budget-view').style.display = 'none';

    updateChart();
});
  
// Draw Pie Chart & Budget Rule Chart
Chart.register({
    id: 'centerText',
    beforeDraw: function(chart) {
      if (chart.canvas.id === 'income-expense-chart') {
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

      if (chart.canvas.id === 'budget-chart-532') {
        const ctx = chart.ctx;
        const width = chart.width;
        const height = chart.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Get totalIncome and totalExpenses
        const expenseEntries = JSON.parse(localStorage.getItem('expenseEntries')) || [];
        const totalExpenses = expenseEntries.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);

        let total = { Need: 0, Investment: 0, Want: 0 };
  
        expenseEntries.forEach(entry => {
          total[entry.description] += parseFloat(entry.amount);
        });

        const needPercent = total.Need / totalExpenses * 100;
        const investmentPercent = total.Investment / totalExpenses * 100;
        const wantPercent = total.Want / totalExpenses * 100;
  
        ctx.restore();
        
        // Display Income and Expenses text
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if(needPercent <= 50) {
          ctx.fillStyle = '#00ff00';
          ctx.fillText(`Needs: ${(needPercent).toFixed(2)}%`, centerX, centerY - 10);
        }
        else {
          ctx.fillStyle = '#ff0000'; 
          ctx.fillText(`Needs: ${(needPercent).toFixed(2)}%`, centerX, centerY - 10);
        }

        if(investmentPercent <= 30) {
          ctx.fillStyle = '#00ff00';
          ctx.fillText(`Investments: ${(investmentPercent).toFixed(2)}%`, centerX, centerY + 15);
        }
        else {
          ctx.fillStyle = '#ff0000';
          ctx.fillText(`Investments: ${(investmentPercent).toFixed(2)}%`, centerX, centerY + 15);
        }

        if(wantPercent <= 20) {
          ctx.fillStyle = '00ff00';
          ctx.fillText(`Wants: ${(wantPercent).toFixed(2)}%`, centerX, centerY + 40);
        }
        else {
          ctx.fillStyle = 'ff0000';
          ctx.fillText(`Wants: ${(wantPercent).toFixed(2)}%`, centerX, centerY + 40);
        }
  
        ctx.save();
      }

      if (chart.canvas.id === 'budget-chart-721') {
        const ctx = chart.ctx;
        const width = chart.width;
        const height = chart.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Get totalExpenses
        const expenseEntries = JSON.parse(localStorage.getItem('expenseEntries')) || [];
        const totalExpenses = expenseEntries.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);

        let total = { Need: 0, Investment: 0, Want: 0 };
  
        expenseEntries.forEach(entry => {
          total[entry.description] += parseFloat(entry.amount);
        });

        const needPercent = total.Need / totalExpenses * 100;
        const investmentPercent = total.Investment / totalExpenses * 100;
        const wantPercent = total.Want / totalExpenses * 100;
  
        ctx.restore();
        
        // Display Income and Expenses text
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if(needPercent <= 70) {
          ctx.fillStyle = '#00ff00';
          ctx.fillText(`Needs: ${(needPercent).toFixed(2)}%`, centerX, centerY - 10);
        }
        else {
          ctx.fillStyle = '#ff0000'; 
          ctx.fillText(`Needs: ${(needPercent).toFixed(2)}%`, centerX, centerY - 10);
        }

        if(investmentPercent <= 20) {
          ctx.fillStyle = '#00ff00';
          ctx.fillText(`Investments: ${(investmentPercent).toFixed(2)}%`, centerX, centerY + 15);
        }
        else {
          ctx.fillStyle = '#ff0000';
          ctx.fillText(`Investments: ${(investmentPercent).toFixed(2)}%`, centerX, centerY + 15);
        }

        if(wantPercent <= 10) {
          ctx.fillStyle = '00ff00';
          ctx.fillText(`Wants: ${(wantPercent).toFixed(2)}%`, centerX, centerY + 40);
        }
        else {
          ctx.fillStyle = 'ff0000';
          ctx.fillText(`Wants: ${(wantPercent).toFixed(2)}%`, centerX, centerY + 40);
        }

        ctx.save();
      }
    }
});

// Display the planner window when pressed
document.getElementById('planner-tab').addEventListener('click', function() {
  document.getElementById('table-tab').classList.remove('active');
  document.getElementById('chart-tab').classList.remove('active');
  document.getElementById('planner-tab').classList.add('active');
  document.getElementById('budget-tab').classList.remove('active');


  document.getElementById('table-view').style.display = 'none';
  document.getElementById('chart-view').style.display = 'none';
  document.getElementById('planner-view').style.display = 'block';
  document.getElementById('budget-view').style.display = 'none';

  generatePlannerView(); // Generate the planner view when the tab is clicked
});

// Display the dudget rule window when pressed
document.getElementById('budget-tab').addEventListener('click', function() {
  document.getElementById('table-tab').classList.remove('active');
  document.getElementById('chart-tab').classList.remove('active');
  document.getElementById('planner-tab').classList.remove('active');
  document.getElementById('budget-tab').classList.add('active');

  document.getElementById('table-view').style.display = 'none';
  document.getElementById('chart-view').style.display = 'none';
  document.getElementById('planner-view').style.display = 'none';
  document.getElementById('budget-view').style.display = 'block';

  generateBudgetCharts();
});
