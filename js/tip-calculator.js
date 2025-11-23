// Tip Calculator JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const billAmountInput = document.getElementById('bill-amount');
    const tipPercentageInput = document.getElementById('tip-percentage');
    const peopleCountInput = document.getElementById('people-count');
    const roundUpCheckbox = document.getElementById('round-up');
    const resetBtn = document.getElementById('reset-btn');
    const tipButtons = document.querySelectorAll('.tip-btn');

    // Display elements
    const displayBill = document.getElementById('display-bill');
    const displayTip = document.getElementById('display-tip');
    const displayTotal = document.getElementById('display-total');
    const displayPerPerson = document.getElementById('display-per-person');
    const displayTipPerPerson = document.getElementById('display-tip-per-person');
    const displayTotalPerPerson = document.getElementById('display-total-per-person');

    // Get the divider and per-person elements for hiding/showing
    const calcDivider = document.querySelector('.calc-divider');
    const perPersonElements = [
        displayPerPerson.closest('.calc-item'),
        displayTipPerPerson.closest('.calc-item'),
        displayTotalPerPerson.closest('.calc-item')
    ];

    // Add event listeners
    billAmountInput.addEventListener('input', calculateTip);
    tipPercentageInput.addEventListener('input', calculateTip);
    peopleCountInput.addEventListener('input', calculateTip);
    roundUpCheckbox.addEventListener('change', calculateTip);
    resetBtn.addEventListener('click', resetCalculator);

    // Tip button event listeners
    tipButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            tipButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Set tip percentage
            const tipValue = this.getAttribute('data-tip');
            tipPercentageInput.value = tipValue;
            calculateTip();
        });
    });

    // Custom tip percentage input handler
    tipPercentageInput.addEventListener('input', function() {
        // Remove active class from preset buttons when custom value is entered
        tipButtons.forEach(btn => btn.classList.remove('active'));
    });

    function calculateTip() {
        // Get input values
        const billAmount = parseFloat(billAmountInput.value) || 0;
        const tipPercentage = parseFloat(tipPercentageInput.value) || 0;
        const peopleCount = parseInt(peopleCountInput.value) || 1;
        const shouldRoundUp = roundUpCheckbox.checked;

        // Validate inputs
        if (billAmount < 0) {
            billAmountInput.value = 0;
            return;
        }
        if (tipPercentage < 0) {
            tipPercentageInput.value = 0;
            return;
        }
        if (peopleCount < 1) {
            peopleCountInput.value = 1;
            return;
        }

        // Calculate tip and total
        let tipAmount = (billAmount * tipPercentage) / 100;
        let totalAmount = billAmount + tipAmount;

        // Round up if checkbox is checked
        if (shouldRoundUp && totalAmount > 0) {
            totalAmount = Math.ceil(totalAmount);
            tipAmount = totalAmount - billAmount;
        }

        // Calculate per person amounts
        const billPerPerson = billAmount / peopleCount;
        const tipPerPerson = tipAmount / peopleCount;
        const totalPerPerson = totalAmount / peopleCount;

        // Update display
        displayBill.textContent = formatCurrency(billAmount);
        displayTip.textContent = formatCurrency(tipAmount);
        displayTotal.textContent = formatCurrency(totalAmount);
        displayPerPerson.textContent = formatCurrency(billPerPerson);
        displayTipPerPerson.textContent = formatCurrency(tipPerPerson);
        displayTotalPerPerson.textContent = formatCurrency(totalPerPerson);

        // Show/hide per-person section based on people count
        if (peopleCount === 1) {
            // Hide divider and per-person elements
            calcDivider.style.display = 'none';
            perPersonElements.forEach(element => {
                if (element) element.style.display = 'none';
            });
        } else {
            // Show divider and per-person elements
            calcDivider.style.display = 'block';
            perPersonElements.forEach(element => {
                if (element) element.style.display = 'flex';
            });
        }
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    function resetCalculator() {
        // Clear all inputs
        billAmountInput.value = '';
        tipPercentageInput.value = '';
        peopleCountInput.value = '1';
        roundUpCheckbox.checked = false;

        // Remove active class from tip buttons
        tipButtons.forEach(btn => btn.classList.remove('active'));

        // Reset display
        displayBill.textContent = '$0.00';
        displayTip.textContent = '$0.00';
        displayTotal.textContent = '$0.00';
        displayPerPerson.textContent = '$0.00';
        displayTipPerPerson.textContent = '$0.00';
        displayTotalPerPerson.textContent = '$0.00';

        // Hide per-person section since we reset to 1 person
        calcDivider.style.display = 'none';
        perPersonElements.forEach(element => {
            if (element) element.style.display = 'none';
        });

        // Focus on bill amount input
        billAmountInput.focus();
    }

    // Initialize with default values
    calculateTip();
});