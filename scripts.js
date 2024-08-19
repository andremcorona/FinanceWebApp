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

// Function to display income entries
function displayIncomeEntries() {
    const incomeList = document.getElementById('income-entries');
    incomeList.innerHTML = ''; // Clear existing list
  
    const incomeEntries = JSON.parse(localStorage.getItem('incomeEntries')) || [];
  
    incomeEntries.forEach((entry, index) => {
      const li = document.createElement('li');
      li.textContent = `${entry.date} - ${entry.source}: $${entry.amount} (${entry.notes})`;
      incomeList.appendChild(li);
    });
}

// Function to display expense entries
function displayExpenseEntries() {
    const expenseList = document.getElementById('expense-entries');
    expenseList.innerHTML = ''; // Clear existing list
  
    const expenseEntries = JSON.parse(localStorage.getItem('expenseEntries')) || [];
  
    expenseEntries.forEach((entry, index) => {
      const li = document.createElement('li');
      li.textContent = `${entry.date} - ${entry.category}: $${entry.amount} (${entry.description})`;
      expenseList.appendChild(li);
    });
}

// Call this function after adding a new income entry
document.getElementById('income-form').addEventListener('submit', function() {
    displayIncomeEntries();
});
// Call this function after adding a new expense entry
document.getElementById('expense-form').addEventListener('submit', function() {
    displayExpenseEntries();
});
  
// Initial display when the page loads
displayIncomeEntries();
displayExpenseEntries();
