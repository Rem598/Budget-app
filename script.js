document.addEventListener('DOMContentLoaded', () => {
    const budgetInput = document.getElementById('monthly_budget');
    const setBudgetBtn = document.getElementById('set_budget');
    const incomeNameInput = document.getElementById('income_name');
    const incomeAmountInput = document.getElementById('income_amount');
    const addIncomeBtn = document.getElementById('add_income');
    const expenseNameInput = document.getElementById('expense_name');
    const expenseAmountInput = document.getElementById('expense_amount');
    const addExpenseBtn = document.getElementById('add_expense');
    const detailsTable = document.getElementById('details_table');
    const budgetValue = document.getElementById('budget_value');
    const totalIncomeDisplay = document.getElementById('total_income');
    const totalExpensesDisplay = document.getElementById('total_expenses');
    const remainingBalanceDisplay = document.getElementById('remaining_balance');

    // Initialize from localStorage
    let budget = localStorage.getItem('budget') ? parseFloat(localStorage.getItem('budget')) : 0;
    let totalIncome = localStorage.getItem('totalIncome') ? parseFloat(localStorage.getItem('totalIncome')) : 0;
    let totalExpenses = localStorage.getItem('totalExpenses') ? parseFloat(localStorage.getItem('totalExpenses')) : 0;
    let details = localStorage.getItem('details') ? JSON.parse(localStorage.getItem('details')) : [];

    // Initialize expense data for the chart
    let expenseData = {};

    // Create the chart first
    const ctx = document.getElementById('chart_div').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [], // expense names
            datasets: [{
                label: 'Expenses',
                data: [], // expense amounts
                backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#28a745', '#dc3545'], // Colors for each slice
            }]
        },
        options: {
            responsive: true
        }
    });

    // Now, update the UI with stored values
    budgetValue.innerText = `$${budget}`;
    totalIncomeDisplay.innerText = `$${totalIncome}`;
    totalExpensesDisplay.innerText = `$${totalExpenses}`;
    
    // Call this function after initializing totalIncome and totalExpenses
    updateRemainingBalance(); 
    updateDetailsTable();
    updateChart(); // Chart is initialized, so we can update it here

    // Set Budget
    setBudgetBtn.addEventListener('click', function() {
        budget = parseFloat(budgetInput.value);
        localStorage.setItem('budget', budget);
        budgetValue.innerText = `$${budget}`;
        updateRemainingBalance();
    });

    // Add Income
    addIncomeBtn.addEventListener('click', function() {
        const incomeName = incomeNameInput.value;
        const incomeAmount = parseFloat(incomeAmountInput.value);

        totalIncome += incomeAmount;
        details.push({ name: incomeName, type: 'Income', amount: incomeAmount });

        localStorage.setItem('totalIncome', totalIncome);
        localStorage.setItem('details', JSON.stringify(details));

        totalIncomeDisplay.innerText = `$${totalIncome}`;
        updateRemainingBalance();
        updateDetailsTable();
    });

    // Add Expense with Warning if Budget Surpassed
    addExpenseBtn.addEventListener('click', function() {
       const expenseName = expenseNameInput.value;
       const expenseAmount = parseFloat(expenseAmountInput.value);

       // Allow the user to add the expense but show a warning if it exceeds the budget
       totalExpenses += expenseAmount;
       details.push({ name: expenseName, type: 'Expense', amount: expenseAmount });

       // Add to expenseData for the chart
       if (expenseData[expenseName]) {
           expenseData[expenseName] += expenseAmount;
       } else {
           expenseData[expenseName] = expenseAmount;
       }

       localStorage.setItem('totalExpenses', totalExpenses);
       localStorage.setItem('details', JSON.stringify(details));

       totalExpensesDisplay.innerText = `$${totalExpenses}`;
       updateRemainingBalance();
       updateDetailsTable();
       updateChart(); // Update the chart when a new expense is added

       // Warn if the total expenses exceed the budget
       if (totalExpenses > budget) {
           alert("Warning: You have exceeded your budget!");
       }
    });

    // Update Remaining Balance
    function updateRemainingBalance() {
        const remainingBalance = totalIncome - totalExpenses;
        remainingBalanceDisplay.innerText = `$${remainingBalance.toFixed(2)}`;

        // Check if expenses exceed the budget and show a warning message
        if (totalExpenses > budget) {
            alert("Warning: You have exceeded your budget!");
        }
    }
    

    // Update Details Table
    function updateDetailsTable() {
        detailsTable.innerHTML = '';
        details.forEach((item, index) => {
            const row = `<tr>
                <td>${item.name}</td>
                <td>${item.type}</td>
                <td>$${item.amount.toFixed(2)}</td>
                <td><button class="delete-btn" data-index="${index}">Delete</button></td>
            </tr>`;
            detailsTable.innerHTML += row;
        });

        // Add event listener to all delete buttons
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const itemIndex = this.getAttribute('data-index');
                deleteItem(itemIndex);
            });
        });
    }

    // Delete an item and update totals and chart
    function deleteItem(index) {
        const item = details[index];
        
        if (item.type === 'Income') {
            totalIncome -= item.amount;
            localStorage.setItem('totalIncome', totalIncome);
            totalIncomeDisplay.innerText = `$${totalIncome}`;
        } else if (item.type === 'Expense') {
            totalExpenses -= item.amount;

            // Remove from expenseData for chart
            if (expenseData[item.name]) {
                expenseData[item.name] -= item.amount;
                if (expenseData[item.name] <= 0) {
                    delete expenseData[item.name]; // Remove the label if the amount is zero or negative
                }
            }

            localStorage.setItem('totalExpenses', totalExpenses);
            totalExpensesDisplay.innerText = `$${totalExpenses}`;
        }

        // Remove item from details and update localStorage
        details.splice(index, 1);
        localStorage.setItem('details', JSON.stringify(details));

        updateRemainingBalance();
        updateDetailsTable();
        updateChart();
    }

    // Update the pie chart whenever an expense is added
    function updateChart() {
        chart.data.labels = Object.keys(expenseData); // Expense names
        chart.data.datasets[0].data = Object.values(expenseData); // Expense amounts
        chart.update(); // Redraw the chart with the updated data
    }
});
