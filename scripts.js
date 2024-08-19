document.getElementById('income-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent the default form submission
  
    // Get form values
    const date = document.getElementById('income-date').value;
    const source = document.getElementById('income-source').value;
    const amount = document.getElementById('income-amount').value;
    const notes = document.getElementById('income-notes').value;
  
    // Store the data in an array (for now)
    const incomeEntry = { date, source, amount, notes };
    console.log('Income Added:', incomeEntry);
  
    // Clear the form
    this.reset();
});
  
document.getElementById('expense-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent the default form submission
  
    // Get form values
    const date = document.getElementById('expense-date').value;
    const category = document.getElementById('expense-category').value;
    const amount = document.getElementById('expense-amount').value;
    const description = document.getElementById('expense-description').value;
  
    // Store the data in an array (for now)
    const expenseEntry = { date, category, amount, description };
    console.log('Expense Added:', expenseEntry);
  
    // Clear the form
    this.reset();
});
  